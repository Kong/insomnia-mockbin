FROM node:10-alpine

RUN npm config set mockbin:redis redis://redis:6379
EXPOSE 8080
