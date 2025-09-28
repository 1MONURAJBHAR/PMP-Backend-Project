//Importing the two libraries
//Mailgen → helps generate nice-looking HTML emails with themes and buttons. Nodemailer → sends emails using SMTP (like Gmail, Mailtrap, etc.).
import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  //defines async function called: sendEmail,which takes an options which include recipient email, subject, and mail content.
  const mailGenerator = new Mailgen({
    //Creates a Mailgen object.
    theme: "default", //-->tells Mailgen to use the built-in default email design
    product: {
      //sets app details:
      name: "Task Manager", //(your app’s name).
      link: "https://taskmanagerlink.com", //(the website link shown in footer).
    },
  });

  //Generates a plain text version of the email using the content you pass (options.mailgenContent).
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  //generate() makes the HTML email (nice design).
  //generatePlaintext() makes the plain text fallback (in case HTML is blocked).
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  /**Sets up a mail transporter with Mailtrap (or any SMTP).
     host and port → Mail server details (taken from .env).
     auth → username & password (from .env) so the server knows you’re allowed to send emails. */

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  /**Creates the email object to send:
from → sender’s email.
to → recipient (from options.email).
subject → email subject 
text → plain text email.
html → HTML version of email. */

  try {
    await transporter.sendEmail(mail);
  } catch (error) {
    console.error(
      "Email service failed siliently. Make sure that you have provided your MAILTRAP credentials in the .env file",
    );
    console.error("Error: ", error);
  }
}

/**try...catch block:
transporter.sendMail(mail) actually sends the email.
If it fails (bad SMTP credentials, internet issue, etc.), it logs an error message. */






/**Templates for Emails
These are functions to build different kinds of email bodies (content for Mailgen). */
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
/**Builds verification email content:
Greets user by name.
Shows intro message.
Adds a button ("Verify your email") linked to verificationUrl.
Outro line for support. */

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
/**Builds forgot password email content:
Greets user.
Tells them a reset request was made.
Adds a button ("Reset Password") linked to PasswordResetUrl.
Outro line for support. */


export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
    
/**In short:
sendEmail → actually sends emails.
emailVerificationMailgenContent → prepares "verify email" template.
forgotPasswordMailgenContent → prepares "forgot password" template. */

/*************************************************************************************************************************************************************************************** */

/**how they link together
 * How Everything Fits
You have 3 main building blocks here:
Mailgen content functions
emailVerificationMailgenContent

forgotPasswordMailgenContent
👉 These functions create the email body in a Mailgen-compatible format.
They don’t send anything — they just describe what the email should say.

sendEmail function

Takes an options object:

{
  email: "user@example.com",  // recipient
  subject: "Verify your email", // subject line
  mailgenContent: {...} // body of the email (from Mailgen functions)
}


Uses Mailgen to convert mailgenContent into HTML and plain text.
Uses Nodemailer to actually send the email with SMTP.
Nodemailer transporter
This is the "mailman."
It knows how to deliver emails because you give it credentials (MAILTRAP_SMTP_HOST, USER, PASS).
When you call transporter.sendMail(mail), it connects to the SMTP server and delivers the email.

🔗 Flow of How They Work Together
You decide which type of email to send.
Example: You want to send a verification email to alex@example.com.
You build the email content.

const mailgenContent = emailVerificationMailgenContent(
    "Alex", 
    "https://taskmanagerlink.com/verify?token=12345"
);


This creates a Mailgen body object (with greeting, button, etc.).
You call sendEmail.

await sendEmail({
    email: "alex@example.com",
    subject: "Please verify your email",
    mailgenContent
});


Inside sendEmail:
Mailgen converts mailgenContent into:

emailHtml → pretty HTML email (with button, theme).

emailTextual → simple text fallback.

A mail object is created with from, to, subject, text, html.
Nodemailer sends the mail.
transporter.sendMail(mail) connects to Mailtrap (or Gmail, etc.).
The email is delivered to alex@example.com.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
⚡ Example in Action
Say a user registers → your backend does this:
//*This code is assumed to be written  in "register.controller.js" file
import { 
  sendEmail, 
  emailVerificationMailgenContent 
} from "./mailService.js";

const user = { name: "Alex", email: "alex@example.com" };
const verificationUrl = `https://taskmanagerlink.com/verify?token=abc123`;

const content = emailVerificationMailgenContent(user.name, verificationUrl);

await sendEmail({
  email: user.email,
  subject: "Verify your email address",
  mailgenContent: content
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
emailVerificationMailgenContent → builds the email template.
sendEmail → prepares the HTML + plain text with Mailgen.
Nodemailer → actually sends it out.

✅ So basically:
Mailgen content functions = WHAT to say in the email.
sendEmail = HOW to send the email.
Nodemailer transporter = The actual delivery guy.
 */