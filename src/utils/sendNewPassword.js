const nodemailer = require("nodemailer");
module.exports.sendNewPassword = (Mail, newPassword) => {
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
};
