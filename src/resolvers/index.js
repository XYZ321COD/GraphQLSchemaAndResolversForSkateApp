const userResolvers = require("./User");
const commentResolvers = require("./Comment");
const locationResolvers = require("./Location");
const likeResolvers = require("./Like");

module.exports = {
  Query: {
    ...commentResolvers.Query,
    ...userResolvers.Query,
    ...locationResolvers.Query,
    ...likeResolvers.Query,
  },
  Mutation: {
    ...commentResolvers.Mutation,
    ...userResolvers.Mutation,
    ...locationResolvers.Mutation,
    ...likeResolvers.Mutation,
  },
};
