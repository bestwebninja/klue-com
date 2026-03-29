FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build -w @kluje/shared && npm run build -w @kluje/api

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package*.json ./apps/api/
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package*.json ./packages/shared/
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
