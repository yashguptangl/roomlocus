import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import dotenv from "dotenv";
dotenv.config();

const ses = new SESv2Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_EMAIL_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_EMAIL_SECRET_KEY!,
  },
});
console.log("SES Client initialized with region:", process.env.AWS_REGION);
console.log("SES Client initialized with access key:", process.env.AWS_EMAIL_ACCESS_KEY);

export const sendOtpToEmail = async (toEmail: string, otp: string) => {
  const command = new SendEmailCommand({
    FromEmailAddress: process.env.FROM_EMAIL!,
    Destination: {
      ToAddresses: [toEmail],
    },
    Content: {
      Simple: {
        Subject: {
          Data: "Your OTP Code",
        },
        Body: {
          Html: {
            Data: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
          },
        },
      },
    },
  });

  try {
    await ses.send(command);
    console.log("✅ Email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
};
