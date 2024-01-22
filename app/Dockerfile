# Builder image
FROM node:21.5.0 AS builder

# Set environment variables
ARG NODE_ENV=development

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Add build secrets
RUN --mount=type=secret,id=postgres-user \
  POSTGRES_USER=$(cat /run/secrets/postgres-user)

RUN --mount=type=secret,id=postgres-pass \
  POSTGRES_PASS=$(cat /run/secrets/postgres-pass)

# Generate Prisma Client for build
RUN npx prisma generate

# Build the app
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Running image
FROM node:21.5.0

ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy package.json
COPY package.json ./

#Copy prisma files
COPY ./prisma ./prisma

# Copy built assets
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/node_modules ./node_modules

COPY ./wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

USER node

ENTRYPOINT /wait-for-it.sh db:${POSTGRES_PORT} -t 10 -s -- node build