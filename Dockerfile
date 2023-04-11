FROM node:gallium-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN apk add git && npm install
COPY ./ ./
EXPOSE 3000
EXPOSE 9229
ENTRYPOINT ["npm", "run", "watch"]

FROM node:gallium-alpine as build
WORKDIR /build
COPY --from=dev /app/ ./
RUN npm run build

FROM node:gallium-alpine
WORKDIR /server
COPY --from=build /build/package*.json ./
RUN apk add git && npm ci --only=production
COPY --from=build /build/dist/ ./dist/
EXPOSE 3000
ENTRYPOINT ["npm", "run", "serve"]
