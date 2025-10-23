import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { trace } from "@opentelemetry/api";

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "tracegen-js",
  }),
  traceExporter: new OTLPTraceExporter(),
});

console.log("Starting SDK...");
sdk.start();

const tracer = trace.getTracer("tracegen-js");

const span = tracer.startSpan("span-with-attrs");
span.setAttribute("", "");
span.setAttribute("string", "somevalue");
span.setAttribute("empty-string", "");
span.setAttribute("string-array", ["a", "b", "c"]);
span.setAttribute("empty-array", []);
span.setAttribute("mixed-array", ["a", undefined, null, "b"]);
span.setAttribute("bool", true);
span.setAttribute("int", 1);
span.setAttribute("float", 1.1);
span.setAttribute("number-max-safe", Number.MAX_SAFE_INTEGER);

setTimeout(() => {
  span.end();
}, 100);

// Stop after 1s
setTimeout(() => {
  sdk.shutdown().then(() => console.log("SDK shutdown."));
}, 1000);
