# Define all hardcoded local variable and local variables looked up from data resources
locals {
  stack_name                = "filing-maintain" # this must match the stack name the service deploys into
  name_prefix               = "${local.stack_name}-${var.environment}"
  service_name              = "registered-email-address-web"
  container_port            = "3000" # default node port required here until prod docker container is built allowing port change via env var
  docker_repo               = "registered-email-address-web"
  lb_listener_rule_priority = 39
  lb_listener_paths         = ["/registered-email-address/*"]
  healthcheck_path          = "/registered-email-address" #healthcheck path for registered-email-address web
  healthcheck_matcher       = "200-302"

  kms_alias                 = "alias/${var.aws_profile}/environment-services-kms"
  service_secrets           = jsondecode(data.vault_generic_secret.service_secrets.data_json)

  parameter_store_secrets    = {
    "vpc_name"                  = local.service_secrets["vpc_name"]
    "chs_api_key"               = local.service_secrets["chs_api_key"]
    "internal_api_url"          = local.service_secrets["internal_api_url"]
    "account_url"               = local.service_secrets["account_url"]
    "cache_server"              = local.service_secrets["cache_server"]
    "oauth2_client_id"          = local.service_secrets["oauth2_client_id"]
    "oauth2_client_secret"      = local.service_secrets["oauth2_client_secret"]
    "oauth2_request_key"        = local.service_secrets["oauth2_request_key"]
  }

  vpc_name                  = local.service_secrets["vpc_name"]
  chs_api_key               = local.service_secrets["chs_api_key"]
  internal_api_url          = local.service_secrets["internal_api_url"]
  account_url               = local.service_secrets["account_url"]
  cache_server              = local.service_secrets["cache_server"]
  oauth2_client_id          = local.service_secrets["oauth2_client_id"]
  oauth2_client_secret      = local.service_secrets["oauth2_client_secret"]
  oauth2_request_key        = local.service_secrets["oauth2_request_key"]

  # create a map of secret name => secret arn to pass into ecs service module
  # using the trimprefix function to remove the prefixed path from the secret name
  secrets_arn_map = {
    for sec in data.aws_ssm_parameter.secret:
      trimprefix(sec.name, "/${local.name_prefix}/") => sec.arn
  }

  service_secrets_arn_map = {
    for sec in module.secrets.secrets:
      trimprefix(sec.name, "/${local.service_name}-${var.environment}/") => sec.arn
  }

  # TODO: task_secrets don't seem to correspond with 'parameter_store_secrets'. What is the difference?
  task_secrets = [
    { "name": "COOKIE_SECRET", "valueFrom": "${local.secrets_arn_map.web-oauth2-cookie-secret}" },
    { "name": "CHS_API_KEY", "valueFrom": "${local.service_secrets_arn_map.chs_api_key}" },
    { "name": "CACHE_SERVER", "valueFrom": "${local.service_secrets_arn_map.cache_server}" },
    { "name": "OAUTH2_CLIENT_ID", "valueFrom": "${local.service_secrets_arn_map.oauth2_client_id}" },  
    { "name": "OAUTH2_CLIENT_SECRET", "valueFrom": "${local.service_secrets_arn_map.oauth2_client_secret}" },
    { "name": "OAUTH2_REQUEST_KEY", "valueFrom": "${local.service_secrets_arn_map.oauth2_request_key}" },
    { "name": "INTERNAL_API_URL", "valueFrom": "${local.service_secrets_arn_map.internal_api_url}" },
    { "name": "ACCOUNT_URL", "valueFrom": "${local.service_secrets_arn_map.account_url}" }
  ]

  task_environment = [
    { "name": "NODE_PORT", "value": "${local.container_port}" },
    { "name": "LOG_LEVEL", "value": "${var.log_level}" },
    { "name": "CHS_URL", "value": "${var.chs_url}" },
    { "name": "CDN_HOST", "value": "//${var.cdn_host}" },
    { "name": "HUMAN_LOG", "value": "${var.human_log}" },
    { "name": "API_URL", "value": "${var.api_url}" },
    { "name": "SESSION_COUNTDOWN": "${var.session_countdown}" },
    { "name": "SESSION_TIMEOUT": "${var.session_timeout}" }
  ]
}