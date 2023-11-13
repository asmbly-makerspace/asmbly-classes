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

# Start Node server
CMD ["node", "build/index.js"]