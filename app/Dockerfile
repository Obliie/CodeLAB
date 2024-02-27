FROM node:lts-slim
ARG ENVIRONMENT
ARG NEXT_PUBLIC_FRONTEND_URL

WORKDIR /app

COPY app/ ./
COPY protobufs/build/ts/protobufs /app/src/protobufs/
RUN npm ci

RUN if [ "$ENVIRONMENT" = "prod" ]; then \
        npm run build; \
    fi