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

RUN --mount=type=secret,id=POSTGRES_USER \
  POSTGRES_USER=$(cat /run/secrets/POSTGRES_USER)

RUN --mount=type=secret,id=POSTGRES_PASS \
  POSTGRES_PASS=$(cat /run/secrets/POSTGRES_PASS)

RUN --mount=type=secret,id=POSTGRES_DB \
  POSTGRES_DB=$(cat /run/secrets/POSTGRES_DB)

RUN --mount=type=secret,id=POSTGRES_PORT \
  POSTGRES_PORT=$(cat /run/secrets/POSTGRES_PORT)

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