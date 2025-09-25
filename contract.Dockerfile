FROM node:22-alpine

RUN apk add --no-cache procps
ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci
USER node
COPY --chown=node:node . .
CMD ["npm", "run", "test:contract"]