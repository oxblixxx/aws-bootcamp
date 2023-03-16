# Week 2 — Distributed Tracing

## Class Summary

## Instrument our backend flask application to use Open Telemetry (OTEL) with Honeycomb as the provider

 Signup an account on Honeycomb, [click here](https://ui.honeycomb.io/signup).
 
 Create an environment with a preferred name. Copy the API Keys.
 
 Return to your code editor. In requirements.txt paste in this packages required for OTEL. Run ** Pip install -r requirements.txt ** to install the packages.
 
 ```
pip install opentelemetry-api
pip install opentelemetry-sdk
pip install opentelemetry-exporter-otlp-proto-http
pip install opentelemetry-instrumentation-flask
pip install opentelemetry-instrumentation-requests
 
 ```
 Then cd into backend-flask/app.py directory. Paste the below code to initialize a tracer and flask instrumentation to send data to Honeycomb
 
 ```py
 # app.py

 # Honeycomb-------
from opentelemetry import trace
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Initialize tracing and an exporter that can send data to Honeycomb
provider = TracerProvider()
processor = BatchSpanProcessor(OTLPSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

# Initialize automatic instrumentation with Flask
app = flask.Flask(__name__)
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()

 ```
 
 Update the Docker-compose.yml file 
 
 ```yaml
 environment:
      FRONTEND_URL: "https://3000-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
      BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
      OTEL_SERVICE_NAME: 'backend-flask'
      OTEL_EXPORTER_OTLP_ENDPOINT: "https://api.honeycomb.io"
      OTEL_EXPORTER_OTLP_HEADERS: "x-honeycomb-team=${HONEYCOMB_API_KEY}"
 ```
 
 
