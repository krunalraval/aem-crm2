# Existing Product & UI Documentation

## 1. Application Overview

### Framework & Technology Stack
- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript
- **UI Library**: Custom components built on Radix UI primitives (shadcn/ui pattern)
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans and Geist Mono (Google Fonts)
- **Drag & Drop**: @dnd-kit/core for Kanban and calendar interactions

### High-Level Purpose
AEM CRM is an enterprise CRM application designed for a roofing/construction business. It provides modules for lead management, quoting, project tracking, scheduling, field operations, inventory management, finance, reporting, and remote monitoring (RMS).

---

## 2. Route & Page Inventory

### Root Layout
- **File**: `app/layout.tsx`
- **Purpose**: Wraps entire application with `ModalProvider` and `DrawerProvider`
- **Providers**: Global modal and drawer context for all pages

### Dashboard Route Group: `(dashboard)`
- **Layout File**: `app/(dashboard)/layout.tsx`
- **Structure**: Sidebar + main content area (flex layout, full height)

| Route | File Path | Purpose | Key UI Sections | Primary Actions |
|-------|-----------|---------|-----------------|-----------------|
| `/` | `app/(dashboard)/page.tsx` | **Personal Dashboard** | Revenue progress, My Tasks, My Leads, My Quotes, My Sites, weekly calendar | View tasks, view leads, view quotes |
| `/tasks` | `app/(dashboard)/tasks/page.tsx` | **My Tasks (Kanban)** | Pipeline columns (New, Attempted, Callback, Waiting, Completed), urgency indicators | Drag tasks, view details, filter |
| `/tasks/all` | `app/(dashboard)/tasks/all/page.tsx` | **All Tasks** | Table view with status/assignee filters, search | Filter, view details |
| `/sites` | `app/(dashboard)/sites/page.tsx` | **Site List** | Company→Region→Site hierarchy, stat cards, filters | Create site, view details, filter |
| `/sites/[id]` | `app/(dashboard)/sites/[id]/page.tsx` | **Site Detail** | Tabs (Overview/**Contacts**/Tasks/Quotes/Jobs/Documents), breadcrumb | Add task, add quote, add document link |
| `/contacts` | `app/(dashboard)/contacts/page.tsx` | **Contacts List** | Stat cards (Directors, QS), Search, Role filters | Create contact, view details |
| `/contacts/[id]` | `app/(dashboard)/contacts/[id]/page.tsx` | **Contact Detail** | Tabs (Overview, Sites, Tasks, Quotes, Activity) | Edit contact, view linked entities |
| `/regions` | `app/(dashboard)/regions/page.tsx` | **Regions** | Region list with stats, manager, site count | View sites by region |
| `/leads` | `app/(dashboard)/leads/page.tsx` | Lead pipeline management | Kanban board, table view toggle, stat cards, filters | Create lead, drag between stages, view details |
| `/leads/[id]` | `app/(dashboard)/leads/[id]/page.tsx` | Lead detail view | Info card, tabs (Overview/Activity/Quotes/Notes), activity timeline | Edit, convert to account, add note, delete |
| `/quotes` | `app/(dashboard)/quotes/page.tsx` | **Quote Pipeline** | Kanban pipeline, Big Deal toggle, Lost Reason modal, table view | Create quote, drag stages, mark as Big Deal |
| `/quotes/[id]` | `app/(dashboard)/quotes/[id]/page.tsx` | Quote detail view | Quote details with versioning | View, edit quote |
| `/accounts` | `app/(dashboard)/accounts/page.tsx` | Account/company management | Stat cards, table, type/status filters | Create account, view details, delete |
| `/accounts/[id]` | `app/(dashboard)/accounts/[id]/page.tsx` | Account detail view | Account information and related data | Edit, delete account |
| `/projects` | `app/(dashboard)/projects/page.tsx` | Project tracking | Stat cards, table with progress bars, status filters | Create project, view details |
| `/projects/[id]` | `app/(dashboard)/projects/[id]/page.tsx` | Project detail view | Project details | Edit project |
| `/scheduling` | `app/(dashboard)/scheduling/page.tsx` | Job scheduling calendar | **Sales/Engineer toggle**, weekly calendar, drag-drop jobs | Toggle calendar type, create job, navigate weeks |
| `/scheduling/[id]` | `app/(dashboard)/scheduling/[id]/page.tsx` | Job detail view | Job details | Edit job |
| `/field-ops` | `app/(dashboard)/field-ops/page.tsx` | Field operations dashboard | **Static map view with pins**, work orders, technicians | View map, click pins, view work orders |
| `/inventory` | `app/(dashboard)/inventory/page.tsx` | Inventory management | Stat cards, table, **condition filter (New/Reused)** | Add item, adjust stock, filter by condition |
| `/inventory/[id]` | `app/(dashboard)/inventory/[id]/page.tsx` | Inventory item detail | Item details | Edit item |
| `/finance` | `app/(dashboard)/finance/page.tsx` | Financial dashboard | Stat cards, tabs (Invoices/Payments), Sage sync | Sync with Sage, record payment, mark as paid |
| `/finance/approvals` | `app/(dashboard)/finance/approvals/page.tsx` | **Admin Approval Queue** | Pending quotes, approval list, status filters | Approve, Send Back with notes |
| `/finance/invoices` | `app/(dashboard)/finance/invoices/page.tsx` | Invoice list | Invoice table | View invoices |
| `/reports` | `app/(dashboard)/reports/page.tsx` | Reports dashboard | Sales funnel visualization, stat cards, engineer performance table | Export reports, filter by date/customer |
| `/reports/[type]` | `app/(dashboard)/reports/[type]/page.tsx` | Report type detail | Dynamic report content | View specific report |
| `/rms` | `app/(dashboard)/rms/page.tsx` | Remote Monitoring System | Camera site cards, stat cards, status indicators | Sync site, view live feed |
| `/rms/[id]` | `app/(dashboard)/rms/[id]/page.tsx` | RMS site detail | Site cameras and status | View camera details |
| `/settings` | `app/(dashboard)/settings/page.tsx` | Settings page | Tabs (Profile/Notifications/Security/Roles/Templates) | Update profile, manage roles, edit templates |
| `/settings/roles/[id]` | `app/(dashboard)/settings/roles/[id]/page.tsx` | Role detail page | Role permissions | Edit role permissions |

