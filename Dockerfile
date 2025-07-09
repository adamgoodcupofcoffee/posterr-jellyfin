FROM node:18-slim

WORKDIR /app
COPY backend /app/backend
COPY frontend /app/frontend
COPY admin /app/admin
COPY config /app/config

RUN npm install express node-fetch

EXPOSE 3000

CMD ["node", "/app/backend/server.js"]
