# syntax=docker/dockerfile:1

FROM node:16 AS build
WORKDIR /code
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY tsconfig.json .
COPY src src
RUN npm run build

FROM node:16 AS app
ENV NODE_ENV=production
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY --from=build /code/dist/ .
COPY .env .
CMD [ "npm", "start:prod" ]
EXPOSE 8082