---

## 3. Global Layout & Navigation

### Sidebar
- **File**: `components/layout/sidebar.tsx`
- **Behaviour**: Collapsible (56px collapsed, 224px expanded)
- **Logo**: "AEM CRM" text (hidden when collapsed)
- **Navigation Items** (V2 order):
  1. Dashboard (`/`)
  2. **Tasks** (`/tasks`) - *NEW*
  3. **Sites** (`/sites`) - *NEW, primary workspace*
  11. Reports (`/reports`)
  12. Accounts (`/accounts`) - *demoted to secondary*
  13. Projects (`/projects`)
  14. RMS (`/rms`)
- **Bottom Section**: Settings (`/settings`)
- **Active State**: Primary color background with primary text
- **Tooltips**: Shown when collapsed

### Topbar
- **File**: `components/layout/topbar.tsx`
- **Height**: 56px (h-14)
- **Left**: Page title and optional subtitle
- **Right Actions**:
  - Search button (icon only)
  - Notifications button with indicator dot
  - User menu dropdown (avatar + name)
- **User Menu Items**: Profile, Settings, Log out

### Global Providers
- **DrawerProvider** (`components/layout/drawer-provider.tsx`): Side panel for forms and details
  - Width: 400px (540px on sm+)
  - Triggered via `useDrawer()` hook with `openDrawer({ title, description, content })`
- **ModalProvider** (`components/layout/modal-provider.tsx`): Centered dialog for confirmations
  - Sizes: sm, md, lg, xl, full
  - Methods: `openModal()`, `closeModal()`, `openConfirmation()`

---

## 4. Module Breakdown

