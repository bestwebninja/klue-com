FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci

FROM deps AS build
WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:4000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY . .
RUN npm run build -w @kluje/shared && npm run build -w @kluje/web

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
