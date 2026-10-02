FROM cgr.dev/chainguard/node:latest@sha256:10be2e69be84a55739a6f4e0ab47703746e546006dad2c80494fafc7f5f6c5fd

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN npm ci --omit=dev --ignore-scripts
USER node
ENV MOCKBIN_REDIS "redis://redis:6379"
EXPOSE 8080
CMD ["server.js"]