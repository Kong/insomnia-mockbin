FROM node:6.9.2-onbuild

RUN npm config set mockbin:redis redis://redis:6379
EXPOSE 8080
