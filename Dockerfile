FROM node:9.11.2-onbuild

RUN npm config set mockbin:redis redis://redis:6379
EXPOSE 8080
