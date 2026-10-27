FROM cgr.dev/chainguard/node:latest@sha256:44c5ac2029f7a9b61e1bd12fef9e33f6025d64ea17fa3ecf21a2056f11ac99ca

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN npm ci --omit=dev --ignore-scripts
USER node
ENV MOCKBIN_REDIS "redis://redis:6379"
EXPOSE 8080
CMD ["server.js"]