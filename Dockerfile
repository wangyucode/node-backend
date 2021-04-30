# syntax=docker/dockerfile:1

FROM node:14 AS build
WORKDIR /code
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY tsconfig.json .
COPY src src
RUN npm run build

FROM node:14 AS app
ENV NODE_ENV=production
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY --from=build /code/dist/ .
COPY .env .
CMD [ "node", "app.js" ]
