FROM node:12

WORKDIR /usr/src/app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm i --production

COPY . .

CMD ["npm", "run", "start"]
