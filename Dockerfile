FROM node:18-alpine

# Create app directory
WORKDIR /mockbin

RUN npm update -g npm

COPY package.json ./
RUN npm i --omit=dev
COPY . .

ENV MOCKBIN_REDIS "redis://redis:6379"
EXPOSE 8080
CMD ["npm", "start"]
