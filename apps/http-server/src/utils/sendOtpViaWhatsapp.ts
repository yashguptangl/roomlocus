import axios, { AxiosError } from "axios";
import dotenv from "dotenv";

dotenv.config();

interface WhatsAppOtpResponse {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
}

interface Fast2SMSResponse {
    return: boolean;
    message: string;
    request_id?: string;
}

const sendOtpViaWhatsApp = async (
    mobile: string, 
    otp: string
): Promise<WhatsAppOtpResponse> => {
    try {
        // Validate inputs
        if (!mobile || !otp) {
            return {
                success: false,
                error: "Mobile number and OTP are required"
            };
        }

        // Validate mobile number format (basic validation)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobile)) {
            return {
                success: false,
                error: "Invalid mobile number format"
            };
        }

        // Check if API key exists
        if (!process.env.FAST2SMS_API_KEY) {
            return {
                success: false,
                error: "Fast2SMS API key not configured"
            };
        }

        const payload = {
            route: "whatsapp",
            message: "otp_template", // Ensure this template is approved in your Fast2SMS account
            sender_id: "Roomlocus", // Ensure this sender ID is approved
            variables_values: otp,
            numbers: `91${mobile}`, // Indian country code
            message_id : 2989
        };

        const response = await axios.post<Fast2SMSResponse>(
            "https://www.fast2sms.com/dev/whatsapp", 
            payload,
            {
                headers: {
                    authorization: process.env.FAST2SMS_API_KEY,
                    "Content-Type": "application/json",
                },
                timeout: 10000, // 10 second timeout
            }
        );


        // Check Fast2SMS response
        if (response.data.return) {
            return {
                success: true,
                message: "OTP sent successfully via WhatsApp",
                data: response.data
            };
        } else {
            return {
                success: false,
                error: response.data.message || "Failed to send OTP"
            };
        }

    } catch (error) {
        console.error("Error sending OTP via WhatsApp:", error);

        // Handle different types of errors
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            
            if (axiosError.response) {
                // Server responded with error status
                return {
                    success: false,
                    error: `Server error: ${axiosError.response.status} - ${axiosError.response.statusText}`
                };
            } else if (axiosError.request) {
                // Request was made but no response received
                return {
                    success: false,
                    error: "Network error: No response from server"
                };
            }
        }

        return {
            success: false,
            error: "Unexpected error occurred while sending OTP"
        };
    }
};

// Usage example with proper error handling
const handleOtpSending = async (mobile: string, otp: string) => {
    const result = await sendOtpViaWhatsApp(mobile, otp);
    
    if (result.success) {
        console.log("✅ OTP sent successfully:", result.message);
        return true;
    } else {
        console.error("❌ Failed to send OTP:", result.error);
        return false;
    }
};

export default sendOtpViaWhatsApp;
export { handleOtpSending, type WhatsAppOtpResponse };