### Dashboard Module (V2 Enhanced)
- **Description**: **Personal dashboard** filtered to current user with motivational elements
- **Screens**: Home page only
- **Components**: Progress bar, MetricCard, TaskCard, LeadCard, QuoteCard, CalendarWidget, **ActivityBrief**
- **Data Shown**:
    - Revenue target progress (MTD vs target)
    - My Tasks (today + overdue with urgency highlighting)
    - My Leads (assigned to current user)
    - My Quotes (with Big Deal badges)
    - My Sites (managed by current user)
    - Weekly calendar summary
    - **Recent Activity stream**

### Activity Logging System (V2 New)
- **Description**: Centralized tracking of all system and user actions across entities
- **Placement**: Integrated into Leads, Accounts, and Contacts detail views
- **Components**: ActivityTimeline, ActivityIcon
- **Event Types**:
    - `system_notification`: Automated system events (blue)
    - `status_change`: State transitions (amber)
    - `note`: Manual user entries (slate)
    - `quote_sent`: Document generation (blue)
    - `milestone`: Major project/lead events (green)
- **Features**: Filterable timeline, user attribution, timestamped history

### E-Signature Module (V2 New)
- **Description**: Legally binding digital document signing for contracts and job sign-offs
- **Screens**: Internal Detail views, **Public Signing Page** (`/sign/[token]`)
- **Components**: SignatureCapture (Canvas-based), PDFPreview
- **Workflows**:
    - **In-Field Sign-off**: Engineers capture client signatures on tablets after job completion
    - **Remote Signing**: Clients receive a link to a public signing interface with T&Cs acceptance
- **Features**: Hand-drawn signature capture, timestamping, success confirmation with download

### Notifications System (V2 New)
- **Description**: Centralized alert management hub
- **Screens**: Notifications list page (`/notifications`), Topbar dropdown
- **Event Types**: Job assignment, low stock, overdue invoices, unsigned contracts, system alerts
- **Features**: Mark as read/unread, bulk clear, type-based filtering, urgency indicators

### RBAC UI Enforcement (V2 New)
- **Description**: Role-Based Access Control system to restrict UI features and routes
- **Implementation**: PermissionGuard component and useAuth hook
- **Roles**:
    - **Super Admin**: Full unrestricted access
    - **BDM**: Sales-focused access (Leads, Quotes, Customers)
    - **Admin/Accounts**: Operations and Finance (Invoices, Accounts, Sites)
    - **Engineer**: Field operations focus (Jobs, Scheduling, Inventory)
- **Security**: Route-level protection and conditional component rendering

### Leads Module
- **Description**: Lead/opportunity pipeline management with Kanban board
- **Screens**: List page, detail page
- **Components**: SortableLeadCard, KanbanColumn, LeadCardStatic, MetricCard, CreateLeadForm, AddNoteForm, ActivityTimeline, EmptyState
- **Data Shown**: Leads with id, name, company, email, phone, source, status, owner, value, lastActivity, createdAt
- **Statuses**: new, contacted, qualified, proposal, negotiation, won, lost
- **Views**: Kanban (default), Table (toggle)
- **Features**: Drag-and-drop between columns, search, status/owner filters

### Tasks Module (V2 New)
- **Description**: Personal task management with Kanban pipeline
- **Screens**: My Tasks page (Kanban), All Tasks page (table)
- **Components**: SortableTaskCard, PipelineColumn, TaskDetailDrawer
- **Data Shown**: Tasks with id, title, type (call, email, site_visit, follow_up, admin), siteId, siteName, contactName, status, dueDate, assignee, priority, notes
- **Pipeline Stages**: New, Attempted, Callback Arranged, Waiting Response, Completed
- **Urgency Indicators**: Normal (gray), Due Soon (amber, within 24h), Overdue (red)
- **Features**: Drag-and-drop, search, type/status filters, task detail drawer

### Sites Module (V2 New)
- **Description**: Primary workspace for site-first operations (Company → Region → Site hierarchy)
- **Screens**: Site list page, site detail page
- **Components**: SiteCard, SiteDetailTabs, CreateSiteDrawer, AddDocumentLinkForm
- **Data Shown**: Sites with id, name, address, regionId, regionName, companyId, companyName, coordinates, bdm, status, projectsCount
- **Detail Tabs**: Overview, **Contacts**, Tasks, Quotes, Jobs, Documents (links only)
- **Features**: Company/region hierarchy breadcrumb, filters, create site drawer

