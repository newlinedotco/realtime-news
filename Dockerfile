FROM node:4.4.7

RUN mkdir -p /usr/src/app/dist
WORKDIR /usr/src/app
ENV NODE_ENV production

COPY package.json /usr/src/app/
RUN npm install --production

RUN mkdir -p /usr/src/app/db && \
    mkdir -p /usr/src/app/public
    
COPY .env /usr/src/app/
COPY dist /usr/src/app/dist
COPY public /usr/src/app/public

EXPOSE 8001

CMD ["npm", "start"]
