import express from "express";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { jwt, JWT_SECRET } from "../config";
import { prisma } from "@repo/db/prisma";
import sendOtpViaWhatsApp from "../utils/sendOtpViaWhatsapp";

const userRouter = express.Router();
userRouter.use(express.json());

const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

//SIGN UP ROUTE
userRouter.post("/signup", async (req: Request, res: Response) => {
    try {
        const { email, username, mobile, password } = req.body;

        if (!email || !username || !mobile || !password) {
            console.error("Missing fields:", { email, username, mobile, password });
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        let user = await prisma.user.findFirst({
            where: {
                email: email,
            }
        })
        if (user) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPass = await bcrypt.hash(password, 8);

        const otp = parseInt(generateOTP());

        user = await prisma.user.create({
            data: {
                email: email,
                username: username,
                mobile: mobile,
                password: hashedPass,
                otp: otp,
                isPhoneVerified: false
            }
        })
        const otpResult = await sendOtpViaWhatsApp(mobile, otp.toString());
        if (!otpResult.success) {
            await prisma.user.delete({
                where: {
                    id: user.id,
                },
            });
            res.status(500).json({ message: "Failed to send OTP", error: otpResult.error });
            return;
        }

        res.status(201).json({ message: "User registered. OTP sent to mobile" });
        return;

    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Failed to register user" });
    }
})

//OTP VERIFICATION ROUTE
userRouter.post("/verify-otp", async (req: Request, res: Response) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            res.status(400).json({ error: "Mobile and OTP are required." });
            return;
        }

        const user = await prisma.user.findUnique({ where: { mobile } });
        console.log("Fetched user:", user);

        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        if (user.otp !== parseInt(otp)) {
            console.log("Invalid OTP:", { storedOtp: user.otp, receivedOtp: otp });
            res.status(400).json({ message: "Invalid OTP" });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { mobile: mobile },
            data: {
                isPhoneVerified: true,
                otp: 0,
            },
        });

        res.status(200).json({ message: "User verified" });
    } catch (e) {
        console.error("Error during OTP verification:", e);
        res.status(500).json({ message: "Failed to verify user" });
    }
});


//RESEND OTP ROUTE
userRouter.post("/resend-otp", async (req: Request, res: Response) => {
    const { mobile } = req.body;

    if (!mobile) {
        res.status(400).json({ message: "Mobile number is required." });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { mobile }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const otp = generateOTP();

        await prisma.user.update({
            where: { mobile },
            data: { otp: parseInt(otp) }
        });

        const otpResult = await sendOtpViaWhatsApp(mobile, otp.toString());
        if (!otpResult.success) {
            res.status(500).json({ message: "Failed to send OTP", error: otpResult.error });
            return;
        }

        res.status(200).json({
            message: "OTP has been resent to the registered Whatsapp number.",
        });
    } catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({ message: "Failed to resend OTP. Please try again later." });
    }
});

//LOGIN ROUTE
userRouter.post("/login", async (req: Request, res: Response) => {
    const { mobile, password } = req.body;

    // Validate the input
    if (!mobile) {
        res.status(400).json({ error: "Enter Mobile number" });
        return;
    }


    try {
        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: {
                mobile: mobile,
            },
        });

        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        // Check if the user is verified
        if (!user.isPhoneVerified) {
            res.status(403).json({ message: "User is not verified. Please verify your phone number first." });
            return;
        }

        // Validate the password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, username: user.username, mobile: user.mobile, role: user.role }, JWT_SECRET);

        // Return the token in the response
        res.status(200).json({
            message: "Login successful",
            token: token,
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Failed to login user. Please try again later." });
    }
});

//FORGOT PASSWORD ROUTE
userRouter.post("/forgot-password", async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            res.status(400).json({ message: "Mobile number is required" });
            return;
        }

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: {
                mobile: mobile,
            },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Generate a new OTP
        const otp = generateOTP();

        // Update the OTP in the database
        await prisma.user.update({
            where: {
                mobile: mobile,
            },
            data: {
                otp: parseInt(otp),
            },
        });

        const otpResult = await sendOtpViaWhatsApp(mobile, otp.toString());

        if (!otpResult.success) {
            res.status(500).json({ message: "Failed to send OTP", error: otpResult.error });
            return;
        }

        // Simulate sending OTP (replace with actual SMS service in production)
        console.log(`OTP sent to ${mobile}: ${otp}`);

        res.status(200).json({ message: "OTP has been sent to the registered Whatsapp number." });
    } catch (e) {
        console.error("Error during forgot password process:", e);
        res.status(500).json({ message: "Failed to send OTP. Please try again later." });
    }
});

//RESET PASSWORD ROUTE
userRouter.post("/reset-password", async (req: Request, res: Response) => {
    try {
        const { mobile, newPassword, otp } = req.body;

        if (!mobile || !newPassword || !otp) {
            res.status(400).json({ message: "Mobile number, new password, and OTP are required" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { mobile }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (user.otp !== parseInt(otp)) {
            res.status(400).json({ message: "Invalid OTP" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 8);

        await prisma.user.update({
            where: { mobile },
            data: {
                password: hashedPassword,
                otp: 0 // Reset OTP after successful password reset
            }
        });

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error during reset password process:", error);
        res.status(500).json({ message: "Failed to reset password. Please try again later." });
    }
});


//LOGOUT ROUTE
userRouter.post("/logout", async (req: Request, res: Response) => {
    try {
        localStorage.removeItem("token");
        localStorage.clear();
        res.status(200).json({ message: "Logout successful" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Failed to logout user" });
    }
})


export { userRouter };