# ARG CACHE_REGISTRY_URL
FROM node:12.22.12 as package-installation

WORKDIR /app
COPY package*.json ./
RUN npm install --verbose
RUN npm i farmhash
FROM node:12.22.12 as build
WORKDIR /app

COPY --from=package-installation /app/ /app/
COPY . /app/

RUN npx tsc
RUN npm run prestart:prod
EXPOSE 3005
EXPOSE 2004
EXPOSE 2524
CMD npm run start:prod

