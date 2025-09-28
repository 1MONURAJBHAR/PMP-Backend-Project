import Mailgen from "mailgen";
import nodemailer from "nodemailer";

//This is from controller...
/**await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  }); */


const sendEmail = async (options) => {
  /////////////////////////////////////////////
  const mailGenerator = new Mailgen({
    //creating object of Mailgen (i.e:mailGenerator) This will help to create the email document in "Textual" or "Html format"
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanagelink.com",
    },
  });
  ////////////////////////////////////////////////////////

  //This will generate email in textual format
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent); //options.mailgenContent-->emailVerificationMailgenContent()

  //This will generate email in Html format
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  //This will configure all configurations and set the connection
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  //This is our proper mail object which w will pass in "sendMail(mail)"
  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(
      "Email service failed siliently. Make sure that you have provided your MAILTRAP credentials in the .env file",
    );
    console.error("Error: ", error);
  }
};

//this is format body of our emailVerificationMailgenContent
const emailVerificationMailgenContent = (username, verficationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! we'are excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: verficationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

//this is format body of our forgotPasswordMailgenContent
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of your account",
      action: {
        instructions:
          "To reset your password click on the following button or link",
        button: {
          color: "#22BC66",
          text: "Reset password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//For detailed info
/**import Mailgen from "mailgen";
import nodemailer from "nodemailer";


You import two libraries:
Mailgen → helps generate nice-looking HTML emails with themes and buttons.
Nodemailer → sends emails using SMTP (like Gmail, Mailtrap, etc.).

const sendEmail = async (options) => {


Defines an async function called sendEmail.
It takes an options object (which will include recipient email, subject, and mail content).

    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link:"https://taskmanagerlink.com"
        }
    })


Creates a Mailgen object.
theme: "default" → tells Mailgen to use the built-in default email design.
product → sets app details:

name: "Task Manager" (your app’s name).

link: "https://taskmanagerlink.com" (the website link shown in footer).

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);


Generates a plain text version of the email using the content you pass (options.mailgenContent).

    const emailHtml = mailGenerator.generatePlaintext(options.mailgenContent);


⚠️ Here you repeated generatePlaintext.
It should probably be:
const emailHtml = mailGenerator.generate(options.mailgenContent);
generate() makes the HTML email (nice design).
generatePlaintext() makes the plain text fallback (in case HTML is blocked).

   const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST,
      port: process.env.MAILTRAP_SMTP_PORT,
      auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
      },
   });


Sets up a mail transporter with Mailtrap (or any SMTP).

host and port → Mail server details (taken from .env).

auth → username & password (from .env) so the server knows you’re allowed to send emails.

    const mail = {
      from: "mail.taskmanager@example.com",
      to: options.email,
      subject: option.subject,
      text: emailTextual,
      html: emailHtml,
    };


Creates the email object to send:
from → sender’s email.
to → recipient (from options.email).
subject → email subject (⚠️ typo: should be options.subject, not option.subject).
text → plain text email.
html → HTML version of email.

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Email service failed siliently. Make sure that you have provided your MAILTRAP credentials in the .env file");
        console.error("Error: ",error);
    }
}


try...catch block:
transporter.sendMail(mail) actually sends the email.
If it fails (bad SMTP credentials, internet issue, etc.), it logs an error message.
📧 Templates for Emails
These are functions to build different kinds of email bodies (content for Mailgen).

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! we'are excited to have you on board.",
            action: {
                instructions: "To verify your email please click on the following button",
                button: {
                    color: "#de238af",
                    text: "Verify your email",
                    link: verificationUrl
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help"
        },
    };
};


Builds verification email content:
Greets user by name.
Shows intro message.
Adds a button ("Verify your email") linked to verificationUrl.
Outro line for support.

const forgotPasswordMailgenContent = (username, PasswordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "we get a request to reset the password of your account.",
            action: {
                instructions: "To reset your password Click on the following button or link",
                button: {
                    color: "#dea623f",
                    text: "Reset Password",
                    link: PasswordResetUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help"
        },
    };
};


Builds forgot password email content:
Greets user.
Tells them a reset request was made.
Adds a button ("Reset Password") linked to PasswordResetUrl.
Outro line for support.

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};


Exports the functions so other files can use them.

✅ In short:
sendEmail → actually sends emails.
emailVerificationMailgenContent → prepares "verify email" template.
forgotPasswordMailgenContent → prepares "forgot password" template. */