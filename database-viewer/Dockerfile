FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 6161

ENV NODE_ENV=production
ENV DB_SERVER=sqlserver
ENV DB_USER=sa
ENV DB_PASSWORD=NetChi@2024
ENV DB_NAME=NetChiDB

CMD ["npm", "start"]
