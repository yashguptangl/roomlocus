import express from "express";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {jwt ,JWT_SECRET} from "../config";
import {prisma} from "@repo/db/prisma";
  
const userRouter = express.Router();
userRouter.use(express.json());

const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};



//SIGN UP ROUTE
userRouter.post("/signup",async (req : Request,res : Response) =>{
    try{
        const {email , username , mobile , password } = req.body;

        if (!email || !username || !mobile || !password) {
            console.error("Missing fields:", { email, username, mobile, password });
            res.status(400).json({ message: "All fields are required" });
            return;
          }
        let user = await prisma.user.findFirst({
            where: {
                email : email,
        }})
        if(user){
           res.status(400).json({message : "User already exists"});
           return;
        }
        const hashedPass = await bcrypt.hash(password , 8);

        const otp = parseInt(generateOTP());

        user = await prisma.user.create({
            data : {
                email : email,
                username : username,
                mobile : mobile,
                password : hashedPass,
                otp : otp ,
                isPhoneVerified : false
            }
        })
        res.status(201).json({message : "User registered .Otp sent to mobile" });
        return;

    }catch(e){
        console.log(e);
        res.status(500).json({message : "Failed to register user"});
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

    // Validate the input
    if (!mobile) {
        res.status(400).json({ error: "Empty." });
        return;
    }

    try {
        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: {
                mobile : mobile,
            },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Generate a new OTP
        const otp = generateOTP();

        // Update the OTP in the database
        const updatedUser = await prisma.user.update({
            where: {
                mobile  : mobile,
            },
            data: {
                otp: parseInt(otp),
            },
        });

        console.log("Updated User OTP:", updatedUser);

        // Return a success response (exclude OTP in production)
        res.status(200).json({
            message: "OTP has been resent to the registered mobile number.",
        });
        return;
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
        const token = jwt.sign({ id: user.id , username : user.username , mobile : user.mobile }, JWT_SECRET, { expiresIn: "1h" });

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



export { userRouter };