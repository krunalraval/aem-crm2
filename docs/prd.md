# Final Consolidated Scope of Work (v2)

## 1. Product Vision & Objectives

The objective is to design and build a custom, site-first CRM and Operations Platform that replaces HubSpot, Excel, InDesign, and disconnected tools with one unified system that mirrors how the business actually operates.

This is not a generic CRM.  
It is a role-based operating system for Sales, Admin, Engineering, Finance, and Management.

### Key goals:
- Eliminate duplicate data entry
- Centralise all operational knowledge at site level
- Drive the business day-to-day via tasks, jobs, and schedules
- Improve visibility, accountability, and scalability
- Build incrementally (Sales → Ops → Finance)

---

## 2. Core Data Model (Foundational Principle)

The entire system will be designed around the following site-first hierarchy:

```
Company
 └── Region
      └── Site  ← PRIMARY BUSINESS UNIT
           ├── Contacts
           ├── Leads / Opportunities
           ├── Quotes
           ├── Tasks
           ├── Jobs
           ├── Inventory usage
           └── Financials
```

### Key Rules
- A Site is where installs happen, revenue is generated, and reporting occurs
- One Company can have many Regions
- One Region can have many Sites
- One Contact may be associated with multiple Sites
- All profitability and reporting must work at site level first, with roll-ups to company and region

---

## 3. System Architecture & Foundation Layer

### Scope
- Custom-built architecture (modular monolith, future microservice-ready)
- Multi-tenant ready (future expansion)

### Core entities:
- Companies
- Regions
- Sites
- Contacts
- Leads / Opportunities
- Quotes
- Tasks
- Jobs
- Inventory

- Event-driven workflow engine  
- Central activity & audit timeline  
- Scalable permissions system  

### Outcome
A stable foundation that supports automation, reporting, and future growth without rework.

---

## 4. Lead & Opportunity Management (Sales)

### Scope
- Simple lead creation (manual + import)
- Leads are opportunities for a site

Lead attached to:
- Company
- Region
- Site
- Contact

- Visual pipeline (kanban-style)

### Statuses:
- New
- Contacted
- Site Visit
- Quote Sent
- Negotiation
- Won
- Lost (mandatory reason capture)

### Enhancements
- Duplicate contact detection
- Manual ownership assignment (BDM)
- Colour-coded ownership or clear visual identifiers
- Lead filters by owner, date, status, region

---

## 5. Tasks System (Backbone of the Platform)

### Scope
Tasks are the primary driver of daily work, not just CRM notes.

### Task Types
- Sales follow-ups
- Callbacks
- Emails
- Site visits
- Admin tasks
- Internal reminders (POs, approvals, invoices)
- Standalone internal tasks (not linked to a contact)

### Task Features
- Task pipeline (manual stage movement):
  - New
  - Attempted
  - Callback arranged
  - Waiting response
  - Completed

- Priority & urgency indicators
- Colour changes for:
  - Due soon
  - Overdue
  - Critical

- Optional reminders (email only for critical tasks)

Tasks linked to:
- Contact
- Site
- Quote
- Or standalone

### Automation (Lightweight, Optional)
Example:
- After 3 unanswered call attempts → send polite follow-up email  
No aggressive or spammy automation.

---

## 6. Quoting Engine (Replacing InDesign)

### Scope
- Fully custom quote builder
- Template-based quoting (e.g. “8-camera hardwired system”)
- Dropdown-driven selections
- Auto-filled pricing
- Margin-safe pricing rules
- Branded PDF generation
- Email sending via Outlook integration
- Quote versioning & revisions

### Quote Pipeline
- Sent
- Follow-up pending
- Accepted
- Rejected (mandatory reason capture)

### Enhancements
- “Big Deal” flag (value-based or manual)
- Big deals trigger higher visibility & follow-up tasks
- Quote reminders (manual or timed)
- Filtering by date, value, status

---

## 7. Lead → Account → Site Activation Flow

### Scope
Accepted quote converts opportunity into an Active Site.

Automated generation of:
- Site record
- Initial job (install)
- Admin review task
- Engineering job preparation

Supports:
- Automatic conversion
- Manual override (edge cases)

---

## 8. Admin & Finance Workflow (Sage)

### Scope
- Sales enters commercial terms once
- Admin (Finance) reviews & approves before invoicing
- Draft invoices auto-created in Sage
- Payments synced back
- No duplicate Excel tracking

### Financial Views
**Site-level:**
- Revenue
- Cost
- Profitability

**Company-level:**
- Rollups

### Status indicators:
- Awaiting approval
- Invoiced
- Paid

---

## 9. Engineering & Field Operations

### Jobs vs Tasks (Clear Separation)
- Tasks = Sales/Admin work
- Jobs = Engineer-only work

### Scheduling
- Separate views:
  - Sales calendar
  - Engineer job calendar
- Engineer availability & assignment
- Conflict awareness
- Optional map-assisted planning

### Field Operations (Web / PWA)
- Job details
- Site address & contacts
- Install checklist
- Notes & photo uploads
- Digital customer sign-off (e-sign)
- Proof of completion

### Maintenance Automation
- Auto-generated recurring jobs:
  - 6 months
  - 12 months
- Service history per site

---

## 10. Inventory & Equipment Management

### Scope
- Central inventory register
- Stock by location / van

### Equipment tagging:
- New
- Reused / recycled

- Automatic stock deduction by job type
- Manual override (admin only)
- Low-stock alerts

### Decommissioning
- Decommission jobs return stock to inventory
- Status updated automatically

### Future-Ready (Not Phase 1)
- QR / barcode scanning
- GPS tracking for high-value assets

---

## 11. Map & Region Visualisation

### Scope
- Simple, cost-effective map view
- Visual pins for sites

Colour-coded by:
- Region
- Owner
- Engineer

Used for:
- Territory planning
- Engineer routing
- Sales strategy

Manual data entry (no paid map APIs initially)

---

## 12. Dashboards & Reporting

### Personal Dashboards
Each user sees their own world:
- Tasks
- Leads
- Sites
- Quotes
- Calendar summary

### Management Dashboards
- Revenue targets (visual dials)
- Sites won
- Big deals
- Pipeline health
- Engineer utilisation

### Meeting Support
Weekly overview:
- Meetings
- Site visits
- High-priority follow-ups

Designed for Monday morning meetings.

---

## 13. Roles, Permissions & Visibility

### Roles
- Sales
- Admin / Finance
- Engineer
- Management

### Rules
- Sales users cannot access others’ pipelines by default
- Region ownership enforced
- Managers get aggregated views
- Engineers see jobs only (no sales clutter)

---

## 14. Documents & Microsoft Ecosystem

### Scope
- No document uploads into CRM
- All documents live in:
  - SharePoint / OneDrive
- CRM stores secure links only

Supports:
- Compliance documents
- Cards / certifications
- Site evidence

---

## 15. Phased Delivery Approach (Recommended)

### Phase 1 – Sales Core
- Data model
- Leads
- Tasks
- Quotes
- Dashboards

### Phase 2 – Operations
- Jobs
- Scheduling
- Field ops
- Inventory

### Phase 3 – Finance & Optimisation
- Sage automation
- Reporting
- Maps
- Advanced workflows

---

## 16. Summary

This scope defines a custom, site-first CRM and Operations Platform that:
- Matches real workflows
- Reduces admin load
- Improves accountability
- Scales with the business

Can evolve into a long-term internal platform or SaaS product.

**This is not over-engineering.**  
**It is correct engineering for how the business actually works.**
