# Vertical 4 Dashboard Specification

## 1) Vertical context
- **Vertical**: Vertical 4 (Build Agent workspace)
- **Purpose**: Provide a single operational cockpit that connects execution, delivery, staffing, risk, and approvals for Vertical 4 while preserving compatibility with executive cross-vertical reporting.
- **Primary users**:
  - Vertical 4 Lead (daily execution owner)
  - Delivery Manager (timeline and client commitments)
  - Operations Manager (process health, SLA, bottleneck control)
  - Portfolio/Strategy Lead (priority, conflicts, strategic weight)
  - Approvers (budget, compliance, exception, client-impact changes)

---

## 2) Project impact
The dashboard must expose project traceability from intake through delivery:
- Project status rollup: `Not Started`, `In Progress`, `Blocked`, `At Risk`, `Complete`
- Milestone tracker with due-date adherence and variance
- Dependency map (project-to-project and project-to-vendor)
- Delivery risk score (schedule, scope, resource, approvals)
- SLA and commitment health for client-facing projects

### Project KPIs
1. **On-time milestone rate** = milestones completed on/before due date / milestones due
2. **Project schedule variance (days)** = actual completion date - target completion date
3. **Blocked project count** (active)
4. **At-risk project ratio** = at-risk projects / active projects
5. **SLA miss risk count** (forecasted within next 14 days)

---

## 3) Task impact
Translate project outcomes to execution reality:
- Action Center surfaces due, overdue, blocked, and unassigned tasks
- Task cards include assignee, due date, priority, blockers, dependency chain, client flag
- Bulk actions: reassign, reprioritize, escalate, request approval, update status

### Task KPIs
1. **Due in 7 days**
2. **Overdue tasks**
3. **Blocked tasks > 48h**
4. **Unassigned critical tasks**
5. **Task throughput (weekly completed)**

---

## 4) Client impact
Classify every item as client-facing or internal and map client implications:
- Client-level delivery status lane
- Deliverable readiness and acceptance status
- SLA warning banding (`green`, `amber`, `red`)
- Communication impact flag for changes requiring client notification

### Client KPIs
1. **Client deliverables due this week**
2. **Deliverables at risk**
3. **SLA breach risk by client**
4. **Pending client communication actions**

---

## 5) Operations impact
Monitor process integrity and recurring workflow health:
- Workflow health panel for intake, scoping, build, QA, handoff, closeout
- Bottleneck detector: longest queue stage and cycle time by stage
- Compliance flags for process/policy exceptions
- Internal dependency alerts (data, legal, procurement, infra)

### Operations KPIs
1. **Cycle time (intake->delivery)**
2. **Stage aging (current stage duration)**
3. **Recurring workflow completion rate**
4. **Compliance/exception count**

---

## 6) Resource impact
Track allocation and utilization pressure:
- Capacity heatmap by role and owner
- Utilization status (`under`, `balanced`, `over`) by owner/team
- Skill-fit warnings when assignment mismatches required skill profile
- Single-owner gap detection (items missing clear ownership)

### Resource KPIs
1. **Capacity utilization % by team/owner**
2. **Over-allocated owners (>=110%)**
3. **Under-allocated owners (<=60%)**
4. **Skill mismatch incidents**

---

## 7) Portfolio impact
Ensure Vertical 4 decisions are sequenced correctly against broader portfolio:
- Priority matrix (`Critical`, `High`, `Medium`, `Low`) with strategic weighting
- Conflict panel: resource overlap, duplicated initiatives, timing collisions
- Tradeoff simulator for schedule and capacity reallocation

### Portfolio KPIs
1. **High-priority items without active execution**
2. **Portfolio conflict count**
3. **Priority inversion incidents** (low-priority work consuming constrained resources)

---

## 8) Strategic impact
Tie operational work to goals and OKRs:
- Goal alignment table for each project/task bundle
- OKR contribution score by project and by client program
- Strategic drift detector (active work with no goal link)

### Strategy KPIs
1. **Goal-linked work ratio** = work items linked to goals / active work items
2. **Unlinked work count**
3. **OKR progress contribution by project**

---

## 9) Approval status
The dashboard must include a first-class **Approvals Queue**:
- Queue stages: `Intake`, `Under Review`, `Changes Requested`, `Approved`, `Rejected`, `Escalated`
- Approval types: budget, timeline exception, compliance exception, client-impacting scope change, staffing override
- SLA timers on pending approvals and escalation triggers
- Full audit trail: requester, approver role, timestamps, decision notes

### Approval KPIs
1. **Pending approvals total**
2. **Approvals breaching SLA**
3. **Average approval cycle time**
4. **Escalated approvals count**

---

## 10) Next action (implementation plan)

### Phase 1: Foundation (Week 1)
- Define semantic layer and metric formulas
- Implement required global filters on all views
- Ship KPI summary + action center + approvals queue MVP

### Phase 2: Risk & Resource (Week 2)
- Add risk alerts, dependency graph, capacity heatmap
- Add owner overload and SLA risk detectors

### Phase 3: Portfolio & Strategy (Week 3)
- Add conflict panel, strategic weighting, goal alignment grid
- Expose cross-vertical comparative cards for executive rollup

### Phase 4: Hardening (Week 4)
- Add audit exports, alerting thresholds, role-based dashboards
- Validate reporting consistency with executive dashboard

