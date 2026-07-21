# Security boundary

Nexus AI is a single-operator, loopback-only demonstration. Every page and API is
protected by a signed, expiring, HTTP-only session. Operator credentials and the session
secret are supplied at runtime. The seed command is destructive and may run only against
an explicitly disposable database.

This is not a multi-tenant ML platform. SQLite, process-local quotas/jobs, illustrative
evaluation records, provider proxies, and generated gap workflows are not approved for
customer data, authoritative evaluations, billing enforcement, or cloud deployment.
