FROM node:24-bullseye

WORKDIR /app

COPY . .

RUN npm install
RUN npm install -g pm2

EXPOSE 5000
CMD ["pm2-runtime", "ecosystem.config.cjs"]

