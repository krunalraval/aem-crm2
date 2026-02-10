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
| `/` | `app/(dashboard)/page.tsx` | Main dashboard | 4 KPI cards, pipeline summary, today's jobs, low inventory alerts | View leads, view schedule, create purchase order |
| `/leads` | `app/(dashboard)/leads/page.tsx` | Lead pipeline management | Kanban board, table view toggle, stat cards, filters | Create lead, drag between stages, view details |
| `/leads/[id]` | `app/(dashboard)/leads/[id]/page.tsx` | Lead detail view | Info card, tabs (Overview/Activity/Quotes/Notes), activity timeline | Edit, convert to account, add note, delete |
| `/quotes` | `app/(dashboard)/quotes/page.tsx` | Quote management | Stat cards, table with filters, status badges | Create quote, duplicate, delete |
| `/quotes/[id]` | `app/(dashboard)/quotes/[id]/page.tsx` | Quote detail view | Quote details with versioning | View, edit quote |
| `/accounts` | `app/(dashboard)/accounts/page.tsx` | Account/company management | Stat cards, table, type/status filters | Create account, view details, delete |
| `/accounts/[id]` | `app/(dashboard)/accounts/[id]/page.tsx` | Account detail view | Account information and related data | Edit, delete account |
| `/projects` | `app/(dashboard)/projects/page.tsx` | Project tracking | Stat cards, table with progress bars, status filters | Create project, view details |
| `/projects/[id]` | `app/(dashboard)/projects/[id]/page.tsx` | Project detail view | Project details | Edit project |
| `/scheduling` | `app/(dashboard)/scheduling/page.tsx` | Job scheduling calendar | Weekly calendar view, drag-drop jobs, stat cards | Create job, navigate weeks, reassign jobs |
| `/scheduling/[id]` | `app/(dashboard)/scheduling/[id]/page.tsx` | Job detail view | Job details | Edit job |
| `/field-ops` | `app/(dashboard)/field-ops/page.tsx` | Field operations dashboard | 4 stat cards, tabs (Work Orders/Map/Technicians) | View work orders |
| `/inventory` | `app/(dashboard)/inventory/page.tsx` | Inventory management | Stat cards, table with stock levels, location filters | Add item, adjust stock, delete |
| `/inventory/[id]` | `app/(dashboard)/inventory/[id]/page.tsx` | Inventory item detail | Item details | Edit item |
| `/finance` | `app/(dashboard)/finance/page.tsx` | Financial dashboard | Stat cards, tabs (Invoices/Payments), Sage sync | Sync with Sage, record payment, mark as paid |
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
- **Navigation Items**:
  1. Dashboard (`/`)
  2. Leads (`/leads`)
  3. Quotes (`/quotes`)
  4. Accounts (`/accounts`)
  5. Projects (`/projects`)
  6. Scheduling (`/scheduling`)
  7. Field Ops (`/field-ops`)
  8. Inventory (`/inventory`)
  9. Finance (`/finance`)
  10. Reports (`/reports`)
  11. RMS (`/rms`)
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

### Dashboard Module
- **Description**: Overview of key business metrics and actionable items
- **Screens**: Home page only
- **Components**: KPICard, EmptyState
- **Data Shown**: Active leads count, monthly revenue, jobs today, active engineers, pipeline stages, upcoming jobs, low inventory alerts

### Leads Module
- **Description**: Lead/opportunity pipeline management with Kanban board
- **Screens**: List page, detail page
- **Components**: SortableLeadCard, KanbanColumn, LeadCardStatic, MetricCard, CreateLeadForm, AddNoteForm, ActivityTimeline, EmptyState
- **Data Shown**: Leads with id, name, company, email, phone, source, status, owner, value, lastActivity, createdAt
- **Statuses**: new, contacted, qualified, proposal, negotiation, won, lost
- **Views**: Kanban (default), Table (toggle)
- **Features**: Drag-and-drop between columns, search, status/owner filters

### Quotes Module
- **Description**: Quote creation and tracking
- **Screens**: List page, detail page
- **Components**: StatCard, CreateQuoteForm, EmptyState
- **Data Shown**: Quotes with id, clientName, clientCompany, value, status, version, createdAt, expiresAt
- **Statuses**: draft, sent, approved, rejected, expired
- **Features**: Status filters, table view, duplicate, delete

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

### Scheduling Module
- **Description**: Weekly job calendar with drag-and-drop
- **Screens**: Calendar page, job detail page
- **Components**: SortableJobCard, DroppableDay, JobCardStatic, StatCard, InfoRow, JobDetailDrawer
- **Data Shown**: Jobs with id, projectId, customerId, customerName, title, address, date, startTime, endTime, engineers, status, notes
- **Statuses**: scheduled, in_progress, completed, cancelled
- **Features**: Week navigation (prev/next/today), drag-drop jobs between days, job detail drawer

### Field Ops Module
- **Description**: Real-time field operations tracking
- **Screens**: Main page only (no detail page)
- **Components**: Card-based work order list
- **Data Shown**: Work orders with id, site, task, technician, status, priority, eta
- **Tabs**: Work Orders (implemented), Map View (placeholder), Technicians (placeholder)
- **Priority Levels**: low, medium, high, urgent

### Inventory Module
- **Description**: Stock and parts management
- **Screens**: List page, detail page
- **Components**: StatCard, AddItemForm, AdjustStockForm
- **Data Shown**: Items with id, partName, sku, stockLevel, reorderLevel, unitCost, location, supplier, status, lastUpdated
- **Statuses**: in_stock, low_stock, out_of_stock
- **Features**: Location filters, stock adjustment, add new items

