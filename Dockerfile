FROM node:22.13.0-alpine AS build
WORKDIR /app
ENV DEPLOY_TARGET=railway

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run check
RUN npm run build
RUN npm prune --omit=dev

FROM node:22.13.0-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV DEPLOY_TARGET=railway

COPY --from=build /app ./

EXPOSE 3000
CMD ["npm", "run", "start:railway"]
