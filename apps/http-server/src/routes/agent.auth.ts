import express from "express";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "@repo/db/prisma";
import { jwt, JWT_SECRET } from "../config";

const agentRouter = express.Router();
agentRouter.use(express.json());

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

agentRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, username, mobile, password } = req.body;
    if (!email || !username || !mobile || !password) {
      console.error("Missing fields:", { email, username, mobile, password });
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    let agent = await prisma.agent.findFirst({
      where: {
        email: email,
      },
    });
    if (agent) {
      res.status(400).json({ message: "Agent already exists" });
      return;
    }
    const hashedPass = await bcrypt.hash(password, 8);

    const otp = generateOTP();

    agent = await prisma.agent.create({
      data: {
        email: email,
        username: username,
        mobile: mobile,
        password: hashedPass,
        otp: parseInt(otp),
        isPhoneVerified: false,
        agentId: `RL${mobile}`,
        personverifiedName: "Blank", // Add a default or dynamic value for personverifiedName
      },
    });
    console.log("Generated OTP:", otp); // Log the generated OTP
    res.status(201).json({ message: "Agent registered. OTP sent to mobile" });
    return;
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Failed to register agent" });
  }
});

agentRouter.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      res.status(400).json({ error: "Mobile and OTP are required." });
      return;
    }

    const agent = await prisma.agent.findUnique({ where: { mobile: mobile } });

    if (!agent) {
      res.status(404).json({ error: "Agent not found." });
      return;
    }
    console.log("Stored OTP:", agent.otp); // Log the stored OTP
    console.log("Received OTP:", otp); // Log the received OTP
    if (agent.otp !== parseInt(otp)) {
      res.status(400).json({ error: "Invalid OTP." });
      return;
    }
    const updatedAgent = await prisma.agent.update({
      where: {
        mobile: mobile,
      },
      data: {
        isPhoneVerified: true,
        otp: 0,
      },
    });
    res.status(200).json({ message: "Agent verified" });
  } catch (e) {
    console.log("Error During verify mobile:", e);
    res.status(500).json({ message: "Failed to verify agent" });
  }
});

agentRouter.post("/resend", async (req: Request, res: Response) => {
  const { mobile } = req.body;
  if (!mobile) {
    res.status(400).json({ error: "Mobile is required." });
    return;
  }
  try {
    // Check if the user exists
    const agent = await prisma.agent.findUnique({
      where: {
        mobile: mobile,
      },
    });

    if (!agent) {
      res.status(404).json({ message: "Agent not found" });
      return;
    }

    // Generate a new OTP
    const otp = generateOTP();

    // Update the OTP in the database
    const updatedAgent = await prisma.agent.update({
      where: {
        mobile: mobile,
      },
      data: {
        otp: parseInt(otp),
      },
    });

    console.log("Updated Agent OTP:", updatedAgent);

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

agentRouter.post("/login", async (req: Request, res: Response) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    res.status(400).json({ message: "Mobile and password are required" });
    return;
  }
  try {
    const agent = await prisma.agent.findUnique({
      where: {
        mobile: mobile,
      },
    });
    if (!agent) {
      res.status(401).json({ message: "Agent not found" });
      return;
    }
    if (!agent.isPhoneVerified) {
      res.status(403).json({ message: "Agent is not verified. Please verify your phone number first." });
      return;
    }
    const isMatch = await bcrypt.compare(password, agent.password);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid Password" });
      return;
    }

    const token = jwt.sign({ id: agent.id, mobile: agent.mobile, username: agent.username, agentId: agent.agentId , walletRs : agent.walletRs }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({
      message: "Login Successfully",
      token: token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Failed to login" });
  }
});

export { agentRouter };