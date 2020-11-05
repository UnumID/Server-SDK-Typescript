FROM node:14.15.0-alpine

RUN apk update && \
    apk upgrade && \
    apk add git

WORKDIR /app

COPY package*.json /app/
COPY yarn.lock /app/

RUN yarn install --only=prod

COPY ./ /app/

RUN yarn build

CMD [ "node", "build/server.js" ]
