const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const SECRET_KEY = require("../config").SECRET_KEY;
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../utils/validators");

module.exports = {
  Query: {
    async getUser(parent, { UserID }, context) {
      const user = checkAuth(context);
      const user = await context.prisma.user({
        UserID: UserID,
      });
      return user;
    },
  },
  Mutation: {
    async signup(parent, args, context) {
      const user_check = await context.prisma.user({
        Login: args.register.Login,
      });
      if (user_check) {
        throw new UserInputError("Login is taken", {
          error: {
            Login: "This Login is taken",
          },
        });
      }

      const { valid, errors } = validateRegisterInput(
        args.register.Login,
        args.register.Mail,
        args.register.Password,
        args.register.confirmPassword,
        args.register.Phone
      );

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const password = await bcrypt.hash(args.register.Password, 10);

      const user = await context.prisma.createUser({
        Login: args.register.Login,
        Password: password,
        Phone: args.register.Phone,
        Mail: args.register.Mail,
      });

      return {
        token: jwt.sign({ UserID: user.UserID }, SECRET_KEY, {
          expiresIn: "1h",
        }),
        user,
      };
    },

    async login(parent, args, context) {
      const { valid, errors } = validateLoginInput(
        args.login.Login,
        args.login.Password
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await context.prisma.user({ Login: args.login.Login });

      if (!user) {
        throw new Error(`No such user found for Login: ${args.login.Login}`);
      }

      const password_valid = await bcrypt.compare(
        args.login.Password,
        user.Password
      );
      if (!password_valid) {
        throw new Error("Invalid password");
      }

      return {
        token: jwt.sign({ User: user }, SECRET_KEY, {
          expiresIn: "1h",
        }),
        user,
      };
    },
  },
};
