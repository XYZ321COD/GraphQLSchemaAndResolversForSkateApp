const checkAuth = require("../utils/check-auth");
const { AuthenticationError } = require("apollo-server");

module.exports = {
  Query: {
    async getComment(parent, { CommentID }, context) {
      const user = checkAuth(context);
      const comment = await context.prisma.comment({
        CommentID: CommentID,
      });
      return comment;
    },
    async getAllCommentsForLocation(parent, { LocationID }, context) {
      const user = checkAuth(context);
      const location = await context.prisma.location({
        LocationID: LocationID,
      });
      return location.Comments;
    },
  },
  Mutation: {
    async createComment(parent, args, context) {
      const userAuth = checkAuth(context);

      const newComment = await context.prisma.createComment({
        authorId: userAuth.User.UserID,
        Context: args.comment.Context,
        Medias: {
          set: args.comment.Medias,
        },
        locationId: args.comment.LocationID,
        User: {
          connect: {
            UserID: userAuth.User.UserID,
          },
        },
        Location: {
          connect: {
            LocationID: args.comment.LocationID,
          },
        },
      });
      await context.prisma.updateUser({
        data: {
          Comments: {
            connect: {
              CommentID: newComment.CommentID,
            },
          },
        },
        where: {
          UserID: userAuth.User.UserID,
        },
      });

      await context.prisma.updateLocation({
        data: {
          Comments: {
            connect: {
              CommentID: newComment.CommentID,
            },
          },
        },
        where: {
          LocationID: args.comment.LocationID,
        },
      });

      return newComment;
    },

    async deleteComment(parent, args, context) {
      const userAuth = checkAuth(context);
      try {
        const comment = await context.prisma.comment({
          CommentID: args.CommentID,
        });
        if (userAuth.User.UserID === comment.authorId) {
          const user = await context.prisma.deleteComment({
            CommentID: args.CommentID,
          });
          return "Post deleted";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
