FROM node:12

WORKDIR /src/app

COPY package*.json ./

RUN npm install --only=prod

COPY build/ ./

EXPOSE 8080

CMD ["node", "."]