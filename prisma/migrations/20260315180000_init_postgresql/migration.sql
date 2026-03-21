CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "contract_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Content" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT,
    "type" TEXT NOT NULL,
    "video_url" TEXT,
    "status" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Question" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "content_id" TEXT,
    "category" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "admin_id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_student_id_key" ON "User"("student_id");
CREATE INDEX "User_contract_status_idx" ON "User"("contract_status");
CREATE INDEX "User_created_at_idx" ON "User"("created_at");
CREATE INDEX "User_role_idx" ON "User"("role");

CREATE INDEX "Category_sort_order_idx" ON "Category"("sort_order");

CREATE INDEX "Content_status_published_at_idx" ON "Content"("status", "published_at" DESC);
CREATE INDEX "Content_status_title_idx" ON "Content"("status", "title");
CREATE INDEX "Content_status_description_idx" ON "Content"("status", "description");
CREATE INDEX "Content_category_id_status_published_at_idx" ON "Content"("category_id", "status", "published_at");
CREATE INDEX "Content_type_status_idx" ON "Content"("type", "status");

CREATE INDEX "Question_user_id_created_at_idx" ON "Question"("user_id", "created_at" DESC);
CREATE INDEX "Question_status_created_at_idx" ON "Question"("status", "created_at" DESC);
CREATE INDEX "Question_content_id_created_at_idx" ON "Question"("content_id", "created_at" DESC);
CREATE INDEX "Question_category_created_at_idx" ON "Question"("category", "created_at" DESC);

CREATE INDEX "AdminActionLog_admin_id_created_at_idx" ON "AdminActionLog"("admin_id", "created_at" DESC);
CREATE INDEX "AdminActionLog_target_user_id_created_at_idx" ON "AdminActionLog"("target_user_id", "created_at" DESC);
CREATE INDEX "AdminActionLog_action_created_at_idx" ON "AdminActionLog"("action", "created_at" DESC);

ALTER TABLE "Content"
ADD CONSTRAINT "Content_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "Category"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Question"
ADD CONSTRAINT "Question_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Question"
ADD CONSTRAINT "Question_content_id_fkey"
FOREIGN KEY ("content_id") REFERENCES "Content"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
