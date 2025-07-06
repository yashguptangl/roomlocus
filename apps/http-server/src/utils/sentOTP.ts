import axios from "axios";

export const sendOTP = async (mobile: string, otp: string) => {
  try {
    const response = await axios.post(
      "https://control.msg91.com/api/v5/flow/",
      {
        flow_id: process.env.MSG91_FLOW_ID,
        sender: process.env.MSG91_SENDER_ID,
        mobiles: `91${mobile}`,
        otp: otp,
      },
      {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("OTP sent via MSG91:", response.data);
    return response.data;
  } catch (error) {
    console.error("MSG91 OTP Error:", error);
    throw error;
  }
};
