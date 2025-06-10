/*
  Warnings:

  - Made the column `hostContactName` on table `properties` required. This step will fail if there are existing NULL values in that column.

*/

-- First update NULL values to a default value
UPDATE "properties" SET "hostContactName" = 'Alejandro Satlla' WHERE "hostContactName" IS NULL;
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostId" TEXT NOT NULL,
    "organizationId" TEXT,
    "buildingId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "type" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "squareMeters" INTEGER,
    "defaultLanguages" JSONB NOT NULL DEFAULT ["es", "en"],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "profileImage" TEXT,
    "hostContactName" TEXT NOT NULL,
    "hostContactPhone" TEXT NOT NULL,
    "hostContactEmail" TEXT NOT NULL,
    "hostContactLanguage" TEXT NOT NULL DEFAULT 'es',
    "hostContactPhoto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    CONSTRAINT "properties_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "properties_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "properties_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_properties" ("bathrooms", "bedrooms", "buildingId", "city", "country", "createdAt", "defaultLanguages", "description", "hostContactEmail", "hostContactLanguage", "hostContactName", "hostContactPhone", "hostContactPhoto", "hostId", "id", "isPublished", "latitude", "longitude", "maxGuests", "name", "organizationId", "postalCode", "profileImage", "publishedAt", "squareMeters", "state", "status", "street", "type", "updatedAt") SELECT "bathrooms", "bedrooms", "buildingId", "city", "country", "createdAt", "defaultLanguages", "description", "hostContactEmail", "hostContactLanguage", "hostContactName", "hostContactPhone", "hostContactPhoto", "hostId", "id", "isPublished", "latitude", "longitude", "maxGuests", "name", "organizationId", "postalCode", "profileImage", "publishedAt", "squareMeters", "state", "status", "street", "type", "updatedAt" FROM "properties";
DROP TABLE "properties";
ALTER TABLE "new_properties" RENAME TO "properties";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
