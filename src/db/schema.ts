/**
 * Schéma Drizzle principal pour LBS Call Center.
 * Ce fichier définit les tables de base du produit hors RAG et hors Twilio.
 */
import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "agent",
]);
export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "expired",
]);
export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
]);
export const campaignPermissionEnum = pgEnum("campaign_permission", [
  "owner",
  "editor",
  "viewer",
]);
export const contactSourceEnum = pgEnum("contact_source", [
  "excel_import",
  "manual_form",
  "campaign_reuse",
]);
export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export const callOutcomeEnum = pgEnum("call_outcome", [
  "interested",
  "not_interested",
  "callback",
  "no_answer",
  "false_number",
  "whatsapp_follow_up",
  "other",
]);
export const otpStatusEnum = pgEnum("otp_status", ["pending", "used", "expired"]);
export const otpPurposeEnum = pgEnum("otp_purpose", ["password_reset"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    role: userRoleEnum("role").notNull(),
    status: userStatusEnum("status").notNull().default("active"),
    avatarUrl: text("avatar_url"),
    createdByUserId: uuid("created_by_user_id").references((): AnyPgColumn => users.id, {
      onDelete: "set null",
    }),
    managedByAdminId: uuid("managed_by_admin_id").references((): AnyPgColumn => users.id, {
      onDelete: "set null",
    }),
    campaignAccessExpiresAt: timestamp("campaign_access_expires_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    usersEmailUniqueIdx: uniqueIndex("users_email_unique_idx").on(table.email),
    usersRoleIdx: index("users_role_idx").on(table.role),
    usersManagedByAdminIdx: index("users_managed_by_admin_idx").on(
      table.managedByAdminId,
    ),
  }),
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 180 }).notNull(),
    year: integer("year").notNull(),
    baseScript: text("base_script").notNull(),
    details: text("details"),
    pdfUrl: text("pdf_url"),
    status: campaignStatusEnum("status").notNull().default("draft"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdByAdminId: uuid("created_by_admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    campaignsCreatedByAdminIdx: index("campaigns_created_by_admin_idx").on(
      table.createdByAdminId,
    ),
    campaignsStatusIdx: index("campaigns_status_idx").on(table.status),
  }),
);

export const campaignCollaborators = pgTable(
  "campaign_collaborators",
  {
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permission: campaignPermissionEnum("permission").notNull().default("editor"),
    addedByAdminId: uuid("added_by_admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    campaignCollaboratorsPk: primaryKey({
      columns: [table.campaignId, table.adminId],
      name: "campaign_collaborators_pk",
    }),
    campaignCollaboratorsPermissionIdx: index(
      "campaign_collaborators_permission_idx",
    ).on(table.permission),
  }),
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 120 }).notNull(),
    lastName: varchar("last_name", { length: 120 }),
    email: varchar("email", { length: 255 }),
    schoolName: varchar("school_name", { length: 255 }),
    desiredProgram: varchar("desired_program", { length: 255 }),
    city: varchar("city", { length: 120 }),
    phonePrimary: varchar("phone_primary", { length: 30 }).notNull(),
    phoneSecondary: varchar("phone_secondary", { length: 30 }),
    normalizedPhonePrimary: varchar("normalized_phone_primary", {
      length: 30,
    }).notNull(),
    normalizedPhoneSecondary: varchar("normalized_phone_secondary", {
      length: 30,
    }),
    metadata: jsonb("metadata")
      .$type<Record<string, string | number | boolean | null>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    contactsPhonePrimaryUniqueIdx: uniqueIndex(
      "contacts_phone_primary_unique_idx",
    ).on(table.normalizedPhonePrimary),
    contactsEmailIdx: index("contacts_email_idx").on(table.email),
  }),
);

export const campaignContacts = pgTable(
  "campaign_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "restrict" }),
    source: contactSourceEnum("source").notNull().default("manual_form"),
    importedByAdminId: uuid("imported_by_admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    campaignContactsCampaignIdx: index("campaign_contacts_campaign_idx").on(
      table.campaignId,
    ),
    campaignContactsContactIdx: index("campaign_contacts_contact_idx").on(
      table.contactId,
    ),
    campaignContactsCampaignContactUniqueIdx: uniqueIndex(
      "campaign_contacts_campaign_contact_unique_idx",
    ).on(table.campaignId, table.contactId),
  }),
);

export const agentContactAssignments = pgTable(
  "agent_contact_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignContactId: uuid("campaign_contact_id")
      .notNull()
      .references(() => campaignContacts.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    assignedByAdminId: uuid("assigned_by_admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: assignmentStatusEnum("status").notNull().default("pending"),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    agentAssignmentsAgentIdx: index("agent_assignments_agent_idx").on(
      table.agentId,
    ),
    agentAssignmentsCampaignContactUniqueIdx: uniqueIndex(
      "agent_assignments_campaign_contact_unique_idx",
    ).on(table.campaignContactId),
  }),
);

export const callResults = pgTable(
  "call_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => agentContactAssignments.id, { onDelete: "cascade" }),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "restrict" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    dialedPhone: varchar("dialed_phone", { length: 30 }).notNull(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    outcome: callOutcomeEnum("outcome").notNull(),
    notes: text("notes"),
    isWhatsappRedirected: boolean("is_whatsapp_redirected")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    callResultsCampaignIdx: index("call_results_campaign_idx").on(table.campaignId),
    callResultsAgentIdx: index("call_results_agent_idx").on(table.agentId),
    callResultsOutcomeIdx: index("call_results_outcome_idx").on(table.outcome),
  }),
);

export const passwordResetOtps = pgTable(
  "password_reset_otps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    codeHash: varchar("code_hash", { length: 255 }).notNull(),
    purpose: otpPurposeEnum("purpose").notNull().default("password_reset"),
    status: otpStatusEnum("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    passwordResetOtpsUserIdx: index("password_reset_otps_user_idx").on(table.userId),
    passwordResetOtpsStatusIdx: index("password_reset_otps_status_idx").on(
      table.status,
    ),
  }),
);

export const broadcastMessages = pgTable(
  "broadcast_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sentByUserId: uuid("sent_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    message: text("message").notNull(),
    recipientCount: integer("recipient_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    broadcastMessagesCreatedAtIdx: index("broadcast_messages_created_at_idx").on(table.createdAt),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  creator: one(users, {
    fields: [users.createdByUserId],
    references: [users.id],
    relationName: "user_creator",
  }),
  managerAdmin: one(users, {
    fields: [users.managedByAdminId],
    references: [users.id],
    relationName: "user_manager_admin",
  }),
  createdCampaigns: many(campaigns),
  ownedAssignments: many(agentContactAssignments),
  callResults: many(callResults),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  ownerAdmin: one(users, {
    fields: [campaigns.createdByAdminId],
    references: [users.id],
  }),
  contacts: many(campaignContacts),
  collaborators: many(campaignCollaborators),
  callResults: many(callResults),
}));

