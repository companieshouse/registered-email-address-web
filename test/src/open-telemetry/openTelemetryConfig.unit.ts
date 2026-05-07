import {assert, expect} from "chai";

const CONFIG_PATH = "../../../src/open-telemetry/openTelemetry.config";

describe("openTelemetryConfig", () => {

  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = {...OLD_ENV}
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4317"
    delete require.cache[require.resolve(CONFIG_PATH)]
  })

  afterEach(() => {
    process.env = OLD_ENV
    delete require.cache[require.resolve(CONFIG_PATH)]
  })

  it("returns correct config when all required env vars are set", () => {
    jest.isolateModules(() => {
      process.env.OTEL_SERVICE_NAME = "dissolution-web"
      process.env.OTEL_LOG_ENABLED = "true"
      const config = require(CONFIG_PATH).default
      assert.equal(config.serviceName, "dissolution-web")
      assert.equal(config.endpoints.traceExporterUrl, "http://localhost:4317/v1/traces")
      assert.equal(config.endpoints.metricsExporterUrl, "http://localhost:4317/v1/metrics")
      assert.isTrue(config.enabled)
    })
  })

  it("throws an error if OTEL_EXPORTER_OTLP_ENDPOINT is not set", () => {
    jest.isolateModules(() => {
      delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      process.env.OTEL_LOG_ENABLED = "true"
      assert.throws(() => require(CONFIG_PATH), /OTEL_EXPORTER_OTLP_ENDPOINT is not set/)
    })
  })

  it("defaults serviceName to undefined-service when OTEL_SERVICE_NAME is undefined", () => {
    jest.isolateModules(() => {
      delete process.env.NODE_ENV
      delete process.env.OTEL_SERVICE_NAME
      const config = require(CONFIG_PATH).default
      assert.equal(config.serviceName, "undefined-service")
    })
  })

  it("sets enabled to false if OTEL_LOG_ENABLED is not 'true'", () => {
    jest.isolateModules(() => {
      process.env.OTEL_LOG_ENABLED = "false"
      const config = require(CONFIG_PATH).default
      assert.isFalse(config.enabled)
    })
  })

});

