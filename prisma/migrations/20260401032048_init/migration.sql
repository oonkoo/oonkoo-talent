-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('active', 'inactive', 'on_leave');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('offer_letter', 'terms_conditions', 'bank_info', 'other');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('company', 'agent');

-- CreateEnum
CREATE TYPE "InvoiceScope" AS ENUM ('all', 'by_role', 'individual');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'finalized', 'downloaded');

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "contact_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "billing_address" TEXT,
    "agreed_rate_bdt" DECIMAL(10,4) NOT NULL,
    "agent_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "revenue_share_pct" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_roles" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_configs" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "bill_rate_cad" DECIMAL(8,2) NOT NULL,
    "default_pay_rate_cad" DECIMAL(8,2) NOT NULL,
    "max_pay_rate_cad" DECIMAL(8,2) NOT NULL,
    "hours_per_month" DECIMAL(8,2) NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,

    CONSTRAINT "rate_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "nid_number" TEXT,
    "bank_account_number" TEXT,
    "bank_name" TEXT,
    "pay_rate_cad" DECIMAL(8,2) NOT NULL,
    "actual_salary_bdt" DECIMAL(10,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER,
    "notes" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_batches" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "agent_id" UUID,
    "period_year" INTEGER NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_label" TEXT NOT NULL,
    "invoice_type" "InvoiceType" NOT NULL,
    "company_invoice_scope" "InvoiceScope",
    "agreed_rate_bdt" DECIMAL(10,4) NOT NULL,
    "sending_rate_bdt" DECIMAL(10,4) NOT NULL,
    "total_hours" DECIMAL(10,2) NOT NULL,
    "total_revenue_cad" DECIMAL(10,2) NOT NULL,
    "total_salary_cost_cad" DECIMAL(10,2) NOT NULL,
    "gross_profit_cad" DECIMAL(10,2) NOT NULL,
    "agent_share_pct" DECIMAL(5,2),
    "agent_share_cad" DECIMAL(10,2),
    "owner_base_share_cad" DECIMAL(10,2) NOT NULL,
    "role_revised_enabled" BOOLEAN NOT NULL DEFAULT true,
    "owner_role_revised_saving_cad" DECIMAL(10,2) NOT NULL,
    "fx_advantage_enabled" BOOLEAN NOT NULL DEFAULT true,
    "owner_fx_advantage_cad" DECIMAL(10,2) NOT NULL,
    "owner_total_cad" DECIMAL(10,2) NOT NULL,
    "total_revenue_bdt" DECIMAL(12,2) NOT NULL,
    "gross_profit_bdt" DECIMAL(12,2) NOT NULL,
    "owner_total_bdt" DECIMAL(12,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalized_at" TIMESTAMP(3),
    "downloaded_at" TIMESTAMP(3),

    CONSTRAINT "invoice_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "bill_rate_cad" DECIMAL(8,2) NOT NULL,
    "pay_rate_cad" DECIMAL(8,2) NOT NULL,
    "hours" DECIMAL(8,2) NOT NULL,
    "revenue_cad" DECIMAL(10,2) NOT NULL,
    "cost_cad" DECIMAL(10,2) NOT NULL,
    "profit_cad" DECIMAL(10,2) NOT NULL,
    "actual_salary_bdt" DECIMAL(10,2) NOT NULL,
    "role_revised_saving_bdt" DECIMAL(10,2) NOT NULL,
    "role_revised_saving_cad" DECIMAL(10,2) NOT NULL,
    "fx_advantage_cad" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_configs" ADD CONSTRAINT "rate_configs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_configs" ADD CONSTRAINT "rate_configs_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "employee_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "employee_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_batches" ADD CONSTRAINT "invoice_batches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_batches" ADD CONSTRAINT "invoice_batches_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "invoice_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "employee_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
