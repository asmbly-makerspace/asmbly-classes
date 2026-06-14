# Builder image
FROM node:lts AS builder

ARG NODE_ENV=development

WORKDIR /usr/src/app

# Copy package.json from app subdirectory
COPY app/package*.json ./

RUN npm ci

# Copy app source and shared schema
COPY app/ .
COPY classes-prisma/ /usr/src/classes-prisma/

# Add build secrets
RUN --mount=type=secret,id=postgres-user \
  POSTGRES_USER=$(cat /run/secrets/postgres-user)

RUN --mount=type=secret,id=postgres-pass \
  POSTGRES_PASS=$(cat /run/secrets/postgres-pass)

RUN npx prisma generate

RUN npm run build

RUN npm prune --production

# Running image
FROM node:lts

RUN apt-get update && apt-get upgrade -y

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --chown=node:node app/package*.json ./

# Copy shared Prisma schema and migrations
COPY --chown=node:node classes-prisma/ /usr/src/classes-prisma/

COPY --chown=node:node --from=builder /usr/src/app/build ./build
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

COPY --chown=node:node app/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

USER node

CMD ["npm", "run", "deploy:prod"]