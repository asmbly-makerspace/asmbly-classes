FROM public.ecr.aws/lambda/nodejs:22 AS builder

COPY cron-service/package*.json ${LAMBDA_TASK_ROOT}/

RUN npm ci --omit=dev

FROM public.ecr.aws/lambda/nodejs:22 AS final

COPY --from=builder /var/task/node_modules /var/task/node_modules

COPY cron-service/prisma ${LAMBDA_TASK_ROOT}/prisma
COPY cron-service/handler.js ${LAMBDA_TASK_ROOT}/handler.js
COPY cron-service/package.json ${LAMBDA_TASK_ROOT}/package.json

# Copy shared Prisma schema and migrations
# schema path "../classes-prisma/schema.prisma" relative to /var/task resolves to /classes-prisma
COPY classes-prisma/ /classes-prisma/

# Generate Prisma Client for build
RUN npx prisma generate

CMD ["handler.lambdaHandler"]
