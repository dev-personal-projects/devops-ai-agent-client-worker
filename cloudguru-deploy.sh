#!/bin/bash

# Secure Deployment Script for Azure Container Apps using Managed Identity

set -euo pipefail

declare -r YELLOW='\033[0;33m'
declare -r RED='\033[0;31m'
declare -r GREEN='\033[0;32m'
declare -r BLUE='\033[0;34m'
declare -r NC='\033[0m'

log_error()    { echo -e "${RED}[ERROR] $*${NC}" >&2; }
log_info()     { echo -e "${BLUE}[INFO] $*${NC}"; }
log_success()  { echo -e "${GREEN}[SUCCESS] $*${NC}"; }
log_warning()  { echo -e "${YELLOW}[WARNING] $*${NC}"; }

handle_error() {
    local line_number=$1 command=$2
    log_error "Error at line $line_number: $command"
    exit 1
}

trap 'handle_error $LINENO "$BASH_COMMAND"' ERR

initialize_configuration() {
    local dir
    dir=$(pwd)
    while [[ "$dir" != "/" ]]; do
        if [[ -f "$dir/globalenv.config" ]]; then
            # shellcheck source=/dev/null
            source "$dir/globalenv.config"
            return 0
        fi
        dir=$(dirname "$dir")
    done
    log_error "globalenv.config not found"
    exit 1
}

validate_configuration() {
    local required_vars=(
        "ENVIRONMENT_PREFIX"
        "PROJECT_PREFIX"
        "PROJECT_LOCATION"
        "LOG_FOLDER"
        "PROJECT_RESOURCE_GROUP"
        "PROJECT_SUBSCRIPTION_ID"
    )
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "$var is not set"
            return 1
        fi
    done
}

setup_azure_context() {
    log_info "Authenticating Azure CLI..."
    if ! az account show &>/dev/null; then
        log_warning "Azure CLI not logged in. Opening login..."
        az login
    fi
    az account set --subscription "${PROJECT_SUBSCRIPTION_ID}"
    current_subscription=$(az account show --query id -o tsv)
    if [[ "$current_subscription" != "$PROJECT_SUBSCRIPTION_ID" ]]; then
        log_error "Failed to set subscription. Expected: $PROJECT_SUBSCRIPTION_ID"
        return 1
    fi
}

prepare_container_registry() {
    local registry_name="${ENVIRONMENT_PREFIX}${PROJECT_PREFIX}contregistry"
    log_info "Checking registry: $registry_name"

    if ! az acr show --name "$registry_name" &>/dev/null; then
        log_warning "Registry not found. Creating..."
        az acr create --name "$registry_name" \
                      --resource-group "$PROJECT_RESOURCE_GROUP" \
                      --sku Basic --admin-enabled true
    else
        log_info "Enabling admin access on existing registry..."
        az acr update --name "$registry_name" --admin-enabled true
    fi

    log_info "Registry ready with admin access enabled."
}

prepare_container_apps_environment() {
    local env_name="${ENVIRONMENT_PREFIX}-${PROJECT_PREFIX}-BackendContainerAppsEnv"
    log_info "Setting up Container Apps Environment: $env_name"

    if ! az containerapp env show --name "$env_name" --resource-group "$PROJECT_RESOURCE_GROUP" &>/dev/null; then
        log_warning "Environment not found. Creating..."
        az containerapp env create --name "$env_name" \
                                   --resource-group "$PROJECT_RESOURCE_GROUP" \
                                   --location "$PROJECT_LOCATION"
    fi
}

deploy_container_app() {
    local env_name="${ENVIRONMENT_PREFIX}-${PROJECT_PREFIX}-BackendContainerAppsEnv"
    local app_name="${ENVIRONMENT_PREFIX}-${PROJECT_PREFIX}-worker"
    local registry_name="${ENVIRONMENT_PREFIX}${PROJECT_PREFIX}contregistry"
    local registry_url="${registry_name}.azurecr.io"
    local repo_url="https://github.com/dev-personal-projects/devops-ai-agent-client-worker"
    local branch="main"

    log_info "Getting registry credentials..."
    local registry_username registry_password
    registry_username=$(az acr credential show --name "$registry_name" --query username -o tsv)
    registry_password=$(az acr credential show --name "$registry_name" --query passwords[0].value -o tsv)

    log_info "Deploying: $app_name"

    az containerapp up \
        --name "$app_name" \
        --resource-group "$PROJECT_RESOURCE_GROUP" \
        --environment "$env_name" \
        --repo "$repo_url" \
        --branch "$branch" \
        --registry-server "$registry_url" \
        --registry-username "$registry_username" \
        --registry-password "$registry_password" \
        --ingress external \
        --target-port 8000 \
        --env-vars PROJECT_STAGE="${ENVIRONMENT_PREFIX}"

    az containerapp update \
        --name "$app_name" \
        --resource-group "$PROJECT_RESOURCE_GROUP" \
        --cpu 0.25 \
        --memory 0.5Gi \
        --min-replicas 1 \
        --max-replicas 10
}

main() {
    initialize_configuration
    validate_configuration

    local timestamp log_file
    timestamp=$(date +"%Y%m%d_%H%M%S")
    log_file="${LOG_FOLDER}/deploy_worker_${timestamp}.log"

    exec > >(tee -a "$log_file") 2>&1

    log_info "Starting secure deployment workflow..."

    setup_azure_context
    prepare_container_registry
    prepare_container_apps_environment
    deploy_container_app

    log_success "Deployment complete"
    log_info "Logs saved at: $log_file"
}

main "$@"