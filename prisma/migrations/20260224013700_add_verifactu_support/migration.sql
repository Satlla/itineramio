-- CreateEnum
CREATE TYPE "VerifactuStatus" AS ENUM ('PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "AEATInvoiceType" AS ENUM ('F1', 'F2', 'F3', 'R1', 'R2', 'R3', 'R4', 'R5');

-- AlterTable: UserInvoiceConfig - add VeriFactu config fields
ALTER TABLE "user_invoice_configs" ADD COLUMN "verifactuEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_invoice_configs" ADD COLUMN "siiExempt" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user_invoice_configs" ADD COLUMN "verifactuApiKey" TEXT;

-- AlterTable: ClientInvoice - add VeriFactu fields
ALTER TABLE "client_invoices" ADD COLUMN "verifactuHash" TEXT;
ALTER TABLE "client_invoices" ADD COLUMN "verifactuPreviousHash" TEXT;
ALTER TABLE "client_invoices" ADD COLUMN "verifactuStatus" "VerifactuStatus";
ALTER TABLE "client_invoices" ADD COLUMN "verifactuTimestamp" TIMESTAMP(3);
ALTER TABLE "client_invoices" ADD COLUMN "invoiceType" "AEATInvoiceType";
ALTER TABLE "client_invoices" ADD COLUMN "taxRegimeKey" TEXT DEFAULT '01';
ALTER TABLE "client_invoices" ADD COLUMN "qrCode" TEXT;

-- CreateIndex
CREATE INDEX "client_invoices_verifactuStatus_idx" ON "client_invoices"("verifactuStatus");

-- CreateTable: InvoiceAuditLog
CREATE TABLE "invoice_audit_logs" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousData" JSONB,
    "newData" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoice_audit_logs_invoiceId_idx" ON "invoice_audit_logs"("invoiceId");
CREATE INDEX "invoice_audit_logs_createdAt_idx" ON "invoice_audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "invoice_audit_logs" ADD CONSTRAINT "invoice_audit_logs_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "client_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: VerifactuSubmission
CREATE TABLE "verifactu_submissions" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "xmlPayload" TEXT NOT NULL,
    "response" TEXT,
    "status" "VerifactuStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "verifactu_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verifactu_submissions_invoiceId_idx" ON "verifactu_submissions"("invoiceId");
CREATE INDEX "verifactu_submissions_status_idx" ON "verifactu_submissions"("status");

-- AddForeignKey
ALTER TABLE "verifactu_submissions" ADD CONSTRAINT "verifactu_submissions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "client_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
