# ------------------------------------------------------------------------------
# Environment
# ------------------------------------------------------------------------------
variable "environment" {
  type        = string
  description = "The environment name, defined in envrionments vars."
}
variable "aws_region" {
  default     = "eu-west-2"
  type        = string
  description = "The AWS region for deployment."
}
variable "aws_profile" {
  default     = "development-eu-west-2"
  type        = string
  description = "The AWS profile to use for deployment."
}

# ------------------------------------------------------------------------------
# Docker Container
# ------------------------------------------------------------------------------
variable "docker_registry" {
  type        = string
  description = "The FQDN of the Docker registry."
}

# ------------------------------------------------------------------------------
# Service performance and scaling configs
# ------------------------------------------------------------------------------
variable "desired_task_count" {
  type        = number
  description = "The desired ECS task count for this service"
  default     = 1 # defaulted low for dev environments, override for production
}
variable "required_cpus" {
  type        = number
  description = "The required cpu resource for this service. 1024 here is 1 vCPU"
  default     = 128 # defaulted low for dev environments, override for production
}
variable "required_memory" {
  type        = number
  description = "The required memory for this service"
  default     = 256 # defaulted low for node service in dev environments, override for production
}
variable "use_fargate" {
  type        = bool
  description = "If true, sets the required capabilities for all containers in the task definition to use FARGATE, false uses EC2"
  default     = false
}
# ------------------------------------------------------------------------------
# Service environment variable configs
# ------------------------------------------------------------------------------
variable "log_level" {
  default     = "info"
  type        = string
  description = "The log level for services to use: trace, debug, info or error"
}

variable "chs_url" {
  type = string
}
variable "cdn_host" {
  type = string
}

variable "cdn_url_css" {
  type    = string
  default = "/css"
}

variable "cdn_url_js" {
  type    = string
  default = "/js"
}
variable "registered_email_address_web_version" {
  type        = string
  description = "The version of the registered email address web container to run."
}

variable "cookie_domain" {
  type = string
}
variable "cookie_name" {
  type    = string
  default = "__SID"
}
variable "cookie_secure_only" {
  type    = string
  default = "0"
}
variable "cookie_expiration_in_seconds" {
  type    = string
  default = "3600"
}
variable "default_session_expiration" {
  type    = string
  default = "3600"
}
variable "api_url" {
  type    = string
  default = "http://api.chs.local:4001"
}

variable "session_timeout" {
  type    = string
  default = "30"
}
variable "session_countdown" {
  type    = string
  default = "60"
}

variable "pikwik_url" {
  type    = string
  default = "https://matomo.platform.aws.chdev.org"
}

variable "pikwik_site_id" {
  type    = string
  default = "24"
}

variable "pikwik_start_goal_id" {
  type    = string
  default = "3"
}

variable "oracle_query_api_url" {
  type    = string
  default = "http://api.chs.local:4001"
}