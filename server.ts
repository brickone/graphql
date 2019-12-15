import { ApolloServer } from "apollo-server-express";
import express from "express";
import dataSources from "./datasources";
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";

const server = new ApolloServer({ dataSources, resolvers, typeDefs });

const app = express();
server.applyMiddleware({ app });

app.get("/health", (request, response) => {
  response.status(200).send("healthy");
});

app.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
});
