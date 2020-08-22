const { UserInputError } = require("apollo-server");
const checkAuth = require("../utils/check-auth");

module.exports = {
  Query: {
    async getLike(parent, { LikeID }, context) {
      const user = checkAuth(context);
      const like = await context.prisma.like({
        LikeID: LikeID,
      });
      return like;
    },
    async getLikesForComment(parent, { CommentID }, context) {
      const user = checkAuth(context);
      const comment = await context.prisma.comment({
        CommentID: CommentID,
      });
      console.log(comment);
      return comment.Likes;
    },
    async getLikesForUser(parent, { UserID }, context) {
      const user_auth = checkAuth(context);
      const user = await context.prisma.user({
        UserID: UserID,
      });
      return user.Likes;
    },
  },
  Mutation: {
    async likeComment(parent, args, context) {
      const userAuth = checkAuth(context);
      const newLike = await context.prisma.createLike({
        authorId: userAuth.User.UserID,
        Type: args.LikeInput.Type,
        locationId: args.LikeInput.locationId,
        commentId: args.LikeInput.commentId,
      });

      await context.prisma.updateComment({
        data: {
          Likes: {
            connect: {
              LikeID: newLike.LikeID,
            },
          },
        },
        where: {
          CommentID: args.LikeInput.commentId,
        },
      });

      await context.prisma.updateUser({
        data: {
          Likes: {
            connect: {
              LikeID: newLike.LikeID,
            },
          },
        },
        where: {
          UserID: userAuth.User.UserID,
        },
      });

      return newLike;
    },
    async unlikeComment(parent, args, context) {
      const userAuth = checkAuth(context);
      try {
        const like = await context.prisma.like({
          LikeID: args.LikeID,
        });
        if (userAuth.User.UserID === like.authorId) {
          const user = await context.prisma.deleteLike({
            CommentID: args.LikeID,
          });
          return "Unliked";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
