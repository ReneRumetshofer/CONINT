FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY src .

EXPOSE 3000

CMD ["node", "index.js"]
