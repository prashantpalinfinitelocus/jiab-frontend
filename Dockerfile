
# FROM node:20-alpine AS deps
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci --frozen-lockfile

# FROM node:20-alpine AS runner
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# COPY start.sh ./start.sh
# RUN chmod +x ./start.sh
# EXPOSE 3000
# CMD ["./start.sh"]



# Step 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Step 2: Build runtime
FROM node:20-alpine AS runner
WORKDIR /app
ARG BUILD_ID

# Inject BUILD_ID to force rebuild when image tag changes
RUN echo "Build hash: $BUILD_ID" > .build_hash

COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY start.sh ./start.sh
RUN chmod +x ./start.sh && chown -R node:node /app

EXPOSE 3000

# Run as the unprivileged user the node image provides.
USER node

CMD ["./start.sh"]
