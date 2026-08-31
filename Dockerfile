FROM cgr.dev/chainguard/node:latest@sha256:f2a8ed64ec02cef2e53c76d1255d0917e749570af251e32e99f54cda1076cc8d

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN npm ci --only=production
USER node
ENV MOCKBIN_REDIS "redis://redis:6379"
EXPOSE 8080
CMD ["server.js"]