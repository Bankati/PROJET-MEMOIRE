DO $$ BEGIN
  CREATE TYPE "public"."campaign_visibility" AS ENUM('public', 'private');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "broadcast_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sent_by_user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "call_results" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "pdf_url" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "visibility" "campaign_visibility" DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "desired_program" varchar(255);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "broadcast_messages" ADD CONSTRAINT "broadcast_messages_sent_by_user_id_users_id_fk" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "broadcast_messages_created_at_idx" ON "broadcast_messages" USING btree ("created_at");
