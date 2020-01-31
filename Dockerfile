FROM node:10.15.1
WORKDIR /app

COPY yarn.lock ./
COPY package.json ./
COPY ./src ./src
COPY ./integration-test ./integration-test
COPY ./mock-data ./mock-data
COPY ./tsconfig.json ./tsconfig.json

EXPOSE 3000

RUN npm install
CMD npm run dev