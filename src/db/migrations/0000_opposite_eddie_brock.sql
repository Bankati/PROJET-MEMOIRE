CREATE TYPE "public"."assignment_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."call_outcome" AS ENUM('interested', 'not_interested', 'callback', 'no_answer', 'false_number', 'whatsapp_follow_up', 'other');--> statement-breakpoint
CREATE TYPE "public"."campaign_permission" AS ENUM('owner', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'active', 'paused', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."contact_source" AS ENUM('excel_import', 'manual_form', 'campaign_reuse');--> statement-breakpoint
CREATE TYPE "public"."otp_purpose" AS ENUM('password_reset');--> statement-breakpoint
CREATE TYPE "public"."otp_status" AS ENUM('pending', 'used', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'agent');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'expired');--> statement-breakpoint
CREATE TABLE "agent_contact_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_contact_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"assigned_by_admin_id" uuid NOT NULL,
	"status" "assignment_status" DEFAULT 'pending' NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "call_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"dialed_phone" varchar(30) NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"outcome" "call_outcome" NOT NULL,
	"notes" text,
	"is_whatsapp_redirected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_collaborators" (
	"campaign_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"permission" "campaign_permission" DEFAULT 'editor' NOT NULL,
	"added_by_admin_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_collaborators_pk" PRIMARY KEY("campaign_id","admin_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"source" "contact_source" DEFAULT 'manual_form' NOT NULL,
	"imported_by_admin_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(180) NOT NULL,
	"year" integer NOT NULL,
	"base_script" text NOT NULL,
	"details" text,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_by_admin_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(120) NOT NULL,
	"last_name" varchar(120),
	"email" varchar(255),
	"school_name" varchar(255),
	"city" varchar(120),
	"phone_primary" varchar(30) NOT NULL,
	"phone_secondary" varchar(30),
	"normalized_phone_primary" varchar(30) NOT NULL,
	"normalized_phone_secondary" varchar(30),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"code_hash" varchar(255) NOT NULL,
	"purpose" "otp_purpose" DEFAULT 'password_reset' NOT NULL,
	"status" "otp_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(120) NOT NULL,
	"role" "user_role" NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"avatar_url" text,
	"created_by_user_id" uuid,
	"managed_by_admin_id" uuid,
	"campaign_access_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_contact_assignments" ADD CONSTRAINT "agent_contact_assignments_campaign_contact_id_campaign_contacts_id_fk" FOREIGN KEY ("campaign_contact_id") REFERENCES "public"."campaign_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_contact_assignments" ADD CONSTRAINT "agent_contact_assignments_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_contact_assignments" ADD CONSTRAINT "agent_contact_assignments_assigned_by_admin_id_users_id_fk" FOREIGN KEY ("assigned_by_admin_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_results" ADD CONSTRAINT "call_results_assignment_id_agent_contact_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."agent_contact_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_results" ADD CONSTRAINT "call_results_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_results" ADD CONSTRAINT "call_results_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_results" ADD CONSTRAINT "call_results_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_collaborators" ADD CONSTRAINT "campaign_collaborators_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_collaborators" ADD CONSTRAINT "campaign_collaborators_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_collaborators" ADD CONSTRAINT "campaign_collaborators_added_by_admin_id_users_id_fk" FOREIGN KEY ("added_by_admin_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_contacts" ADD CONSTRAINT "campaign_contacts_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_contacts" ADD CONSTRAINT "campaign_contacts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_contacts" ADD CONSTRAINT "campaign_contacts_imported_by_admin_id_users_id_fk" FOREIGN KEY ("imported_by_admin_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_admin_id_users_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_otps" ADD CONSTRAINT "password_reset_otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_managed_by_admin_id_users_id_fk" FOREIGN KEY ("managed_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_assignments_agent_idx" ON "agent_contact_assignments" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_assignments_campaign_contact_unique_idx" ON "agent_contact_assignments" USING btree ("campaign_contact_id");--> statement-breakpoint
CREATE INDEX "call_results_campaign_idx" ON "call_results" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "call_results_agent_idx" ON "call_results" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "call_results_outcome_idx" ON "call_results" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "campaign_collaborators_permission_idx" ON "campaign_collaborators" USING btree ("permission");--> statement-breakpoint
CREATE INDEX "campaign_contacts_campaign_idx" ON "campaign_contacts" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_contacts_contact_idx" ON "campaign_contacts" USING btree ("contact_id");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_contacts_campaign_contact_unique_idx" ON "campaign_contacts" USING btree ("campaign_id","contact_id");--> statement-breakpoint
CREATE INDEX "campaigns_created_by_admin_idx" ON "campaigns" USING btree ("created_by_admin_id");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_phone_primary_unique_idx" ON "contacts" USING btree ("normalized_phone_primary");--> statement-breakpoint
CREATE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "password_reset_otps_user_idx" ON "password_reset_otps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_otps_status_idx" ON "password_reset_otps" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_managed_by_admin_idx" ON "users" USING btree ("managed_by_admin_id");