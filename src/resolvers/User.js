const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const nodemailer = require("nodemailer");
const SECRET_KEY = require("../config").SECRET_KEY;
const { generatePassword } = require("../utils/generatePassword");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../utils/validators");

module.exports = {
  Query: {
    async getUser(parent, { UserID }, context) {
      const user_auth = checkAuth(context);
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
          errors: {
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
    async changePassword(
      parent,
      { login, password, newPassword, confirmNewPassword },
      context
    ) {
      const user = await context.prisma.user({
        Login: login,
      });
      if (!user) {
        throw new Error(`No such user found for email: ${Mail}`);
      }
      const password_valid = await bcrypt.compare(password, user.Password);
      if (!password_valid) {
        throw new Error("Invalid password");
      }
      if (newPassword !== confirmNewPassword) {
        throw new Error("Passwords are not the same");
      }
      const passwordHashed = await bcrypt.hash(newPassword, 10);

      const update_user = await context.prisma.userUpdate({
        data: {
          Password: passwordHashed,
        },
        where: {
          Login: login,
        },
      });
      return "Sucessfully change password";
    },
    async resetPassword(parent, { Mail }, context) {
      const user = await context.prisma.user({
        Mail: Mail,
      });
      if (!user) {
        throw new Error(`No such user found for email: ${Mail}`);
      }
      const newPassword = generatePassword();
      const passwordHashed = await bcrypt.hash(newPassword, 10);

      const userUpdated = await context.prisma.updateUser({
        data: {
          Password: passwordHashed,
        },
        where: { Login: user.Login },
      });
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "spottiesskate@gmail.com",
          pass: "Spam5111!",
        },
      });
      var mailOptions = {
        from: "spottiesskate@gmail.com",
        to: Mail,
        subject: "Zmiana hasla",
        text:
          "Zostalo wygenerowane dla Ciebie nowe haslo:" +
          newPassword +
          "\n Pamietaj, ze zawsze mozesz zmienic aktualne haslo w zakladce 'Zmien haslo'",
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      return "Sucessfully reset password";
    },
  },
};
