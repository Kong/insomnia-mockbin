FROM node:22-bullseye-slim

RUN apt-get update && apt-get install -y procps
ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY --chown=node:node . .
CMD ["npm", "run", "test:contract"]