---

## Required dashboard filters (all views)
1. Vertical filter
2. Owner filter
3. Client filter
4. Status filter
5. Priority filter
6. Date range filter

---

## Required dashboard surfaces
1. KPI summary
2. Action center
3. Risk alerts
4. Approvals queue
5. Resource pressure
6. Goal alignment
7. Cross-vertical visibility

---

## View specifications

### A) KPI Summary (top row)
- Cards with trend sparkline and variance vs prior period
- Period toggles: `7d`, `30d`, `Quarter`
- Drilldown links to source records

### B) Action Center
- Default sort: `priority desc`, then `due date asc`
- Quick actions: assign, reschedule, escalate, request approval
- Saved views: `My Critical`, `Client Due`, `Blocked >48h`

### C) Risk Alerts
- Severity: `Critical`, `High`, `Medium`, `Low`
- Risk types: schedule, SLA, dependency, compliance, resource
- Actions: acknowledge, assign mitigation owner, set target date

### D) Approvals Queue
- Sort by SLA breach risk first
- Batch approve for low-risk pre-authorized items
- Escalation policy integration (role + timer based)

### E) Resource Pressure
- Heatmap by team and owner
- Load projection for next 2/4/8 weeks
- Recommendations for rebalancing

### F) Goal Alignment
- Matrix: project/task bundle vs goal/OKR
- Flags for unaligned work and stale goal links

### G) Cross-vertical visibility
- Comparative KPIs across verticals with Vertical 4 highlighted
- Shared-resource conflict indicators
- Executive rollup-ready export schema

---

## Data model (minimum)

### Core entities
- `projects`
- `tasks`
- `clients`
- `deliverables`
- `milestones`
- `approvals`
- `risks`
- `resource_allocations`
- `goals`
- `okrs`
- `portfolio_items`

### Key relationship rules
- Task -> Project (many-to-one)
- Project -> Client (many-to-one, nullable for internal)
- Risk -> (Project or Task)
- Approval -> (Project, Task, or Change Request)
- Resource allocation -> (Owner, Project/Task, date range)
- Project/Task -> Goal/OKR (many-to-many)

---

## Interaction and orchestration rules
- New material work creation should follow:
  - `request -> approval -> project -> task bundle -> resource allocation -> portfolio/goal update`
- State changes in one layer must propagate:
  - Approval denied -> downstream tasks blocked + risk raised
  - Resource over-allocation -> portfolio conflict alert + schedule risk
  - Client SLA risk -> communication action auto-created

---

## Alerting standards
- **Real-time triggers**: SLA breach risk, critical blocker, approval SLA breach
- **Daily digest**: overdue tasks, capacity overload, at-risk deliverables
- **Weekly executive digest**: KPI trend, strategic alignment, conflict summary

---

## Access and governance
- Role scopes: contributor, lead, manager, executive, approver
- Field-level access for sensitive commercial or HR data
- Immutable approval audit log

---

## Normalized output model (for downstream interoperability)

```json
{
  "vertical": "Vertical 4",
  "request_type": "dashboard_spec",
  "project": {
    "name": "Vertical 4 Operations Dashboard",
    "status": "Proposed",
    "owner": "Vertical 4 Lead",
    "timeline": "4-week phased rollout",
    "risk": "Medium until data model + approvals SLA instrumentation are validated"
  },
  "tasks": [
    "Define metric dictionary and formulas",
    "Implement universal filters",
    "Build KPI summary and action center",
    "Integrate approvals queue with SLA timers",
    "Launch risk/resource/goal alignment views"
  ],
  "client": {
    "name": "Multi-client (vertical-wide)",
    "type": "Mixed (client-facing + internal)",
    "impact": "Improves delivery predictability, SLA visibility, and communication readiness"
  },
  "operations": {
    "workflow_type": "Operational dashboard + orchestration",
    "dependencies": [
      "Project/task service",
      "Approval workflow service",
      "Resource allocation service",
      "Goal/OKR service"
    ],
    "compliance_flags": [
      "Approval audit trail",
      "Role-based data visibility"
    ]
  },
  "resources": {
    "assigned": [
      "Vertical 4 Lead",
      "Product/UX",
      "Frontend Engineer",
      "Data Engineer",
      "Operations Manager"
    ],
    "capacity_status": "Balanced if phased rollout is maintained",
    "utilization_note": "Watch for data engineering bottleneck in phases 2-3"
  },
  "portfolio": {
    "priority": "High",
    "conflicts": [
      "Competes with parallel reporting initiatives for data engineering bandwidth"
    ],
    "strategic_weight": "High due to cross-vertical reporting dependency"
  },
  "strategy": {
    "goal_alignment": [
      "Delivery reliability",
      "Operational transparency",
      "Approval cycle efficiency"
    ],
    "okr_link": "O3-KR2 (execution reliability) and O2-KR1 (client SLA performance)",
    "business_value": "Faster decisions, fewer SLA misses, better executive visibility"
  },
  "approvals": {
    "required": true,
    "approver_roles": [
      "Vertical Director",
      "Operations Lead",
      "Compliance Owner"
    ],
    "status": "Draft - pending review",
    "next_step": "Submit dashboard implementation request with scope, cost, and rollout plan"
  }
}
```
