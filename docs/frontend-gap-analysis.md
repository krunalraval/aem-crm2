# Frontend Gap Analysis: SOW + Call Requirements vs Current Implementation

> **Date**: 10 Feb 2026  
> **Scope**: UI/Frontend coverage only (all modules currently use mock data — no backend)

---

## Coverage Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented in UI |
| ⚠️ | Partially implemented — UI exists but missing specific features |
| ❌ | Not implemented at all |
| 🔌 | Requires backend/integration — UI placeholder exists |

---

## 1. Lead Management & Sales Automation (SOW: 90–120 hrs)

### Lead Ingestion

| Requirement | Status | Notes |
|------------|--------|-------|
| Manual lead creation form | ✅ | Multi-step form with company/contact selection |
| Deduplication check on email | ✅ | `checkDuplicateEmail()` in CreateLeadForm |
| CSV import | ❌ | No import UI exists |
| LinkedIn ingestion | ❌ | No LinkedIn form/webhook UI |
| Website form ingestion | ❌ | No web-to-lead form UI |
| Lead source tracking | ✅ | Source field: Website, LinkedIn, Referral, Cold Call, Trade Show, Other |

### Lead Pipeline

| Requirement | Status | Notes |
|------------|--------|-------|
| Pipeline stages (New → Won/Lost) | ✅ | 9 stages: New, Contacted, Follow-Up, Qualified, Site Survey, Quote Sent, Awaiting Response, Negotiation, Won, Lost |
| Kanban drag-and-drop | ✅ | DnD-kit based Kanban board |
| Table view toggle | ✅ | Kanban ↔ Table toggle |
| BDM ownership & colour coding | ✅ | BDM-specific colours on cards, owner filter |
| Lead scoring (configurable) | ❌ | No scoring UI or configuration panel |
| Lead assignment rules | ❌ | No auto-assignment rules UI |
| Days-in-stage tracking / urgency | ✅ | `getDaysInStage()`, urgency indicators (healthy/warning/overdue) |
| Lead → Account conversion | ⚠️ | "Convert" button exists on detail page with confirmation dialog, but doesn't actually create account (mock only) |

### Activity Logging

| Requirement | Status | Notes |
|------------|--------|-------|
| Activity timeline per lead | ✅ | ActivityTimeline component with call, email, meeting, note, status_change types |
| Log activity form (calls, emails, meetings) | ✅ | LogActivityForm on lead detail page |
| Notes & attachments | ⚠️ | Notes: ✅ (AddNoteForm). Attachments: ❌ (no file upload UI) |
| Reminders | ⚠️ | Task due dates exist but no dedicated reminder/notification setting per activity |
| Email sync (IMAP/SMTP) | 🔌 | No email sync UI — requires Outlook/email integration |
| VoIP click-to-call | ❌ | Phone numbers displayed but no click-to-call or call logging integration |
| Meeting/site visit logging | ✅ | Site visit type in LogActivityForm |

### Call Transcript Specifics

| Requirement (from call) | Status | Notes |
|--------------------------|--------|-------|
| Duplicate contact popup on creation | ✅ | Email dedup check shows warning |
| BDM colour-coded lead cards | ✅ | `ownerColor` on lead cards |
| Filter pipeline by BDM | ✅ | Owner filter dropdown |
| "Follow-Up" status in pipeline | ✅ | "follow_up" stage included |
| Task auto-escalation (3 failed calls → auto email) | ❌ | No workflow/automation builder UI |
| Generic tasks (non-CRM, e.g. holiday, admin) | ⚠️ | Tasks module exists but types limited to: call, email, site_visit, follow_up, admin. No "generic/personal" category |
| Map of customer locations with BDM colour pins | ⚠️ | Field Ops has a static map with pins, but no BDM colour-coded customer map for sales territory planning |
| Microsoft Bookings link integration | ❌ | No booking link embed or meeting scheduler UI |

---

## 2. Integrated Quoting System (SOW: 60–80 hrs)

