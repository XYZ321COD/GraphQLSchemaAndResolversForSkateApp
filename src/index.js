const { prisma } = require("./generated/prisma-client");
const { ApolloServer } = require("apollo-server");
const resolvers = require("./resolvers");
typeDefs = require("./schema");

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
  server.listen(process.env.PORT || 5000).then(({ url }) => {
    console.log(`🚀  Production server ready at ${url}`);
  });
}

if (process.env.NODE_ENV.trim(" ") == "development") {
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
  server.listen(process.env.PORT || 5000).then(({ url }) => {
    console.log(`🚀  Development server ready at ${url}`);
  });
}
