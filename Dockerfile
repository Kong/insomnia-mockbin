FROM node:22-bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN npm ci --only=production
USER node
ENV MOCKBIN_REDIS "redis://redis:6379"
EXPOSE 8080
CMD ["dumb-init", "node", "server.js"]