### Contacts Module (V2 New)
- **Description**: Dedicated contact management with multi-site linking
- **Screens**: Contacts list, Contact detail
- **Components**: StatCard (Director/QS), ContactTable, ContactDetailTabs
- **Data Shown**: Contacts with id, name, role (QS, Director, Manager, Other), company, email, phone, linked sites count, preferred contact method
- **Detail Tabs**: Overview, Linked Sites, Tasks, Quotes, Activity Timeline
- **Features**: One contact to many sites, role-based filtering, site-context viewing

### Regions Module (V2 New)
- **Description**: Geographic territory management
- **Screens**: Regions list page
- **Components**: MetricCard, RegionTable
- **Data Shown**: Regions with id, name, companyId, manager, sitesCount, coordinates, color
- **Features**: Search, link to filter sites by region

### Quotes Module (V2 Enhanced)
- **Description**: Quote pipeline with sales intelligence features
- **Screens**: List page (Kanban + table), detail page
- **Components**: SortableQuoteCard, PipelineColumn, LostReasonModal, BigDealBadge, StatCard
- **Data Shown**: Quotes with id, clientName, clientCompany, value, status, version, createdAt, expiresAt, **pipelineStage**, **isBigDeal**, **lostReason**, **lostNotes**
- **Pipeline Stages**: Draft, Sent, Follow-up Pending, Accepted, Rejected
- **Statuses**: draft, sent, approved, rejected, expired
- **Features**:
  - **Kanban pipeline view** with drag-and-drop
  - **Big Deal toggle** (star icon, golden badge)
  - **Lost Reason modal** when moving to Rejected
  - Table view preserved as toggle

### Accounts Module
- **Description**: Customer/company account management
- **Screens**: List page, detail page
- **Components**: StatCard, CreateAccountForm, EmptyState
- **Data Shown**: Accounts with id, name, type, status, totalProjects, revenue, location, contact info, address, createdAt
- **Types**: residential, commercial, enterprise
- **Statuses**: active, inactive, on_hold
- **Features**: Type/status filters, table view

### Projects Module
- **Description**: Project tracking with progress
- **Screens**: List page, detail page
- **Components**: StatCard, CreateProjectForm, EmptyState
- **Data Shown**: Projects with id, name, customer, status, budget, progress, manager
- **Statuses**: planning, in_progress, on_hold, completed
- **Features**: Status filters, progress bars in table

### Scheduling Module (V2 Enhanced)
- **Description**: Weekly job calendar with **Sales/Engineer calendar toggle**
- **Screens**: Calendar page, job detail page
- **Components**: SortableJobCard, DroppableDay, JobCardStatic, StatCard, InfoRow, JobDetailDrawer, **CalendarTypeToggle**
- **Data Shown**: Jobs with id, projectId, customerId, customerName, title, address, date, startTime, endTime, engineers, status, notes
- **Calendar Types**:
  - **Sales Calendar**: Site visits and sales meetings
  - **Engineer Jobs Calendar**: Field service and installation jobs
- **Statuses**: scheduled, in_progress, completed, cancelled
- **Features**: Week navigation, drag-drop jobs, **calendar type toggle**, job detail drawer

### Field Ops Module (V2 Enhanced)
- **Description**: Real-time field operations tracking with **static map view**
- **Screens**: Main page only (no detail page)
- **Components**: StaticMapView, SitePin, SiteDetailDrawer, WorkOrderCard, TechnicianCard
- **Data Shown**: Work orders with id, site, siteId, task, technician, status, priority, eta; Sites with coordinates for map
- **Tabs**: **Map View** (default), Work Orders, Technicians
- **Map Features**:
  - CSS-positioned clickable pins
  - Pin colors: Active Job (green pulse), Active Site (blue), Inactive (gray)
  - Hover tooltip: site name, region, BDM
  - Click opens site detail drawer
- **Technicians & Work Orders**:
  - Full drawer-based interaction pattern (matching rest of app)
  - Interactive technician cards with current assignment status
- **Priority Levels**: low, medium, high, urgent

