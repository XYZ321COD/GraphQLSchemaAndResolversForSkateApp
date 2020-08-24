const { UserInputError } = require("apollo-server");
const checkAuth = require("../utils/check-auth");
module.exports = {
  Query: {
    async getRates(parent, { LocationID }, context) {
      const user = checkAuth(context);
      const location = await context.prisma.location({
        LocationID: LocationID,
      });
      return location.Rates;
    },

    async getLocation(parent, { LocationID }, context) {
      const user = checkAuth(context);
      const location = await context.prisma.location({
        LocationID: LocationID,
      });
      return location;
    },

    async getLocationByName(parent, { Name }, context) {
      const user = checkAuth(context);
      const location = await context.prisma.location({
        Name: Name,
      });
      return location;
    },
  },
  Mutation: {
    async createLocation(parent, args, context) {
      const user = checkAuth(context);
      if (args.location.Name.trim() === "") {
        throw new UserInputError("Empty location name", {
          errors: {
            Name: "Location name must not be empty",
          },
        });
      }
      if (args.location.Description.trim() === "") {
        throw new UserInputError("Empty description of the location", {
          errors: {
            Description: "Description of the location must not be empty",
          },
        });
      }
      if (args.location.Adress.trim() === "") {
        throw new UserInputError("Empty adress of the location", {
          errors: {
            Adress: "Adress of the location must not be empty",
          },
        });
      }
      const newLocaction = await context.prisma.createLocation({
        Name: args.location.Name,
        Description: args.location.Description,
        Adress: args.location.Adress,
        Medias: {
          set: args.location.Medias,
        },
      });
      return newLocaction;
    },

    async rateLocation(parent, args, context) {
      const user = checkAuth(context);
      try {
        let location = await context.prisma.location({
          LocationID: args.Rate.LocationID,
        });
        const rates = location.Rates;
        const updateLocation = await context.prisma.updateLocation({
          data: {
            Rates: {
              set: rates.concat(args.Rate.Rate),
            },
          },

          where: {
            LocationID: args.Rate.LocationID,
          },
        });
        if (updateLocation) {
          return "You rated location!";
        } else {
          throw new UserInputError("Rating failed", {
            errors: {
              Rate: "Rating failed",
            },
          });
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
