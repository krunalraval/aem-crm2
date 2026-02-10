// =============================================================================
// AEM CRM - Core Entity Types
// =============================================================================
// This file contains all TypeScript types and interfaces for the CRM data model.
// Ensure all components import from this file for type consistency.
// =============================================================================

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

// Company
export type CompanyType = "Main Contractor" | "Subcontractor" | "Both" | "Other";
export type CompanyIndustry = "Construction" | "Commercial" | "Residential" | "Other";
export type CompanyStatus = "Prospect" | "Active Customer" | "Inactive" | "Archived";

// Region
export type RegionStatus = "Active" | "Dormant" | "Not Yet Approached";

// Contact
export type PreferredCommunication = "Phone" | "Email" | "In-Person" | "WhatsApp";
export type ContactSource = "LinkedIn" | "Referral" | "Cold Call" | "Inbound" | "Website" | "Other";

// Site
export type SiteStatus =
    | "Lead/Prospect"
    | "Quote Sent"
    | "Contract Signed"
    | "Pending Install"
    | "Active"
    | "Under Service"
    | "Decommissioned"
    | "Archived";
export type SystemType = "Hardwired CCTV" | "Wireless CCTV (Ajax)" | "Tower System" | "Mixed" | "Other";
export type BillingFrequency = "Weekly" | "Fortnightly" | "Monthly" | "One-Off";

// Lead
export type LeadPipelineStage =
    | "New Lead"
    | "Contacted"
    | "Follow-Up Scheduled"
    | "Site Visit Booked"
    | "Site Visit Completed"
    | "Quote Sent"
    | "Awaiting Response"
    | "In Negotiation"
    | "Won"
    | "Lost/Rejected";
export type LeadSource =
    | "LinkedIn"
    | "Referral"
    | "Cold Call"
    | "Inbound"
    | "Website"
    | "Existing Client Expansion"
    | "Other";
export type LeadPriority = "Normal" | "High" | "VIP/Big Deal";
export type RejectionCategory =
    | "Price Too High"
    | "Competitor Won"
    | "Timing/Delayed"
    | "Client Changed Plans"
    | "Other";

// Quote
export type QuoteStatus =
    | "Draft"
    | "Sent"
    | "Awaiting Response"
    | "In Negotiation"
    | "Revised"
    | "Accepted"
    | "Rejected"
    | "Expired";

// Task
export type TaskType = "Call" | "Email" | "Meeting" | "Site Visit" | "Admin" | "Follow-Up" | "Approval" | "Other";
export type TaskPriority = "Normal" | "High" | "Urgent";
export type TaskStatus = "Not Started" | "In Progress" | "Waiting on Client" | "Complete" | "Cancelled";
export type AssociatedRecordType = "Company" | "Contact" | "Lead" | "Site" | "Job" | "Quote";
export type ReminderSetting = "None" | "At Due Time" | "1 Hour Before" | "1 Day Before" | "Custom";
export type ReminderMethod = "In-App" | "Email";
export type Recurrence = "None" | "Daily" | "Weekly" | "Monthly" | "Custom";

// Activity
export type ActivityType =
    | "Call"
    | "Email Sent"
    | "Email Received"
    | "Meeting"
    | "Site Visit"
    | "Note"
    | "Quote Sent"
    | "Contract Sent"
    | "Contract Signed"
    | "Status Change"
    | "System Notification";
export type ActivityOutcome = "Successful" | "No Answer" | "Voicemail Left" | "Rescheduled" | "Other";

// Job
export type JobType =
    | "Installation"
    | "Service"
    | "Preventative Maintenance"
    | "Repair"
    | "Decommission"
    | "Camera Change"
    | "Ad-Hoc";
export type JobStatus =
    | "Scheduled"
    | "In Transit"
    | "In Progress"
    | "Awaiting Sign-Off"
    | "Complete"
    | "Cancelled"
    | "Rescheduled";

// Invoice
export type InvoiceStatus =
    | "Draft"
    | "Pending Approval"
    | "Sent"
    | "Paid"
    | "Overdue"
    | "Disputed"
    | "Credited";

// Inventory
export type ItemCategory = "Camera" | "DVR/NVR" | "Router" | "Cable" | "Wireless Hub" | "Tower" | "Monitor" | "Misc";
export type ItemCondition = "New" | "Recycled/Refurbished";
export type EquipmentCondition = "New" | "Recycled";

// User
export type UserRole = "Super Admin" | "BDM" | "Admin/Accounts" | "Engineer";

// -----------------------------------------------------------------------------
// SUB-TYPES
// -----------------------------------------------------------------------------

export interface EquipmentAllocation {
    inventoryItemId: string;
    quantity: number;
    condition: EquipmentCondition;
}

export interface ChecklistItem {
    id: string;
    label: string;
    isMandatory: boolean;
    isCompleted: boolean;
}

// -----------------------------------------------------------------------------
// ENTITY INTERFACES
// -----------------------------------------------------------------------------

