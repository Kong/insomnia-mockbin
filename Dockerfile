FROM node:0.10-onbuild

RUN npm config set mockbin:redis redis://redis:6379
EXPOSE 8080
