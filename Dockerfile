FROM node:alpine

WORKDIR /app

COPY package.json .

COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 4000

CMD ["yarn", "start:http"]