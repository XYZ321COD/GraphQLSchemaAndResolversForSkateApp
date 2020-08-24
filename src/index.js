const { prisma } = require("./generated/prisma-client");
const { ApolloServer } = require("apollo-server");
const resolvers = require("./resolvers");
typeDefs = require("./schema");

console.log(typeDefs);
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV.trim(" ") == "production") {
  const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers,
    context: (request) => ({
      ...request,
      prisma,
    }),
    engine: {
      reportSchema: true,
      variant: "current",
    },
    playground: false,
    introspection: false,
  });
  server.listen().then(({ url }) => {
    console.log(`🚀  Production server ready at ${url}`);
  });
}

if (process.env.NODE_ENV.trim(" ") === "development") {
  const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers,
    context: (request) => ({
      ...request,
      prisma,
    }),
    engine: {
      reportSchema: true,
      variant: "current",
    },
    playground: true,
    introspection: true,
  });
  server.listen().then(({ url }) => {
    console.log(`🚀  Developement server ready at ${url}`);
  });
}