### Inventory Module (V2 Enhanced)
- **Description**: Stock and parts management with **equipment lifecycle tracking**
- **Screens**: List page, detail page
- **Components**: StatCard, AddItemForm, AdjustStockForm
- **Data Shown**: Items with id, partName, sku, stockLevel, reorderLevel, unitCost, location, supplier, status, **condition** (new/reused), **scheduledDeduction**, lastUpdated
- **Statuses**: in_stock, low_stock, out_of_stock
- **Conditions**: New, Reused
- **Features**: Location filters, **condition filter**, stock adjustment, scheduled deduction indicator, add new items

### Finance Module (V2 Enhanced)
- **Description**: Invoicing, payment tracking, and **admin approval workflow**
- **Screens**: Main page, invoices subpage, **approvals page**
- **Components**: StatCard, SageSyncModalContent, RecordPaymentForm, **ApprovalQueueTable**, **SendBackForm**
- **Data Shown**: 
  - Invoices: id, date, customerId, customerName, amount, vatAmount, totalAmount, status, dueDate, paidDate
  - Payments: id, date, customerId, customerName, amount, method, invoiceId, reference
  - **Approvals**: id, quoteId, siteName, siteId, regionName, companyName, quoteValue, status, submittedBy, submittedAt, notes
- **Invoice Statuses**: draft, sent, paid, overdue, cancelled
- **Approval Statuses**: pending, approved, sent_back
- **Payment Methods**: bank_transfer, card, cash, cheque
- **Tabs**: Overview, Invoices, Payments
- **Routes**: `/finance`, `/finance/approvals`
- **Features**: Sage sync, record payment, **Approve/Send Back actions**, rejection notes

### Reports Module
- **Description**: Business analytics and reporting
- **Screens**: Main page, dynamic type pages
- **Components**: StatCard, FunnelStage
- **Data Shown**: Sales funnel metrics, monthly summary, customer breakdown
- **Features**: Date range selector, customer filter, export buttons

### RMS Module (Remote Monitoring System)
- **Description**: CCTV/camera site monitoring
- **Screens**: List page, site detail page
- **Components**: StatCard, site cards
- **Data Shown**: Sites with id, siteName, address, cameraCount, status, lastSync, cameras array
- **Statuses**: connected, offline, syncing, error
- **Features**: Sync now, view live feed, refresh

### Settings Module
- **Description**: User and system configuration
- **Screens**: Main settings page, role detail page
- **Tabs**: 
  - Profile: User info editing
  - Notifications: Email/push/SMS toggles
  - Security: 2FA, password change, sessions
  - Roles: Role list with permission matrix
  - Templates: Document templates (invoice, quote, email, job_sheet)
- **Data Shown**: Profile, notification preferences, security settings, roles with permissions, templates

---

## 5. Component Inventory

### UI Components (`components/ui/`)

| Component | File | Usage Context |
|-----------|------|---------------|
| Alert | `alert.tsx` | Status messages and notifications |
| Avatar | `avatar.tsx` | User profile images with fallback |
| Badge | `badge.tsx` | Status indicators, tags, labels |
| Button | `button.tsx` | Primary actions, ghost buttons, icon buttons |
| Card | `card.tsx` | Content containers (CardHeader, CardTitle, CardDescription, CardContent) |
| Checkbox | `checkbox.tsx` | Boolean selections in forms |
| Dialog | `dialog.tsx` | Modal dialogs and confirmations |
| DropdownMenu | `dropdown-menu.tsx` | Action menus, context menus |
| Input | `input.tsx` | Text input fields |
| Label | `label.tsx` | Form field labels |
| Pagination | `pagination.tsx` | Table pagination controls |
| **Progress** | `progress.tsx` | **Revenue target progress bars (V2)** |
| Select | `select.tsx` | Dropdown selections |
| Separator | `separator.tsx` | Visual dividers |
| Sheet | `sheet.tsx` | Side panel/drawer component |
| Switch | `switch.tsx` | Toggle switches |
| Table | `table.tsx` | Data tables with header, body, row, cell |
| Tabs | `tabs.tsx` | Tab navigation (TabsList, TabsTrigger, TabsContent) |
| **Textarea** | `textarea.tsx` | **Multi-line text input (V2)** |
| Tooltip | `tooltip.tsx` | Hover information tooltips |

