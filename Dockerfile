FROM cgr.dev/chainguard/node:latest@sha256:cf7ae5ead5aed79a61404d7b1bbb9b89ea461991b21cb8fcb07d4b6ad4d8b734

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN npm ci --only=production
USER node
ENV MOCKBIN_REDIS "redis://redis:6379"
EXPOSE 8080
CMD ["server.js"]