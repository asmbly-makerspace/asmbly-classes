FROM node:21.6.0-alpine3.19 

# Updating packages and installing cron
RUN apk add --update apk-cron && rm -rf /var/cache/apk/*

# Setting up timezone
RUN apk add --no-cache alpine-conf && \
    setup-timezone -z America/Chicago

# Set environment variables
ARG NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY ./prisma ./prisma

# Generate Prisma Client for build
RUN npx prisma generate

# Adding crontab to the appropriate location
ADD crontab.txt /crontab.txt

# Giving permission to crontab file
RUN chmod 0644 /crontab.txt

# Running crontab
RUN /usr/bin/crontab /crontab.txt

# Creating entry point for cron 
ENTRYPOINT ["/usr/sbin/crond", "-f", "-l", "8"]