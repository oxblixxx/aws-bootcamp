# Week 2 — Distributed Tracing

## Class Summary

## Instrument our backend flask application to use Open Telemetry (OTEL) with Honeycomb as the provider

 Signup an account on Honeycomb, [click here](https://ui.honeycomb.io/signup).
 
 Create an environment with a preferred name. Copy the API Keys.
 
 Return to your code editor. In requirements.txt paste in this packages required for OTEL
 
 ```
pip install opentelemetry-api
pip install opentelemetry-sdk
pip install opentelemetry-exporter-otlp-proto-http
pip install opentelemetry-instrumentation-flask
pip install opentelemetry-instrumentation-requests
 
 ```
