-- Add CANCELLED status to ClientInvoiceStatus enum
-- This is an additive change — no existing data is modified
ALTER TYPE "ClientInvoiceStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
