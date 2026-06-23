FROM cgr.dev/chainguard/node:latest@sha256:7ce7491612c80eac34419a2d765ff73d4e1a5e791af0ef98c8d990b721340f46

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN npm ci --only=production
USER node
ENV MOCKBIN_REDIS "redis://redis:6379"
EXPOSE 8080
CMD ["server.js"]