// 1. COMPANY
export interface Company {
    // Required
    id: string;
    companyName: string;
    companyType: CompanyType;
    industry: CompanyIndustry;
    accountOwnerBdmId: string;
    status: CompanyStatus;
    // Optional
    domain?: string;
    phone?: string;
    registeredAddress?: string;
    registrationNumber?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. REGION
export interface Region {
    // Required
    id: string;
    regionName: string;
    parentCompanyId: string;
    regionOwnerBdmId: string;
    // Optional
    coverageDescription?: string;
    status?: RegionStatus;
    notes?: string;
}

// 3. CONTACT
export interface Contact {
    // Required
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    associatedCompanyId: string;
    contactOwnerBdmId: string;
    // Optional
    jobTitle?: string;
    mobilePhone?: string;
    officePhone?: string;
    linkedInUrl?: string;
    preferredCommunication?: PreferredCommunication;
    associatedRegionId?: string;
    notes?: string;
    source?: ContactSource;
    createdAt?: Date;
    updatedAt?: Date;
}

// 4. SITE
export interface Site {
    // Required
    id: string;
    siteName: string;
    fullAddress: string;
    associatedCompanyId: string;
    primaryContactId: string;
    siteStatus: SiteStatus;
    assignedBdmId: string;
    // Optional
    what3words?: string;
    latitude?: number;
    longitude?: number;
    secondaryContactIds?: string[];
    systemType?: SystemType;
    numberOfCameras?: number;
    installationDate?: Date;
    contractStartDate?: Date;
    contractEndDate?: Date;
    contractDuration?: number; // Auto-calculated
    billingFrequency?: BillingFrequency;
    rate?: number;
    totalContractValue?: number; // Auto-calculated
    specialAccessInstructions?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// 5. LEAD
export interface Lead {
    // Required
    id: string;
    leadName: string;
    associatedCompanyId: string;
    associatedContactId: string;
    assignedBdmId: string;
    pipelineStage: LeadPipelineStage;
    createdAt: Date;
    // Optional
    estimatedValue?: number;
    expectedCloseDate?: Date;
    leadSource?: LeadSource;
    regionId?: string;
    notes?: string;
    priority?: LeadPriority;
    rejectionReason?: string; // Mandatory when stage = Lost/Rejected
    rejectionCategory?: RejectionCategory;
}

// 6. QUOTE
export interface Quote {
    // Required
    id: string;
    quoteReference: string; // Auto: "K2S-Q-XXXX"
    associatedLeadId: string;
    associatedCompanyId: string;
    associatedContactId: string;
    templateUsed: string;
    systemType: string;
    totalValue: number;
    billingTerms: BillingFrequency;
    rate: number;
    quoteStatus: QuoteStatus;
    createdBy: string;
    createdAt: Date;
    // Optional
    dateSent?: Date;
    additionalRecipients?: string[];
    validityPeriodDays?: number; // Default 30
    expiryDate?: Date; // Auto-calculated
    specialTerms?: string;
    discountPercent?: number;
    discountFixed?: number;
    rejectionReason?: string;
    rejectionCategory?: RejectionCategory;
    followUpReminderDate?: Date;
    versionNumber?: number; // Default 1
}

// 7. TASK
export interface Task {
    // Required
    id: string;
    taskTitle: string;
    taskType: TaskType;
    assignedToId: string;
    dueDate: Date;
    priority: TaskPriority;
    status: TaskStatus;
    // Optional
    dueTime?: string;
    description?: string;
    associatedRecordId?: string;
    associatedRecordType?: AssociatedRecordType;
    createdById?: string;
    reminderSetting?: ReminderSetting;
    reminderMethod?: ReminderMethod;
    recurrence?: Recurrence;
    completionNotes?: string;
}

// 8. ACTIVITY
export interface Activity {
    // Required
    id: string;
    activityType: ActivityType;
    description: string;
    dateTime: Date;
    performedById: string;
    associatedRecordId: string;
    associatedRecordType: string;
    // Optional
    duration?: number; // Minutes
    outcome?: ActivityOutcome;
    attachments?: string[];
}

// 9. JOB
export interface Job {
    // Required
    id: string;
    jobReference: string; // Auto: "K2S-J-XXXX"
    jobType: JobType;
    associatedSiteId: string;
    assignedEngineerId: string;
    scheduledDate: Date;
    status: JobStatus;
    // Optional
    scheduledTime?: string;
    estimatedDurationHours?: number;
    equipmentRequired?: EquipmentAllocation[];
    checklistItems?: ChecklistItem[];
    specialInstructions?: string;
    siteContactId?: string;
    accessInstructions?: string;
    photos?: string[];
    signOffDocumentUrl?: string;
    signOffSignatureUrl?: string;
    signedByName?: string;
    completionDateTime?: Date;
    completionNotes?: string;
    decommissionedEquipment?: EquipmentAllocation[];
}

// 10. INVOICE
export interface Invoice {
    // Required
    id: string;
    invoiceReference: string;
    associatedSiteId: string;
    associatedCompanyId: string;
    periodFrom: Date;
    periodTo: Date;
    amount: number;
    status: InvoiceStatus;
    createdAt: Date;
    // Optional
    poNumber?: string;
    dueDate?: Date;
    sageReference?: string;
    paymentDate?: Date;
    notes?: string;
    approvedById?: string;
    approvalDate?: Date;
}

// 11. INVENTORY ITEM
export interface InventoryItem {
    // Required
    id: string;
    itemName: string;
    itemCategory: ItemCategory;
    currentQuantity: number;
    condition: ItemCondition;
    lowStockThreshold: number;
    // Optional
    serialNumber?: string;
    supplier?: string;
    unitCost?: number;
    location?: string;
    lastRestockedDate?: Date;
    notes?: string;
    qrBarcodeRef?: string;
}

// 12. USER
export interface User {
    // Required
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    assignedColour: string; // Hex code for map pins
    // Optional
    phone?: string;
    avatarUrl?: string;
    isActive?: boolean;
}
