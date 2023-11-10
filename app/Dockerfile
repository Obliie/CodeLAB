FROM node:lts-slim

WORKDIR /app

COPY app/ ./
COPY protobufs/build/ts/protobufs /app/src/protobufs/
RUN npm ci