FROM node:20-alpine AS webapp-build
WORKDIR /app/webapp
COPY webapp/package*.json ./
RUN npm ci
COPY webapp/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
COPY --from=webapp-build /app/webapp/dist ./webapp/dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
