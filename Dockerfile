FROM node:12-alpine as builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:12-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/build/. ./build/
COPY --from=builder /app/views/. ./views/

RUN yarn install --production

CMD ["yarn", "start"]