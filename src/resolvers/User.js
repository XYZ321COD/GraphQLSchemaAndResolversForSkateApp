const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const SECRET_KEY = require("../config").SECRET_KEY;
const { generatePassword } = require("../utils/generatePassword");
const { sendNewPassword } = require("../utils/sendNewPassword");
const {
  validateRegisterInput,
  validateLoginInput,
  validateChangePasswordInput,
} = require("../utils/validators");

module.exports = {
  Query: {
    async getUser(_, { UserID }, context) {
      const user_auth = checkAuth(context);
      const user = await context.prisma.user({
        UserID: UserID,
      });
      return user;
    },
  },
  Mutation: {
    async signup(
      _,
      {
        registerData: { login, password, confirmPassword, mail },
      },
      context
    ) {
      const user_check = await context.prisma.user({
        Login: login,
      });
      const user_check2 = await context.prisma.user({
        Mail: mail,
      });
      if (user_check) {
        throw new UserInputError("Login is taken", {
          errors: {
            Login: "This Login is taken",
          },
        });
      }
      if (user_check2) {
        throw new UserInputError("Email is taken", {
          errors: {
            Mail: "You already registered account with this mail",
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
      _,
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
    async changePassword(
      _,
      {
        changePasswordData: {
          login,
          password,
          newPassword,
          confirmNewPassword,
        },
      },
      context
    ) {
      const user = await context.prisma.user({
        Login: login,
      });
      if (!user) {
        throw new Error(`No such user found for login: ${login}`);
      }
      const password_valid = await bcrypt.compare(password, user.Password);

      if (!password_valid) {
        throw new Error("Invalid password");
      }
      validateChangePasswordInput(
        login,
        password,
        newPassword,
        confirmNewPassword
      );
      const passwordHashed = await bcrypt.hash(newPassword, 10);

      await context.prisma.updateUser({
        data: {
          Password: passwordHashed,
        },
        where: {
          Login: login,
        },
      });
      return "Sucessfully change password";
    },
    async resetPassword(_, { Mail }, context) {
      const user = await context.prisma.user({
        Mail: Mail,
      });
      if (!user) {
        throw new Error(`No such user found for email: ${Mail}`);
      }
      const newPassword = generatePassword();
      const passwordHashed = await bcrypt.hash(newPassword, 10);

      await context.prisma.updateUser({
        data: {
          Password: passwordHashed,
        },
        where: { Login: user.Login },
      });
      sendNewPassword(Mail, newPassword);
      return "Sucessfully reset password";
    },
  },
};
