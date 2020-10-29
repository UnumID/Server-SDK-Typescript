FROM node:14.15.0-alpine

RUN apk update && \
    apk upgrade && \
    apk add git

WORKDIR /src/app

COPY package*.json ./

RUN yarn install --only=prod

COPY build/ ./

EXPOSE 8080

CMD ["node", "."]