| Requirement | Status | Notes |
|------------|--------|-------|
| Template-based quote builder | ✅ | Templates: 8-Camera Hardwired, 4-Camera Wireless, Save Tower System, Consultation, Custom |
| System type dropdown | ✅ | systemType field with dropdown in CreateQuoteForm |
| Line items (products/services) | ⚠️ | Rate × Units × Duration model exists, but no granular line-item editor (individual products, quantities) |
| Tax, discounts, bundles | ❌ | No tax calculation, discount fields, or bundle logic in quote form |
| Versioning & revisions | ✅ | ReviseQuoteForm with version history list |
| Branded PDF template generation | 🔌 | `handleDownloadPDF()` exists as stub — no actual PDF generation |
| Email sending (PDF attachment via Outlook) | 🔌 | "Send" and "Resend" buttons exist — no actual email integration |
| Approval workflows (internal) | ✅ | Finance approvals page with Approve/Send Back workflow |
| Quote → Contract conversion | ❌ | No conversion UI or contract generation from quote |
| Big Deal tracking | ✅ | `isBigDeal` toggle, golden badge, Big Deal filter |
| Lost reason capture | ✅ | LostReasonModal with predefined reasons + notes |
| Quote expiry warnings | ✅ | Expiry date tracking with warning badges |
| Quote follow-up reminders | ⚠️ | `followUpDate` field exists on quote but no reminder/notification trigger UI |
| BDM colour on quote cards | ✅ | `bdmColor` shown on cards |

### Call Transcript Specifics

| Requirement (from call) | Status | Notes |
|--------------------------|--------|-------|
| "Create Quote" button from lead detail | ✅ | `handleCreateQuote()` on lead detail page |
| Quote template dropdown (Save Tower, Wired, Wireless, etc.) | ✅ | Template selection in step 1 of CreateQuoteForm |
| Auto-populate client details from contact/lead | ✅ | Company/contact selectors pre-populate |
| Quote status pipeline (Draft → Sent → Accepted/Rejected) | ✅ | 8 statuses including in_negotiation, revised |
| Value-based "Big Deal" threshold (not system-based) | ⚠️ | Manual toggle only — no auto-tag based on value threshold |
| Filter quotes by date range | ❌ | No date range filter on quotes list page |
| Quote rejection data collection for reports | ✅ | Rejection reason + notes stored on quote |

---

## 3. Lead Conversion, Account & Project Management (SOW: 70–90 hrs)

| Requirement | Status | Notes |
|------------|--------|-------|
| One-click Lead → Account conversion | ⚠️ | Convert button shows confirmation but doesn't actually create account/site |
| Account → Project → Site hierarchy | ✅ | Account detail page has Company → Regions → Sites → Contacts tabs |
| Company detail with regions, sites, contacts | ✅ | Full hierarchy on Account detail page |
| Site-level detail (systems, contacts, jobs) | ✅ | Site detail page with 6 tabs |
| Document generation (contracts, job sheets, scope docs) | ❌ | No document/contract generation UI |
| E-signature integration | ✅ | Public signing page (/sign/[token]) with canvas signature capture, T&Cs |
| DocuSign status tracking/reminders | ❌ | No "awaiting signature" status tracking or reminder UI within CRM |
| Auto project kickoff triggers | ❌ | No automation/workflow trigger UI (notify admin, create finance records) |
| Site P&L financial summary | ✅ | Finance page has site-level invoice tracking and P&L reports |

### Call Transcript Specifics

