FROM public.ecr.aws/lambda/nodejs:22 AS builder

# Set environment variables
# ENV NODE_ENV=production

# Copy package.json and package-lock.json
COPY package*.json ${LAMBDA_TASK_ROOT}

# Install dependencies
RUN npm ci --omit=dev

FROM public.ecr.aws/lambda/nodejs:22 AS final

COPY --from=builder /var/task/node_modules /var/task/node_modules

COPY ./prisma ${LAMBDA_TASK_ROOT}/prisma
COPY ./handler.js ${LAMBDA_TASK_ROOT}/handler.js

COPY ./package.json ${LAMBDA_TASK_ROOT}/package.json

# Generate Prisma Client for build
RUN npx prisma generate

CMD ["handler.lambdaHandler"]
