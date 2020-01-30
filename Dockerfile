FROM node:10.15.1
WORKDIR /app

COPY yarn.lock ./
COPY package.json ./
COPY ./src ./
COPY ./integration-test ./
COPY ./tsconfig.json ./

EXPOSE 3000

RUN npm install
CMD npm run dev