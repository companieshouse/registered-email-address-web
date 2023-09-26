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

  kms_alias       = "alias/${var.aws_profile}/environment-services-kms"
  service_secrets = jsondecode(data.vault_generic_secret.service_secrets.data_json)

  parameter_store_secrets = {
    "chs_api_key"   = local.service_secrets["chs_api_key"]
    "account_url"   = local.service_secrets["account_url"]
    "cache_server"  = local.service_secrets["cache_server"]
    "cookie_secret" = local.service_secrets["cookie_secret"]
    "cookie_domain" = local.service_secrets["cookie_domain"]
    "cookie_name"   = local.service_secrets["cookie_name"]
  }

  vpc_name      = local.service_secrets["vpc_name"]
  chs_api_key   = local.service_secrets["chs_api_key"]
  account_url   = local.service_secrets["account_url"]
  cache_server  = local.service_secrets["cache_server"]
  chs_url       = local.service_secrets["chs_url"]
  cookie_secret = local.service_secrets["cookie_secret"]
  cookie_domain = local.service_secrets["cookie_domain"]
  cookie_name   = local.service_secrets["cookie_name"]

  # create a map of secret name => secret arn to pass into ecs service module
  # using the trimprefix function to remove the prefixed path from the secret name
  secrets_arn_map = {
    for sec in data.aws_ssm_parameter.secret :
    trimprefix(sec.name, "/${local.name_prefix}/") => sec.arn
  }

  service_secrets_arn_map = {
    for sec in module.secrets.secrets :
    trimprefix(sec.name, "/${local.service_name}-${var.environment}/") => sec.arn
  }

  # TODO: task_secrets don't seem to correspond with 'parameter_store_secrets'. What is the difference?
  task_secrets = [
    { "name" : "COOKIE_SECRET", "valueFrom" : "${local.service_secrets_arn_map.cookie_secret}" },
    { "name" : "COOKIE_DOMAIN", "valueFrom" : "${local.service_secrets_arn_map.cookie_domain}" },
    { "name" : "COOKIE_NAME", "valueFrom" : "${local.service_secrets_arn_map.cookie_name}" },
    { "name" : "CHS_API_KEY", "valueFrom" : "${local.service_secrets_arn_map.chs_api_key}" },
    { "name" : "CACHE_SERVER", "valueFrom" : "${local.service_secrets_arn_map.cache_server}" },
    { "name" : "ACCOUNT_URL", "valueFrom" : "${local.service_secrets_arn_map.account_url}" },
  ]

  task_environment = [
    { "name" : "PORT", "value" : "${local.container_port}" },
    { "name" : "LOG_LEVEL", "value" : "${var.log_level}" },
    { "name" : "CHS_URL", "value" : "${var.chs_url}" },
    { "name" : "CDN_HOST", "value" : "//${var.cdn_host}" },
    { "name" : "API_URL", "value" : "${var.api_url}" },
    { "name" : "SESSION_COUNTDOWN", "value" : "${var.session_countdown}" },
    { "name" : "SESSION_TIMEOUT", "value" : "${var.session_timeout}" },
    { "name" : "CDN_URL_CSS", "value" : "${var.cdn_url_css}" },
    { "name" : "CDN_URL_JS", "value" : "${var.cdn_url_js}" },
    { "name" : "DEFAULT_SESSION_EXPIRATION", "value" : "${var.default_session_expiration}" },
    { "name" : "PIKWIK_URL", "value" : "${var.pikwik_url}" },
    { "name" : "PIKWIK_SITE_ID", "value" : "${var.pikwik_site_id}" },
    { "name" : "PIKWIK_GOAL_ID", "value" : "${var.pikwik_start_goal_id}" },
    { "name" : "ORACLE_QUERY_API_URL", "value" : "${var.oracle_query_api_url}" }
  ]
}
