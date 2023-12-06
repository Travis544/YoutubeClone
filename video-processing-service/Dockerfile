FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --production && npm cache clean --force

COPY . ./

# Install FFmpeg
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg

RUN npm run build

CMD [ "node", "dist/index.js" ]