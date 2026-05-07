import {assert} from "chai"
import sinon from "sinon"
import {shutdownOpenTelemetry} from "../../../src/openTelemetry";

describe("openTelemetry side-effect startup", function () {
  setTimeout(() => {}, 10000) // workaround for timeout not working in beforeEach/afterEach
  const OLD_ENV = process.env
  const openTelemetryConfig = "../../../src/open-telemetry/openTelemetry.config"
  const openTelemetry = "../../../src/openTelemetry"

  beforeEach(() => {
    process.env = {...OLD_ENV}
    process.env.OTEL_LOG_ENABLED = "true"
    process.env.OTEL_SERVICE_NAME = "my-service-web"
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4317"
    delete require.cache[require.resolve(openTelemetryConfig)]
    delete require.cache[require.resolve(openTelemetry)]
  })

  afterEach(() =>  {
    process.env = OLD_ENV
    delete require.cache[require.resolve(openTelemetryConfig)]
    delete require.cache[require.resolve(openTelemetry)]
    shutdownOpenTelemetry()
  })

  it("logs disabled message and does not throw if 'OTEL_LOG_ENABLED' is false", () => {
    jest.isolateModules(() => {
      process.env.OTEL_LOG_ENABLED = "false"
      const infoStub = sinon.stub(console, "info")
      try {
        // Should not throw
        require(openTelemetry)
        assert(infoStub.calledWith("OpenTelemetry is disabled."))
      } finally {
        infoStub.restore()
      }
    })
  })

  it("starts OpenTelemetry if 'OTEL_LOG_ENABLED' is true", () => {
    jest.isolateModules(() => {
      process.env.OTEL_LOG_ENABLED = "true"
      const infoStub = sinon.stub(console, "info")
      try {
        // Should not throw
        require(openTelemetry)
        assert(infoStub.calledWith("OpenTelemetry started successfully."))
      } finally {
        infoStub.restore()
      }
    })
  })

  it("throws an exception if 'OTEL_EXPORTER_OTLP_ENDPOINT' is not set", () => {
    jest.isolateModules(() => {
      delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      process.env.OTEL_LOG_ENABLED = "true"
      assert.throws(() => require(openTelemetry), /OTEL_EXPORTER_OTLP_ENDPOINT is not set/)
    })
  })
})