### Layout Components (`components/layout/`)

| Component | File | Usage Context |
|-----------|------|---------------|
| Sidebar | `sidebar.tsx` | Main navigation sidebar |
| Topbar | `topbar.tsx` | Page header with title and actions |
| DrawerProvider | `drawer-provider.tsx` | Global side drawer for forms |
| ModalProvider | `modal-provider.tsx` | Global modal/confirmation dialogs |

---

## 6. Forms, Tables & Interactions

### Forms

| Form | Location | Fields |
|------|----------|--------|
| CreateLeadForm | Leads page drawer | Name, company, email, phone, source (select), estimated value |
| AddNoteForm | Lead detail drawer | Note text (textarea) |
| CreateQuoteForm | Quotes page drawer | Client (select), value, expiry date |
| CreateAccountForm | Accounts page drawer | Name, type (select), contact name, email, phone, address |
| CreateProjectForm | Projects page drawer | Name, customer (select), budget, manager (select) |
| **CreateSiteForm** | Sites page drawer | **Name, address, company (select), region (select), BDM (V2)** |
| **CreateTaskForm** | Tasks page drawer | **Title, type, site (select), contact, due date, assignee (V2)** |
| **AddDocumentLinkForm** | Site detail drawer | **Document name, URL, source type (V2)** |
| **SendBackForm** | Finance approvals | **Rejection notes (V2)** |
| **LostReasonModal** | Quotes page modal | **Loss reason, notes (V2)** |
| AddItemForm | Inventory page drawer | Part name, SKU, quantity, reorder level, unit cost, location (select), supplier |
| AdjustStockForm | Inventory page drawer | Current stock (readonly), adjustment type (add/remove), quantity, reason |
| RecordPaymentForm | Finance page drawer | Amount, payment method (select), reference, date |
| Profile Form | Settings page | Name, email, phone, company name, job title |

### Tables

| Table | Location | Columns | Features |
|-------|----------|---------|----------|
| Leads Table | Leads page (table view) | Name, Company, Value, Status, Owner, Last Activity, Actions | Sort, filter, row click to detail |
| **Tasks Table** | Tasks/all page | **Title, Type, Site, Contact, Status, Due Date, Assignee, Actions** | **Type/status filters (V2)** |
| **Sites Table** | Sites page | **Name, Address, Region, Company, BDM, Projects, Status, Actions** | **Company/region filters (V2)** |
| **Regions Table** | Regions page | **Name, Company, Manager, Sites Count, Actions** | **Search (V2)** |
| Quotes Table | Quotes page | Quote #, Client, Value, Status, Version, Created, Expires, Actions | Status filter, row actions |
| **Approvals Table** | Finance approvals | **Quote ID, Site, Region, Company, Value, Status, Submitted By, Actions** | **Status filter (V2)** |
| Accounts Table | Accounts page | Name, Type, Status, Projects, Revenue, Location, Actions | Type/status filters |
| Projects Table | Projects page | Name, Customer, Status, Budget, Progress, Manager, Actions | Progress bars |
| Inventory Table | Inventory page | Part Name, SKU, Stock Level, Reorder Level, Unit Cost, Location, **Condition**, Status, Actions | Location filter, **condition filter (V2)** |
| Invoices Table | Finance page | Invoice #, Customer, Amount, VAT, Total, Status, Due Date, Actions | Status badges |
| Payments Table | Finance page | Reference, Customer, Amount, Method, Date, Invoice | Method icons |
| Engineer Performance | Reports page | Engineer, Jobs Completed, Avg Duration, Customer Rating | Sorted by performance |
| Sessions Table | Settings security | Device, Location, Last Active, Actions | Revoke session |
| Roles Table | Settings page | Role, Description, Users, Actions | Navigate to role detail |
| Templates Table | Settings page | Name, Type, Last Modified, Status, Actions | Type badges |

### Modals & Drawers

