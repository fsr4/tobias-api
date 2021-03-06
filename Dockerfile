FROM node:fermium-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN apk add git && npm install
COPY ./ ./
RUN npm run build
EXPOSE 3000
EXPOSE 9229
ENTRYPOINT ["npm", "run", "watch"]

FROM node:fermium-alpine
WORKDIR /server
COPY --from=build /app/package*.json ./
RUN apk add git && npm ci --only=production
COPY --from=build /app/build/ ./build/
EXPOSE 3000
ENTRYPOINT ["npm", "run", "serve"]
