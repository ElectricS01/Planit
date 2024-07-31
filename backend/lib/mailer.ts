// Import utilities
import nodemailer from "nodemailer"

// Define a type for the options being parsed into this library
interface MailOptions {
  from: string
  to: string
  subject: string
  text: string
}

// Define the class using the NodemailerLibrary
class NodemailerLibrary {
  private transporter

  constructor() {
    // Set the mail configuration options incliding email, password, email service, hostname, port, and security type
    const options =
      process.env.EMAIL_SERVICE === "smtp.mail.me.com"
        ? {
            auth: {
              pass: process.env.EMAIL_PASSWORD,
              user: process.env.EMAIL_USERNAME
            },
            service: "icloud"
          }
        : {
            auth: {
              pass: process.env.EMAIL_PASSWORD,
              user: process.env.EMAIL_USERNAME
            },
            host: process.env.EMAIL_SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === "true"
          }

    this.transporter = nodemailer.createTransport(options)
  }

  // This function will actually send the email
  sendEmail(
    from: string,
    to: string,
    subject: string,
    text: string
  ): Promise<string> {
    // Define the parsed options from the index.ts
    const mailOptions: MailOptions = {
      from,
      subject,
      text,
      to
    }

    // Create a JavaScript Promise so that code can be ran when the email has been sent
    // this is to avoid slowing down the backend while the email is still being sent
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (error, info) => {
        // Return the error to index.ts if there is one, this is usually when there is a configuration error in the config.json
        if (error) {
          reject(error)
        } else {
          resolve(info.response)
        }
      })
    })
  }
}

// Export the NodemailerLibrary to be used in the index.ts file
export default NodemailerLibrary
