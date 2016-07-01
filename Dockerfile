FROM node:4.4.7

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY ./dist/ /usr/src/app

EXPOSE 8001

CMD ["npm", "start"]