| Trigger | Type | Purpose |
|---------|------|---------|
| "New Lead" button | Drawer | Create new lead form |
| "New Quote" button | Drawer | Create new quote form |
| "New Account" button | Drawer | Create new account form |
| "New Project" button | Drawer | Create new project form |
| "New Job" button | Drawer | Create new scheduled job |
| **"New Site" button** | Drawer | **Create new site form (V2)** |
| **"New Task" button** | Drawer | **Create new task form (V2)** |
| **"Add Document Link" button** | Drawer | **Add external document link (V2)** |
| "Add Item" button | Drawer | Add inventory item |
| "Adjust Stock" action | Drawer | Adjust inventory quantity |
| "Record Payment" action | Drawer | Record payment for invoice |
| Job card click | Drawer | View job details |
| **Task card click** | Drawer | **View task details (V2)** |
| **Site pin click (Field Ops)** | Drawer | **View site details on map (V2)** |
| "Convert" button | Modal (confirmation) | Convert lead to account |
| "Delete" action | Modal (confirmation) | Delete confirmation |
| "Add Note" action | Modal | Add note to lead |
| "Sync with Sage" button | Modal | Sage sync status dialog |
| **"Reject Quote"** | Modal | **Lost reason form (V2)** |
| **"Send Back" (approvals)** | Drawer | **Rejection notes form (V2)** |

---

## 7. State & Mock Data

### Mock Data Files (`mock-data/`)

| File | Shape | Usage |
|------|-------|-------|
| `leads.json` | `{ id, name, company, email, phone, source, status, owner, value, lastActivity, createdAt }[]` | Leads list and detail |
| `accounts.json` | `{ id, name, type, status, totalProjects, revenue, location, contactName, contactEmail, contactPhone, address, createdAt }[]` | Accounts list |
| `sites.json` | `{ id, accountId, name, address, status, projectsCount, createdAt, **regionId, regionName, companyId, companyName, coordinates, bdm** }[]` | **Site list, Field Ops map (V2)** |
| **`regions.json`** | `{ id, name, companyId, companyName, manager, sitesCount, status, coordinates, color }[]` | **Regions list (V2)** |
| **`companies.json`** | `{ id, name, status, regionsCount, sitesCount }[]` | **Company hierarchy (V2)** |
| **`contacts.json`** | `{ id, name, role, email, phone, company, preferredContact, linkedSites[] }[]` | **Contacts module (V2)** |
| **`tasks.json`** | `{ id, title, type, siteId, siteName, contactName, status, dueDate, assignee, priority, notes }[]` | **Tasks module (V2)** |
| `quotes.json` | `{ id, clientName, clientCompany, value, status, version, createdAt, expiresAt, **pipelineStage, isBigDeal, lostReason, lostNotes** }[]` | **Quote pipeline (V2)** |
| `jobs.json` | `{ id, title, customer, address, time, engineer, status }[]` | Dashboard jobs |
| `scheduled-jobs.json` | `{ id, projectId, customerId, customerName, title, address, date, startTime, endTime, engineers, status, notes }[]` | Scheduling calendar |
| `inventory.json` | `{ id, partName, sku, stockLevel, reorderLevel, unitCost, location, supplier, status, **condition, scheduledDeduction**, lastUpdated }[]` | **Inventory lifecycle (V2)** |
| `inventory-alerts.json` | Low stock alerts | Dashboard alerts |
| `invoices.json` | `{ id, date, customerId, customerName, amount, vatAmount, totalAmount, status, dueDate, paidDate, projectId }[]` | Finance invoices |
| `payments.json` | `{ id, date, customerId, customerName, amount, method, invoiceId, reference }[]` | Finance payments |
| `projects.json` | `{ id, name, customer, status, budget, progress, manager }[]` | Projects list |
| `reports.json` | Sales funnel data, monthly summary, engineer performance | Reports page |
| `rms.json` | `{ sites[], summary }` | RMS camera sites |
| `settings.json` | `{ profile, notifications, security, roles, permissions, templates, systemPreferences }` | Settings page |
| `engineers.json` | Engineer list | Scheduling assignments |
| `users.json` | User list | Owner dropdowns |
| `activities.json` | Activity timeline entries | Lead detail |
| `notes.json` | Notes for leads | Lead detail |
| `documents.json` | Document references | Various |
| `pipeline.json` | Pipeline stage definitions | Leads |
| `field-jobs.json` | Field work orders | Field ops |
| `line-items.json` | Quote line items | Quote detail |
| `job-sheets.json` | Job sheet data | Field ops |
| `project-inventory.json` | Project material usage | Projects |

