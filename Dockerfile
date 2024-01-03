FROM node:16-alpine

# Create app directory
WORKDIR /mockbin

COPY package*.json ./
RUN npm ci --only=production
COPY . .

ENV MOCKBIN_REDIS "redis://redis:6379"
EXPOSE 8080
CMD ["npm", "start"]
