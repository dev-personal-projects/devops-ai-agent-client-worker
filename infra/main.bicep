targetScope = 'resourceGroup'

@description('Stage/environment name.')
@allowed(['dev','test','staging','prod','client'])
param stage string = 'dev'

@description('Matches your ENVIRONMENT_PREFIX (e.g., "").')
param environmentPrefix string

@description('Matches your PROJECT_PREFIX (e.g., "client").')
param projectPrefix string

@description('Azure region (e.g., "East US").')
param location string

@description('ACR SKU to mirror your current flow.')
@allowed(['Basic','Standard','Premium'])
param acrSku string = 'Basic'

@description('Keep ACR admin enabled so your script can az acr login.')
param acrAdminEnabled bool = true

// NEW: choose logs destination; default to azure-monitor to avoid workspace wiring
@allowed(['azure-monitor','log-analytics'])
param logsDestination string = 'azure-monitor'

var acrName = toLower('${environmentPrefix}${projectPrefix}contregistry')
var managedEnvName = '${environmentPrefix}-${projectPrefix}-BackendContainerAppsEnv'

var tags = {
  stage: stage
  env: environmentPrefix
  project: projectPrefix
}

resource acr 'Microsoft.ContainerRegistry/registries@2023-06-01-preview' = {
  name: acrName
  location: location
  sku: { name: acrSku }
  properties: {
    adminUserEnabled: acrAdminEnabled
    publicNetworkAccess: 'Enabled'
  }
  tags: tags
}

resource managedEnv 'Microsoft.App/managedEnvironments@2025-01-01' = {
  name: managedEnvName
  location: location
  properties: {
    // FIX: use a supported destination. If you truly want "none", delete this whole block.
    appLogsConfiguration: {
      destination: logsDestination
    }
    workloadProfiles: [
      {
        workloadProfileType: 'Consumption'
        name: 'Consumption'
      }
    ]
  }
  tags: tags
}

output registryName string = acr.name
output registryLoginServer string = '${acr.name}.azurecr.io'
output managedEnvironmentName string = managedEnv.name
output managedEnvironmentId string = managedEnv.id
