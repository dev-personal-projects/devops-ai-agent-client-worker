#!/bin/bash

# Enhanced Deployment Script for Azure Container Apps with Robust Error Handling and Logging

# Strict mode for better error handling
set -euo pipefail

# Define color codes for enhanced readability
declare -r YELLOW='\033[0;33m'
declare -r RED='\033[0;31m'
declare -r GREEN='\033[0;32m'
declare -r BLUE='\033[0;34m'
declare -r NC='\033[0m' # No Color

# Logging and error handling functions
log_error() {
    echo -e "${RED}[ERROR] $*${NC}" >&2
}

log_info() {
    echo -e "${BLUE}[INFO] $*${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $*${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING] $*${NC}"
}

# Error handler
handle_error() {
    local line_number=$1
    local command=$2
    log_error "Error occurred at line $line_number: $command"
    exit 1
}

# Trap errors
trap 'handle_error $LINENO "$BASH_COMMAND"' ERR

# Check for required dependencies
check_dependencies() {
    local dependencies=("az" "jq")
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &>/dev/null; then
            log_error "$dep is not installed. Please install it and try again."
            exit 1
        fi
    done
}

# Configuration and Initialization
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
    log_error "globalenvdev.config not found"
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
            log_error "Required environment variable $var is not set"
            return 1
        fi
    done
}

# Azure authentication and subscription setup
setup_azure_context() {
    log_info "Checking Azure CLI authentication" 
    if ! az account show &>/dev/null; then
        log_warning "Not logged in to Azure CLI. Initiating login..."
        az login
    fi

    log_info "Setting Azure subscription to ${PROJECT_SUBSCRIPTION_ID}"
    az account set --subscription "${PROJECT_SUBSCRIPTION_ID}"

    local current_subscription
    current_subscription=$(az account show --query id -o tsv)
    if [[ "$current_subscription" != "$PROJECT_SUBSCRIPTION_ID" ]]; then
        log_error "Failed to set Azure subscription. Current: $current_subscription, Expected: $PROJECT_SUBSCRIPTION_ID"
        return 1
    fi
}

# Service Principal Management
setup_service_principal() {
    local sp_name="${ENVIRONMENT_PREFIX}-${PROJECT_PREFIX}-sp"
    local registry_name="${ENVIRONMENT_PREFIX}${PROJECT_PREFIX}contregistry"

    # Use existing credentials if available
    if [[ -n "${SERVICE_PRINCIPAL_CLIENT_ID:-}" && -n "${SERVICE_PRINCIPAL_CLIENT_SECRET:-}" ]]; then
        log_info "Using pre-configured service principal"
        return 0
    fi

    log_info "Checking for service principal: $sp_name"
    if az ad sp show --id "http://$sp_name" &>/dev/null; then
        log_warning "Service principal exists but credentials not provided."
        log_warning "Set SERVICE_PRINCIPAL_CLIENT_ID and SERVICE_PRINCIPAL_CLIENT_SECRET or reset credentials with:"
        log_warning "az ad sp credential reset --name $sp_name"
        exit 1
    else
        log_warning "Creating new service principal with required permissions..."
        local sub_id=$PROJECT_SUBSCRIPTION_ID
        local rg=$PROJECT_RESOURCE_GROUP
        
        # Create service principal with Contributor access
        local sp_output
        sp_output=$(az ad sp create-for-rbac --name "$sp_name" \
            --scopes "/subscriptions/$sub_id/resourceGroups/$rg" \
            --role "Contributor" \
            --query "{appId: appId, password: password}" -o json)

        export SERVICE_PRINCIPAL_CLIENT_ID=$(jq -r '.appId' <<< "$sp_output")
        export SERVICE_PRINCIPAL_CLIENT_SECRET=$(jq -r '.password' <<< "$sp_output")

        # Assign ACR permissions
        local acr_id
        acr_id=$(az acr show --name "$registry_name" --query id -o tsv)
        az role assignment create --assignee "$SERVICE_PRINCIPAL_CLIENT_ID" \
            --role "AcrPush" \
            --scope "$acr_id"

        log_success "Service principal created. Client ID: $SERVICE_PRINCIPAL_CLIENT_ID"
        log_warning "SAVE THESE CREDENTIALS IMMEDIATELY:"
        log_warning "Client Secret: $SERVICE_PRINCIPAL_CLIENT_SECRET"
    fi
}

# Container Registry Management
prepare_container_registry() {
    local registry_name="${ENVIRONMENT_PREFIX}${PROJECT_PREFIX}contregistry"
    
    log_info "Checking Azure Container Registry: $registry_name"
    if ! az acr show --name "$registry_name" &>/dev/null; then
        log_warning "Creating container registry..."
        az acr create \
            --name "$registry_name" \
            --resource-group "$PROJECT_RESOURCE_GROUP" \
            --sku Basic \
            --admin-enabled true
    fi
    az acr login --name "$registry_name"
}

# Container Apps Environment Setup
prepare_container_apps_environment() {
    local environment_name="${ENVIRONMENT_PREFIX}-${PROJECT_PREFIX}-BackendContainerAppsEnv"
    
    log_info "Preparing environment: $environment_name"
    if ! az containerapp env show --name "$environment_name" --resource-group "$PROJECT_RESOURCE_GROUP" &>/dev/null; then
        az containerapp env create \
            --name "$environment_name" \
            --resource-group "$PROJECT_RESOURCE_GROUP" \
            --location "$PROJECT_LOCATION"
    fi
}

# Container Deployment
deploy_container_app() {
    local environment_name="${ENVIRONMENT_PREFIX}-${PROJECT_PREFIX}-BackendContainerAppsEnv"
    local container_app_name="${ENVIRONMENT_PREFIX}-${PROJECT_PREFIX}-worker"
    local registry_url="${ENVIRONMENT_PREFIX}${PROJECT_PREFIX}contregistry.azurecr.io"
    local repo_url="https://github.com/dev-personal-projects/devops-ai-agent-client-worker"
    local branch="main"

    log_info "Deploying container app: $container_app_name"
    az containerapp up \
        --name "$container_app_name" \
        --resource-group "$PROJECT_RESOURCE_GROUP" \
        --environment "$environment_name" \
        --repo "$repo_url" \
        --branch "$branch" \
        --registry-server "$registry_url" \
        --ingress external \
        --target-port 8000 \
        --service-principal-client-id "$SERVICE_PRINCIPAL_CLIENT_ID" \
        --service-principal-client-secret "$SERVICE_PRINCIPAL_CLIENT_SECRET"

    log_info "Optimizing container resources..."
    az containerapp update \
        --name "$container_app_name" \
        --resource-group "$PROJECT_RESOURCE_GROUP" \
        --cpu 0.25 \
        --memory 0.5Gi \
        --min-replicas 1 \
        --max-replicas 10
}

# Main workflow
main() {
    initialize_configuration
    validate_configuration
    check_dependencies

    local timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    local log_file="${LOG_FOLDER}/deploy_worker_${timestamp}.log"
    exec > >(tee -a "$log_file") 2>&1

    log_info "Starting deployment workflow"
    setup_azure_context
    prepare_container_registry
    setup_service_principal
    prepare_container_apps_environment
    deploy_container_app

    log_success "Deployment completed successfully"
    log_info "Detailed logs available at: $log_file"
}

main "$@"