-- CreateTable
CREATE TABLE "user_inspiration_states" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dismissedZones" JSONB NOT NULL DEFAULT '[]',
    "createdZones" JSONB NOT NULL DEFAULT '[]',
    "lastShownInspiration" TEXT,
    "showInspirations" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_inspiration_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_inspiration_states_userId_key" ON "user_inspiration_states"("userId");

-- AddForeignKey
ALTER TABLE "user_inspiration_states" ADD CONSTRAINT "user_inspiration_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;