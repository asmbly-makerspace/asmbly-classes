# Builder image
FROM node:21.1.0

# Set environment variables
ARG NODE_ENV=development

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

RUN --mount=type=secret,id=postgres-user \
  POSTGRES_USER=$(cat /run/secrets/postgres-user)

RUN --mount=type=secret,id=postgres-pass \
  POSTGRES_PASS=$(cat /run/secrets/postgres-pass)

RUN --mount=type=secret,id=postgres-db \
  POSTGRES_DB=$(cat /run/secrets/postgres-db)

RUN --mount=type=secret,id=postgres-port \
  POSTGRES_PORT=$(cat /run/secrets/postgres-port)

RUN npx prisma generate

# Build the app
RUN npm run build

# Running image
FROM node:21.1.0

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm i --omit dev

# Copy built assets
COPY --from=0 /usr/src/app ./

COPY ./entrypoint.sh /entrypoint.sh
COPY ./wait-for-it.sh /wait-for-it.sh
RUN chmod +x /entrypoint.sh \
    && chmod +x /wait-for-it.sh

ENTRYPOINT [ "/wait-for-it.sh", "db:5432", "-t", "10", "-s" , "--", "/entrypoint.sh" ]

# Start Node server
CMD ["node", "-r", "dotenv/config", "build"]