### Finance Module
- **Description**: Invoicing and payment tracking
- **Screens**: Main page, invoices subpage
- **Components**: StatCard, SageSyncModalContent, RecordPaymentForm
- **Data Shown**: 
  - Invoices: id, date, customerId, customerName, amount, vatAmount, totalAmount, status, dueDate, paidDate
  - Payments: id, date, customerId, customerName, amount, method, invoiceId, reference
- **Invoice Statuses**: draft, sent, paid, overdue, cancelled
- **Payment Methods**: bank_transfer, card, cash, cheque
- **Tabs**: Overview, Invoices, Payments
- **Features**: Sage sync button, record payment, mark as paid

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
| Select | `select.tsx` | Dropdown selections |
| Separator | `separator.tsx` | Visual dividers |
| Sheet | `sheet.tsx` | Side panel/drawer component |
| Switch | `switch.tsx` | Toggle switches |
| Table | `table.tsx` | Data tables with header, body, row, cell |
| Tabs | `tabs.tsx` | Tab navigation (TabsList, TabsTrigger, TabsContent) |
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
| AddItemForm | Inventory page drawer | Part name, SKU, quantity, reorder level, unit cost, location (select), supplier |
| AdjustStockForm | Inventory page drawer | Current stock (readonly), adjustment type (add/remove), quantity, reason |
| RecordPaymentForm | Finance page drawer | Amount, payment method (select), reference, date |
| Profile Form | Settings page | Name, email, phone, company name, job title |

### Tables

| Table | Location | Columns | Features |
|-------|----------|---------|----------|
| Leads Table | Leads page (table view) | Name, Company, Value, Status, Owner, Last Activity, Actions | Sort, filter, row click to detail |
| Quotes Table | Quotes page | Quote #, Client, Value, Status, Version, Created, Expires, Actions | Status filter, row actions |
| Accounts Table | Accounts page | Name, Type, Status, Projects, Revenue, Location, Actions | Type/status filters |
| Projects Table | Projects page | Name, Customer, Status, Budget, Progress, Manager, Actions | Progress bars |
| Inventory Table | Inventory page | Part Name, SKU, Stock Level, Reorder Level, Unit Cost, Location, Status, Actions | Location filter |
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
| "Add Item" button | Drawer | Add inventory item |
| "Adjust Stock" action | Drawer | Adjust inventory quantity |
| "Record Payment" action | Drawer | Record payment for invoice |
| Job card click | Drawer | View job details |
| "Convert" button | Modal (confirmation) | Convert lead to account |
| "Delete" action | Modal (confirmation) | Delete confirmation |
| "Add Note" action | Modal | Add note to lead |
| "Sync with Sage" button | Modal | Sage sync status dialog |

---

## 7. State & Mock Data

### Mock Data Files (`mock-data/`)

| File | Shape | Usage |
|------|-------|-------|
| `leads.json` | `{ id, name, company, email, phone, source, status, owner, value, lastActivity, createdAt }[]` | Leads list and detail |
| `accounts.json` | `{ id, name, type, status, totalProjects, revenue, location, contactName, contactEmail, contactPhone, address, createdAt }[]` | Accounts list |
| `sites.json` | `{ id, accountId, name, address, status, projectsCount, createdAt }[]` | Account sites |
| `quotes.json` | `{ id, clientName, clientCompany, value, status, version, createdAt, expiresAt }[]` | Quotes list |
| `jobs.json` | `{ id, title, customer, address, time, engineer, status }[]` | Dashboard jobs |
| `scheduled-jobs.json` | `{ id, projectId, customerId, customerName, title, address, date, startTime, endTime, engineers, status, notes }[]` | Scheduling calendar |
| `inventory.json` | `{ id, partName, sku, stockLevel, reorderLevel, unitCost, location, supplier, status, lastUpdated }[]` | Inventory list |
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

### Design Language
- **Colors**: Primary blue, green for success, red for errors/urgent, amber for warnings, purple for in-progress states
- **Typography**: Semibold headings, regular body text, muted-foreground for secondary text
- **Spacing**: 6px gap for card grids, 4px for inline elements
- **Borders**: Subtle borders (`border-slate-200`), rounded corners (`rounded-lg`, `rounded-xl`)
- **Shadows**: Minimal shadows, `shadow-sm` on cards
- **Icons**: Lucide React icons throughout

---

## 9. Known Gaps & Inconsistencies

### Missing Screens
- **Field Ops**: Map View tab shows placeholder text only
- **Field Ops**: Technicians tab shows placeholder text only
- **No dedicated Tasks module**: Tasks are not implemented as a standalone module
- **No dedicated Contacts module**: Contacts exist only as fields within accounts/leads

### Partial Implementations
- **Lead conversion**: "Convert to Account" shows confirmation but doesn't actually create account
- **Quote creation**: Form exists but doesn't persist data
- **Sage sync**: Modal shows sync UI but no actual integration
- **RMS live feed**: "View Live" action button exists but no feed viewer

### Data Model Gaps
- **Sites**: Exist as sub-entities of Accounts but not prominently featured
- **Regions**: Not implemented; locations are flat text fields
- **Company hierarchy**: No Company → Region → Site structure
- **Lead-Site linkage**: Leads are not explicitly linked to sites

### UX Inconsistencies
- **Leads page** has both Kanban and Table views; other list pages only have table view
- **Field Ops** uses simpler card layout without drawer/modal patterns
- **Some pages** have inline mock data; others import from JSON files
- **Date formats** vary between pages (some use en-GB, some use default)

### Unused Files/Components
- `app/(auth)` route group exists but contains no pages
- Some mock data files are not imported by any page
