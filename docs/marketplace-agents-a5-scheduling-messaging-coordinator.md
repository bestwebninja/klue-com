# A5 Scheduling & Messaging Coordinator (v1)

## Mission
Coordinate booking windows and customer/provider messaging after quote selection.

## Rules-first behavior
- Enforce timezone-safe booking windows.
- Throttle reminder cadence by tenant policy.
- Route missed confirmations to A8 support queue after SLA breach.

## AI/ML hook
- Predict no-show risk and send adaptive reminders.
