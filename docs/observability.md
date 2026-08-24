# Observability

For this MVP, observability will be practical and foundational, avoiding complex distributed tracing infrastructure while ensuring production readiness.

## 1. Structured Logging
- Logs will be output in JSON format to stdout.
- **Tool:** Pino (Node.js).
- **Format:** `{"level": "info", "time": 1690000000, "msg": "Salary updated", "tenantId": "...", "employeeId": "..."}`
- This ensures logs can be easily parsed by any log aggregator (e.g., Datadog, CloudWatch).

## 2. Request Correlation
- Every incoming HTTP request will be assigned a unique `X-Request-ID`.
- This ID will be attached to all logs generated during the request lifecycle.
- **Benefit:** Allows tracing a single user action (like a salary update error) through the entire backend execution path.

## 3. Health & Readiness Probes
- `GET /health/live`: Returns `200 OK` if the Node process is running. Used for container restarts.
- `GET /health/ready`: Checks database connectivity (`SELECT 1`). Returns `200 OK` if ready to serve traffic, `503 Service Unavailable` otherwise. Used for load balancer routing.

## 4. Basic Application Metrics
- While a full Prometheus stack is out of scope, we will utilize Express middleware to log basic metrics:
  - Request duration (latency).
  - Response status codes (error rates).
  - API endpoint throughput.

## 5. Useful Error Information
- Errors returned to the client will be sanitized (hiding stack traces).
- Full error context, including stack traces and input parameters, will be logged on the server.
