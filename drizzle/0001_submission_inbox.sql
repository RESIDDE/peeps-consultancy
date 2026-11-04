ALTER TABLE "enquiries" ADD COLUMN "details" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "entity" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "entity_id" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "due_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "assigned_to_id" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "handled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "consent_version" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_to_id_user_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enquiries_type_idx" ON "enquiries" USING btree ("type");--> statement-breakpoint
CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enquiries_created_idx" ON "enquiries" USING btree ("created_at");