| Requirement (from call) | Status | Notes |
|--------------------------|--------|-------|
| Company → Sites → Click into site → see contacts & activity | ✅ | Account [id] page with Sites tab → Site [id] page with Contacts tab |
| Region ownership (BDM owns a region, others can't poach) | ⚠️ | Region has `regionOwnerBdmName` but no permission enforcement in UI |
| Preferred method of communication field on contacts | ✅ | `preferredCommunication` field on Contact type |
| Position/job title of contact | ✅ | `jobTitle` field on Contact type |
| Site sheet auto-generation when quote accepted | ❌ | No automated document creation flow |
| DocuSign: auto-convert lead to account on signature | ❌ | No automation trigger UI |

---

## 4. Admin & Accounts Automation (SOW: 80–110 hrs)

### Sage Integration

| Requirement | Status | Notes |
|------------|--------|-------|
| Sage sync UI | 🔌 | Sync button exists on Finance page — stub only |
| Sage reference number on invoices | ✅ | `sageRef` field on Invoice type |
| Two-way sync (Customers, Invoices, Payments, Credit Notes) | 🔌 | No sync config UI, no conflict handling UI |
| Manual override options | ❌ | No manual override UI for sync conflicts |

### Financial Reporting

| Requirement | Status | Notes |
|------------|--------|-------|
| Invoice management (create, review, approve) | ✅ | CreateInvoiceForm, ReviewInvoiceModal with approve/reject |
| Site-level invoicing | ✅ | Invoice type has `siteId`, `siteName` |
| P&L per site | ⚠️ | Revenue trend chart and loss-making sites list exist, but no full per-site P&L drill-down page |
| P&L per customer/company | ⚠️ | `companyId` on invoices exists but no dedicated company-level P&L view |
| Revenue vs cost tracking | ⚠️ | PLReport type has revenue, equipment cost, labour cost, profit, margin — but only summary level |
| PO number tracking | ✅ | `poNumber` field on Invoice type |
| Exportable reports | ⚠️ | Export button exists on Reports page but no actual export functionality |
| Invoice statuses (Draft → Pending Approval → Sent → Paid/Overdue/Disputed/Credited) | ✅ | Full status lifecycle implemented |
| Billing period tracking | ✅ | `periodFrom`, `periodTo` on Invoice type |

### Call Transcript Specifics

| Requirement (from call) | Status | Notes |
|--------------------------|--------|-------|
| Lucy enters billing terms → auto-generate draft invoice for Linda | ❌ | No automated invoice generation from quote acceptance |
| Linda approval step before invoice sent | ✅ | ReviewInvoiceModal with approve/reject flow |
| Recurring/monthly invoice generation | ❌ | No recurring billing UI |
| Track whether new or old kit used on a site (profitability) | ✅ | `condition` field (new/recycled) on inventory items |

---

## 5. Engineering & Field Operations (SOW: 120–150 hrs)

### Resource Scheduling

| Requirement | Status | Notes |
|------------|--------|-------|
| Sales calendar | ✅ | FullCalendar with SalesEvent type (meeting, site_visit, callback) |
| Engineer calendar | ✅ | FullCalendar with EngineerJob type (installation, service, maintenance, decommission, repair) |
| Sales/Engineer toggle | ✅ | Calendar type toggle between views |
| Leaflet map view on scheduling | ✅ | react-leaflet map with engineer job pins |
| Skill-based engineer assignment | ❌ | No skill/qualification tracking on engineers |
| Drag-and-drop job scheduling | ⚠️ | Date selection creates jobs, but no drag-drop of existing jobs between dates |
| Conflict detection | ❌ | No overlap/conflict detection for double-booked engineers |
| Outlook calendar sync indicator | ⚠️ | `isOutlook` flag on SalesEvent type, visual indicator — but no actual sync |

### Field App / Mobile Web

| Requirement | Status | Notes |
|------------|--------|-------|
| Job details & history | ✅ | Work order detail drawer in Field Ops |
| Checklists | ✅ | JobChecklistManagement in Settings (configurable, drag-and-drop, mandatory items) |
| Photo/video upload | ❌ | No file upload UI for site photos/videos |
| Notes & issue reporting | ⚠️ | Notes field exists on jobs but no dedicated issue reporting form |
| Mobile responsive layout | ⚠️ | Some responsive handling but not a dedicated mobile/PWA experience |

### On-Site Digital Sign-Off

| Requirement | Status | Notes |
|------------|--------|-------|
| Dynamic sign-off forms | ✅ | Public signing page with document details, T&Cs |
| Customer signature capture | ✅ | Canvas-based SignatureCapture component |
| Auto-sync to project & finance | 🔌 | Confirmation shown after signing but no actual sync |

### Maintenance Automation

| Requirement | Status | Notes |
|------------|--------|-------|
| Maintenance scheduling settings | ✅ | MaintenanceScheduling panel in Settings (service interval, auto-schedule toggle) |
| Recurring job rules | ⚠️ | Settings panel has interval config but no actual recurrence creation on jobs |
| Automated reminders & scheduling | ❌ | No reminder automation UI |
| Install → Service → Preventative maintenance lifecycle | ⚠️ | Job types include installation, service, maintenance — but no lifecycle transition UI |

### Call Transcript Specifics

| Requirement (from call) | Status | Notes |
|--------------------------|--------|-------|
| Caleb's app: see job detail, kit needed, address, checklist | ⚠️ | Field Ops shows work orders with site/task but no kit requirements linked from inventory |
| Map slider to move dates and see where engineer is moving | ❌ | No date slider on map view |
| Kit reservation from inventory when job booked | ⚠️ | `reserved` field on inventory items but no UI to reserve stock against a specific job |
| Decommission workflow: kit returns to inventory | ❌ | No decommission → inventory return workflow UI |
| GPS tracking on kit | ❌ | No GPS tracking UI (acknowledged as future/optional in call) |

---

## 6. Inventory Management (SOW: 50–70 hrs)

| Requirement | Status | Notes |
|------------|--------|-------|
| Central inventory database | ✅ | Full inventory page with categories, SKUs |
| Stock levels by location (warehouse/van/site) | ✅ | Location field: Warehouse A, Warehouse B, Van Stock, Office |
| New vs Reused/Recycled condition tracking | ✅ | `condition` field with "new" and "recycled" values |
| Auto-deduction on job completion | ❌ | No automatic stock deduction when job completes |
| Low-stock alerts | ✅ | `lowStockThreshold`, low-stock filter, stock alerts on dashboard |
| Parts linked to jobs & invoices | ❌ | No link between inventory items and specific jobs/invoices |
| Stock adjustment (add/remove with reason) | ✅ | AdjustStockForm with type (add/remove), quantity, reason |
| Reserved stock tracking | ✅ | `reserved` field on items, available = inStock - reserved |
| QR/barcode reference | ⚠️ | `qrRef` field exists on type but no QR scanning UI |
| Create new inventory item | ✅ | CreateItemForm with full field set |

### Call Transcript Specifics

| Requirement (from call) | Status | Notes |
|--------------------------|--------|-------|
| Auto-deduct on job creation (e.g. 8-camera install → stock -8) | ❌ | No auto-deduction |
| Caleb's simple app: "put in stock / take out stock" | ❌ | No simplified mobile stock management UI |
| Decommission → stock return flow | ❌ | No return-to-stock workflow |
| Track how long kit is lasting | ❌ | No lifespan/usage tracking per item |

---

## 7. RMS (CCTV) Integration (SOW: 40–70 hrs)

| Requirement | Status | Notes |
|------------|--------|-------|
| RMS site list with camera counts | ✅ | Site cards with camera count, status |
| Camera status per site | ✅ | Individual camera status in site detail |
| Connected/Offline/Error status | ✅ | 4 statuses: connected, offline, syncing, error |
| Sync Now action | ✅ | `handleSyncNow()` stub |
| Summary stats (total sites, connected, cameras, online) | ✅ | 4 stat cards |
| View live feed | 🔌 | "View Live" button exists — no actual feed viewer |
| Map of camera sites | ❌ | No map view in RMS module (only in Field Ops) |
| Permission-based access (sales = view-only, engineers = full) | ❌ | No role-based restriction UI on RMS page |
| Auto-disconnect after viewing | ❌ | Not implemented |
| RMS down notification → CRM alert | ⚠️ | Notification type `system_down` exists but no RMS→notification trigger |

### Call Transcript Specifics

| Requirement (from call) | Status | Notes |
|--------------------------|--------|-------|
| EZ Viewer integration | 🔌 | No specific EZ Viewer link/embed |
| Ajax integration | 🔌 | Not implemented |
| Teltonika RMS integration | 🔌 | Not implemented |
| Router status monitoring (email → CRM notification) | ❌ | No email-to-notification pipeline UI |
| K2S branding overlay on camera viewer | ❌ | No branded viewer |

---

## 8. Roles, Permissions & Security (SOW: 25–35 hrs)

| Requirement | Status | Notes |
|------------|--------|-------|
| Role-based access (Sales, Admin, Accounts, Engineers, Management) | ✅ | PermissionGuard component, useAuth hook |
| Role-specific dashboards | ✅ | BDMDashboard, AdminDashboard, EngineerDashboard, ManagementDashboard |
| User management (create, edit, roles, colours) | ✅ | UserManagement panel in Settings |
| Data visibility rules | ⚠️ | PermissionGuard hides sections but no data-level filtering (all mock data visible) |
| Audit logs | ❌ | No audit log viewer |

---

## 9. Reporting & Dashboards (SOW: 30–40 hrs)

| Requirement | Status | Notes |
|------------|--------|-------|
| Sales pipeline report | ⚠️ | Reports page has sales funnel visualisation but limited data |
| Engineer utilisation report | ⚠️ | Engineer performance table exists with basic metrics |
| Revenue & margins report | ⚠️ | Revenue trend charts on Finance page, but no comprehensive margins report |
| Job status report | ❌ | No dedicated job status/completion report |
| Target dials (monthly revenue/sites) | ✅ | Revenue progress bar on BDM dashboard, target settings in Settings |
| Custom filters & exports | ⚠️ | Export buttons exist (stub), date range filter exists but limited |
| Per-BDM performance view | ⚠️ | BDM filter exists on leads/quotes but no dedicated BDM performance page |
| Management dashboard with overall summary | ✅ | ManagementDashboard with revenue trend, pipeline summary, team stats |

### Call Transcript Specifics

| Requirement (from call) | Status | Notes |
|--------------------------|--------|-------|
| Target dial (visual gauge for monthly goal) | ⚠️ | Progress bar exists but not a dial/gauge visual |
| Meeting/calendar summary on dashboard | ✅ | Weekly schedule widget on BDM dashboard |
| Stock alerts on dashboard | ✅ | Low stock alerts widget on dashboard |
| Recent conversions widget | ✅ | Recent conversions on Management dashboard |

---

## 10. Cross-Cutting Features (from Call Transcript)

| Requirement | Status | Notes |
|------------|--------|-------|
| Outlook email integration (send from CRM, sync conversations) | ❌ | No Outlook/email integration UI |
| Outlook calendar sync | ⚠️ | `isOutlook` flag on events but no actual sync UI/settings |
| HubSpot data import/migration | ❌ | No import/migration tool UI |
| Holiday booking system | ❌ | Not implemented |
| Document linking to SharePoint | ⚠️ | AddDocumentLinkForm exists on Site detail (name, URL, source) — basic link storage |
| Exclaimer / email signature management | ❌ | Out of scope for CRM (third-party tool) |
| What3Words / location integration | ❌ | Coordinates exist on sites but no What3Words integration |
| Login / authentication screens | ❌ | Auth route group exists but no login page |

---

## Summary: Coverage by SOW Section

| SOW Section | Total Items | ✅ Full | ⚠️ Partial | ❌ Missing | 🔌 Backend |
|------------|-------------|---------|------------|-----------|-----------|
| 1. Lead Management | ~18 | 10 | 3 | 4 | 1 |
| 2. Quoting System | ~14 | 10 | 2 | 1 | 1 |
| 3. Conversion & Account Mgmt | ~9 | 4 | 2 | 3 | 0 |
| 4. Admin & Finance | ~12 | 5 | 3 | 2 | 2 |
| 5. Engineering & Field Ops | ~18 | 6 | 5 | 5 | 2 |
| 6. Inventory | ~10 | 6 | 1 | 3 | 0 |
| 7. RMS Integration | ~10 | 4 | 1 | 3 | 2 |
| 8. Roles & Security | ~5 | 3 | 1 | 1 | 0 |
| 9. Reporting & Dashboards | ~8 | 3 | 4 | 1 | 0 |
| 10. Cross-Cutting | ~8 | 0 | 2 | 6 | 0 |

**Overall**: ~112 feature items. **51 fully covered (46%)**, **24 partially (21%)**, **29 missing (26%)**, **8 backend-dependent (7%)**.

---

## High-Priority Frontend Gaps (Top 10)

1. **No automated workflow/trigger UI** — Auto-escalation, auto-invoice generation, auto-notifications
2. **No document generation** — Contracts, job sheets, scope documents from templates  
3. **No CSV/bulk import** — Leads, contacts, HubSpot migration
4. **No file upload** — Photos, videos, attachments for jobs, sites, notes
5. **No Outlook integration UI** — Email send/sync settings, calendar sync config
6. **No login/authentication page** — Auth route group is empty
7. **No audit log viewer** — Required for compliance and management oversight
8. **No lead scoring configuration** — Scoring rules editor missing
9. **No inventory ↔ job linking** — Kit requirements per job, auto-deduction, decommission return
10. **No recurring invoice/billing** — Monthly auto-generation from billing terms

---

# Client Questions for Clarification

> These are specific questions arising from ambiguities between the SOW, the call transcript, and what we understand. These need answers before we proceed further.

---

### Lead Management

**1. Lead scoring criteria and weighting**  
The SOW mentions "configurable lead scoring" but the call didn't discuss it. What factors should influence the score? (e.g., deal value, company size, source, response time). Do you want a simple Hot/Warm/Cold manual tag, or a weighted points system with configurable rules?

**2. LinkedIn lead ingestion method**  
The SOW lists LinkedIn as a lead source. Is this:
- (a) Manual entry with "LinkedIn" as the source tag (already exists), or
- (b) Integration with a specific tool (e.g., LinkedIn Sales Navigator, PhantomBuster, Apollo), or
- (c) A web form embedded on your website that tags leads as LinkedIn-sourced?

**3. Task auto-escalation workflow specifics**  
Ryan mentioned: after 3 failed contact attempts, a generic email goes out with a booking link. Should the user be able to configure:
- The number of attempts before escalation?
- The email template content?
- Which pipeline stages this applies to?
- Or should this be a fixed rule (3 attempts → email)?

---

### Quoting

**4. Line item granularity for temporary CCTV quotes**  
Current quote model uses Rate × Units × Duration. In the call, Ryan said pricing is per-week and kit cost is irrelevant (sometimes reused kit). Is the current model sufficient, or do you need:
- Individual line items (e.g., Camera Type A × 4, Camera Type B × 4, NVR × 1)?
- Or just the total package model (8-camera system = £X/week)?

**5. Quote-to-contract document flow**  
When a quote is accepted, what exact documents need to be auto-generated?
- A formal contract (separate from the quote PDF)?
- A job sheet for the engineer?
- A scope document for the client?
- If yes, can you share sample templates for each so we can replicate the format?

**6. Quote approval — who approves and when?**  
The call mentioned Linda needs to approve before invoice generation. But does a quote also need internal approval before being sent to the client? If so, at what value threshold? (Or always?)

---

### Accounts & Conversion

**7. Exact trigger for lead-to-account conversion**  
The call discussed two possible triggers:
- (a) Ryan/Lucy manually clicks "Convert" when quote is accepted verbally
- (b) Automatic conversion when DocuSign contract is signed

Which is it? Or should both paths exist (manual convert + auto-convert on signature)?

**8. Region ownership and protection rules**  
Ryan was clear: "If Lucy brings on Barrett Yorkshire, that's hers — I don't want other people creeping in." How strict should this be?
- (a) Soft warning: "This region is owned by Lucy — are you sure?"
- (b) Hard block: Other BDMs cannot create leads/contacts in an owned region
- (c) Admin can reassign regions, BDMs see only their own?

---

### Finance & Admin

**9. Sage integration direction**  
You mentioned Sage will stay. We need to understand:
- Which Sage product? (Sage 50, Sage 200, Sage Business Cloud?)
- Is there already an API connection or will we use Sage's official API?
- What is the minimum sync scope for Phase 1? (e.g., just push invoices to Sage, or full two-way sync?)

**10. Recurring billing model specifics**  
For temporary CCTV sites billed weekly/monthly:
- Is the billing amount always the same each period (fixed from quote)?
- Or does it vary (e.g., based on cameras active that week)?
- When does billing start — on installation completion or contract signing?
- When does a site's billing end — on decommission or a fixed term?

---

### Engineering & Field Ops

**11. Checklist completion — where does sign-off data go?**  
Caleb completes a checklist on site and gets the site manager to sign. Currently the e-signature page is standalone (/sign/[token]). Should:
- (a) Caleb fill the checklist in-app and then hand the device to the site manager for signature?
- (b) Caleb submit the checklist, which triggers a link sent to the site manager's email for remote sign-off?
- (c) Both options available?

**12. Photo/video evidence — storage and access**  
Ryan mentioned linking to SharePoint for document storage. For site photos/videos that Caleb takes:
- Should they upload directly to the CRM, or
- Upload to a SharePoint folder and the CRM just stores the link?
- Who needs access to these photos? (Just engineer & admin, or clients too?)

---

### RMS / CCTV

**13. RMS integration — which platform first?**  
The call mentioned three systems: EZ Viewer (Hikvision P2P), Ajax, and Teltonika RMS. Which one should we integrate first? And what level of integration:
- (a) Just embed the existing web URL/link in the CRM (simple link-out)
- (b) Pull camera/device status data via API into CRM for monitoring
- (c) Full live feed viewing within the CRM interface

**14. "System down" notifications — source and routing**  
Ryan mentioned Teltonika RMS already sends email alerts when a router goes up/down. Should we:
- (a) Create a dedicated inbox that receives these emails, parses them, and creates CRM notifications?
- (b) Use the RMS API directly to poll device status?
- (c) Manually log system-down events?

---

### General

**15. Mobile app vs responsive web — timeline**  
The call confirmed starting with responsive web (Chrome on phone) and a native app later. For Phase 1, is the responsive web version sufficient for Caleb's field work, or is a basic PWA (installable, offline-capable) expected?

**16. Authentication provider**  
No login page exists yet. Should we use:
- (a) Microsoft SSO (since you're on Microsoft 365) — simplest for your team
- (b) Email/password with custom login
- (c) Both options?
