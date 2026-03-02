-- CreateTable
CREATE TABLE "demo_otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demo_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "demo_otps_email_idx" ON "demo_otps"("email");

-- CreateIndex
CREATE INDEX "demo_otps_email_code_idx" ON "demo_otps"("email", "code");

-- CreateIndex
CREATE INDEX "demo_otps_expires_at_idx" ON "demo_otps"("expires_at");
