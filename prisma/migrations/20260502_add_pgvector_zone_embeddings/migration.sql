-- Migration: add pgvector extension + ZoneEmbedding table
-- Purpose: enable semantic search over zone manual content for AlexAI (Beta).
-- Complementary to existing keyword-based ranking in src/lib/chatbot-utils.ts.
-- Production chatbot is NOT modified.

-- CreateExtension: pgvector
-- Note: Neon supports pgvector on all paid plans. Verify availability in your project before applying.
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable: zone_embeddings
CREATE TABLE "zone_embeddings" (
    "id"            TEXT          NOT NULL,
    "zoneId"        TEXT          NOT NULL,
    "tenantUserId"  TEXT          NOT NULL,
    "contentHash"   TEXT          NOT NULL,
    "embedding"     vector(1536)  NOT NULL,
    "model"         TEXT          NOT NULL DEFAULT 'text-embedding-3-small',
    "sourcePreview" TEXT,
    "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)  NOT NULL,

    CONSTRAINT "zone_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique on zoneId (1 embedding per zone)
CREATE UNIQUE INDEX "zone_embeddings_zoneId_key" ON "zone_embeddings"("zoneId");

-- CreateIndex: on tenantUserId for tenant-scoped queries (forward-looking for AlexAI scope=MASTER)
CREATE INDEX "zone_embeddings_tenantUserId_idx" ON "zone_embeddings"("tenantUserId");

-- CreateIndex: on model for safe provider migration in the future
CREATE INDEX "zone_embeddings_model_idx" ON "zone_embeddings"("model");

-- AddForeignKey: cascade delete with parent Zone
ALTER TABLE "zone_embeddings"
    ADD CONSTRAINT "zone_embeddings_zoneId_fkey"
    FOREIGN KEY ("zoneId") REFERENCES "zones"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- HNSW index for fast cosine similarity search
-- vector_cosine_ops is the operator class for cosine distance (1 - cosine similarity).
-- HNSW gives sub-linear search times suitable for production query latency.
CREATE INDEX "zone_embeddings_embedding_hnsw_idx"
    ON "zone_embeddings"
    USING hnsw (embedding vector_cosine_ops);
