FROM node:lts-slim
ARG ENVIRONMENT

WORKDIR /app

COPY app/ ./
COPY protobufs/build/ts/protobufs /app/src/protobufs/
RUN npm ci

RUN if [ "$ENVIRONMENT" = "prod" ] ; then npm run build ; fi 