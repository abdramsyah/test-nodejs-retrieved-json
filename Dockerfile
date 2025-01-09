## this is the stage one , also know as the build step

FROM node:16.17.1-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN apk add --no-cache tzdata

RUN cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime
RUN echo "Asia/Jakarta" > /etc/timezone
EXPOSE 3001
CMD ["npm", "run", "start"]

## this is stage two , where the app actually runs

#FROM node:12.16.3-alpine

#WORKDIR /usr/src/app
#COPY package*.json ./
#RUN npm install --only=production
#COPY . .
#EXPOSE 3006
#CMD npm start