### Data Flow
- Pages import mock data directly as constants or from JSON files
- State is managed locally with `useState` hooks
- No global state management (Redux, Zustand, etc.)
- Forms use local state; submissions log to console only
- Filters and search operate on client-side data arrays

---

## 8. Responsiveness & UX Notes

### Mobile Handling
- Sidebar: Collapses to icons only on narrow viewports
- Tables: Horizontal scroll on mobile
- Grid layouts: Responsive columns (1 → 2 → 4 based on breakpoint)
- Topbar: User name hidden on mobile (`hidden sm:inline`)
- Cards: Stack vertically on mobile

### Known UX Patterns
- **Consistent Card Layout**: All pages use Card components for content sections
- **Stat Cards**: 3-4 stat cards at top of list pages showing key metrics
- **Empty States**: Consistent empty state component with icon, title, description, optional action
- **Status Badges**: Color-coded badges for all status fields
- **Table Actions**: "..." menu with View, Edit, Delete options
- **Drawer Forms**: Side panel for all create/edit forms
- **Confirmation Modals**: For destructive actions (delete, convert)
- **Tabs**: Used for switching between views within a module
- **Search + Filters**: Consistent placement at top of list views
- **Date Formatting**: Global standardization to `en-GB` (`DD/MM/YYYY`)

### Design Language
- **Colors**: Primary blue, green for success, red for errors/urgent, amber for warnings, purple for in-progress states
- **Typography**: Semibold headings, regular body text, muted-foreground for secondary text
- **Spacing**: 6px gap for card grids, 4px for inline elements
- **Borders**: Subtle borders (`border-slate-200`), rounded corners (`rounded-lg`, `rounded-xl`)
- **Shadows**: Minimal shadows, `shadow-sm` on cards
- **Icons**: Lucide React icons throughout

---

## 9. Known Gaps & Remaining Items

### Resolved in V2 ✅
- ~~**Field Ops**: Map View tab shows placeholder text only~~ → **Implemented with static map and clickable pins**
- ~~**No dedicated Tasks module**~~ → **Tasks module implemented with Kanban pipeline**
- ~~**No dedicated Contacts module**~~ → **Contacts module implemented with detail tabs**
- ~~**Sites not prominently featured**~~ → **Sites is now the primary workspace**
- ~~**Regions not implemented**~~ → **Regions module added**
- ~~**No Company hierarchy**~~ → **Company → Region → Site structure implemented**
- ~~**Leads page** is the only Kanban view~~ → **Quotes and Tasks now have Kanban views too**
- ~~**Field Ops Inconsistency**~~ → **Standardized to drawer-based details for all entities**
- ~~**Mixed Date Formats**~~ → **Standardized to en-GB across all modules**
- ~~**Inline Mock Data**~~ → **All identified inline mock data moved to JSON files**

### Remaining Gaps

#### Missing Screens
- *None identified in current scope*

#### Partial Implementations
- **Lead conversion**: "Convert to Account" shows confirmation but doesn't actually create account
- **Quote creation**: Form exists but doesn't persist data
- **Sage sync**: Modal shows sync UI but no actual integration
- **RMS live feed**: "View Live" action button exists but no feed viewer
- **Inventory decommission**: Condition tracking added but full decommission workflow not implemented

#### Data Model Gaps
- **Lead-Site linkage**: Leads are not explicitly linked to sites (tasks bridge this gap)

#### UX Inconsistencies & Verifications
- **Mobile responsiveness**: Verified and improved for Tasks Kanban, Scheduling calendar, and Map view
- **Mock Data**: Verified that all primary operational pages use external JSON data

#### Unused Files/Components
- `app/(auth)` route group exists but contains no pages
- Some mock data files are not imported by any page
