CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"detail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"vacancy_id" text NOT NULL,
	"candidate_id" text NOT NULL,
	"stage" text DEFAULT 'sourced' NOT NULL,
	"origin" text DEFAULT 'sourced' NOT NULL,
	"match_score" integer,
	"shortlist_summary" text,
	"employer_decision" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"kind" text NOT NULL,
	"template" text NOT NULL,
	"scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"outcome" text NOT NULL,
	"evidence" text,
	"assessor_id" text,
	"assessed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" text PRIMARY KEY NOT NULL,
	"pep_id" text NOT NULL,
	"user_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"city" text,
	"state" text,
	"sector_code" text NOT NULL,
	"profession" text NOT NULL,
	"headline" text,
	"summary" text,
	"years_experience" integer DEFAULT 0 NOT NULL,
	"current_employer" text,
	"employment_status" text,
	"availability" text,
	"employment_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preferred_locations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"willing_to_relocate" boolean DEFAULT false NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"software" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"education" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"qualifications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"training" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"experience" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stage" text DEFAULT 'registered' NOT NULL,
	"classification" text,
	"classification_rationale" text,
	"source" text DEFAULT 'website' NOT NULL,
	"partner_id" text,
	"consent_at" timestamp with time zone,
	"consent_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "candidates_pep_id_unique" UNIQUE("pep_id")
);
--> statement-breakpoint
CREATE TABLE "document_files" (
	"document_id" text PRIMARY KEY NOT NULL,
	"data" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"kind" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"uploaded_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employer_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"employer_id" text NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"role" text,
	"email" text,
	"phone" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"city" text,
	"state" text,
	"size" text,
	"website" text,
	"about" text,
	"crm_stage" text DEFAULT 'target' NOT NULL,
	"owner_id" text,
	"next_action" text,
	"next_action_at" timestamp with time zone,
	"source" text,
	"membership_tier" text DEFAULT 'none' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"organisation" text,
	"subject" text,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"body" text NOT NULL,
	"author_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"city" text,
	"contact_name" text,
	"contact_email" text,
	"programmes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mou_status" text DEFAULT 'prospect' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placements" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"candidate_id" text NOT NULL,
	"employer_id" text NOT NULL,
	"vacancy_id" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"annual_salary" integer,
	"fee" integer DEFAULT 0 NOT NULL,
	"invoice_status" text DEFAULT 'draft' NOT NULL,
	"retention_3m" text DEFAULT 'pending' NOT NULL,
	"retention_6m" text DEFAULT 'pending' NOT NULL,
	"retention_12m" text DEFAULT 'pending' NOT NULL,
	"feedback" jsonb,
	"feedback_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "placements_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "revenue_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"stream" text NOT NULL,
	"amount" integer NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"description" text,
	"employer_id" text,
	"placement_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'candidate' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vacancies" (
	"id" text PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"employer_id" text NOT NULL,
	"title" text NOT NULL,
	"sector_code" text NOT NULL,
	"description" text,
	"headcount" integer DEFAULT 1 NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"experience_min" integer DEFAULT 0 NOT NULL,
	"qualifications" text,
	"required_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"city" text,
	"employment_type" text DEFAULT 'full_time' NOT NULL,
	"deadline" timestamp with time zone,
	"package" text DEFAULT 'professional' NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"analysis_notes" text,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vacancies_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"verified_by_id" text,
	"verified_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_assessor_id_user_id_fk" FOREIGN KEY ("assessor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_files" ADD CONSTRAINT "document_files_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_contacts" ADD CONSTRAINT "employer_contacts_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_contacts" ADD CONSTRAINT "employer_contacts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employers" ADD CONSTRAINT "employers_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_placement_id_placements_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."placements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_checks" ADD CONSTRAINT "verification_checks_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_checks" ADD CONSTRAINT "verification_checks_verified_by_id_user_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_entity_idx" ON "activity_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "applications_pair_idx" ON "applications" USING btree ("vacancy_id","candidate_id");--> statement-breakpoint
CREATE INDEX "candidates_sector_idx" ON "candidates" USING btree ("sector_code");--> statement-breakpoint
CREATE INDEX "candidates_stage_idx" ON "candidates" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "notes_entity_idx" ON "notes" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "vacancies_employer_idx" ON "vacancies" USING btree ("employer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "checks_candidate_type_idx" ON "verification_checks" USING btree ("candidate_id","type");