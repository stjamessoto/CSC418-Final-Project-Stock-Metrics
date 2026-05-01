FROM node:22-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm install

FROM node:22-alpine AS production-dependencies-env
COPY ./package.json /app/
WORKDIR /app
RUN npm install --omit=dev

FROM node:22-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
ENV PORT=3000
COPY ./package.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
EXPOSE 3000
CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]
