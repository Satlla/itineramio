# Build stage
FROM node:18-alpine AS builder

# Install dependencies needed for building - simplified
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root package files first (for monorepo)
COPY package*.json ./
COPY pnpm-workspace.yaml* ./
COPY turbo.json* ./

# Copy app-specific package files
COPY apps/web/package*.json ./apps/web/
COPY apps/web/prisma ./apps/web/prisma/

# Install dependencies - using install instead of ci for better compatibility
RUN cd apps/web && npm install --legacy-peer-deps --no-audit --no-fund

# Copy application code
COPY apps/web ./apps/web

# Set build-time environment variables
ARG DATABASE_URL
ARG JWT_SECRET
ARG RESEND_API_KEY
ARG NEXT_PUBLIC_APP_URL

ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Move to web directory and build
WORKDIR /app/apps/web

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application from the correct path
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/prisma ./prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]