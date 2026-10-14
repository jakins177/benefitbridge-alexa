# Purpose: Package BenefitBridge as a minimal Next.js container for AWS Lambda.
# Function: Builds Next.js standalone output and runs it through AWS Lambda Web Adapter.
# Inputs/Outputs: Repository source in; production OCI image serving port 3000 out.
FROM public.ecr.aws/docker/library/node:22.20.0-alpine3.22 AS builder
RUN apk upgrade --no-cache
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN mkdir -p public && npm run build -- --webpack

FROM public.ecr.aws/docker/library/node:22.20.0-alpine3.22 AS runner
RUN apk upgrade --no-cache
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.1.0 /lambda-adapter /opt/extensions/lambda-adapter
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    AWS_LWA_PORT=3000 \
    AWS_LWA_READINESS_CHECK_PATH=/api/health \
    AWS_LWA_ENABLE_COMPRESSION=true \
    AWS_LWA_INVOKE_MODE=response_stream
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN ln -s /tmp/cache ./.next/cache && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "server.js"]
