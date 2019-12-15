FROM mhart/alpine-node
ENV PORT 4000

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT}
CMD [ "node", "server.js" ]