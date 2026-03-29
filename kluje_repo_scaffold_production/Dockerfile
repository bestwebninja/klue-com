FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
