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
    async signup(
      parent,
      {
        registerData: { login, password, confirmPassword, mail },
      },
      context
    ) {
      const user_check = await context.prisma.user({
        Login: login,
      });
      if (user_check) {
        throw new UserInputError("Login is taken", {
          error: {
            Login: "This Login is taken",
          },
        });
      }

      const { valid, errors } = validateRegisterInput(
        login,
        mail,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const passwordHashed = await bcrypt.hash(password, 10);
      const user = await context.prisma.createUser({
        Login: login,
        Password: passwordHashed,
        Mail: mail,
      });
      return {
        token: jwt.sign({ UserID: user.UserID }, SECRET_KEY, {
          expiresIn: "1h",
        }),
        user,
      };
    },

    async login(
      parent,
      {
        loginData: { login, password },
      },
      context
    ) {
      const { valid, errors } = validateLoginInput(login, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await context.prisma.user({ Login: login });
      if (!user) {
        throw new Error(`No such user found for Login: ${login}`);
      }
      const password_valid = await bcrypt.compare(password, user.Password);
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
