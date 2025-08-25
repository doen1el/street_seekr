FROM node:22-alpine AS builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .

ARG PUBLIC_POCKETBASE_URL
ARG POCKETBASE_URL
ENV PUBLIC_POCKETBASE_URL=$PUBLIC_POCKETBASE_URL \
    POCKETBASE_URL=$POCKETBASE_URL

RUN npm run build
RUN npm prune --production

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY client/package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node","build"]