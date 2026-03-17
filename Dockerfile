# Use pinned Node.js digest
FROM node@sha256:0d99dc09477b8da5a33116df083b0544f8365c1926615d6c8e3e40be2ec03b9b as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production image
FROM node@sha256:0d99dc09477b8da5a33116df083b0544f8365c1926615d6c8e3e40be2ec03b9b-slim

WORKDIR /app

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
