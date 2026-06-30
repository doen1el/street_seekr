# builder
FROM node:24-alpine AS builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .

RUN npm run build
RUN npm prune --production

# runner
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/server server/
COPY --from=builder /app/server.js .
COPY client/package.json .
EXPOSE 3000
ENV NODE_ENV=production \
    STREETSEEKR_DB=/data/streetseekr.db
CMD ["node","server.js"]
