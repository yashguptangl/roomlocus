import express from "express";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth"; // Adjust the path as necessary
import { jwt, JWT_SECRET } from "../config";
import { authenticate } from "../middleware/auth";
import { putObject, getObjectURL } from "../utils/s3client";
import { prisma } from "@repo/db/prisma";

const ownerRouter = express.Router();
ownerRouter.use(express.json());

const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

//SIGN UP ROUTE
ownerRouter.post("/signup", async (req: Request, res: Response) => {
    try {
        const { email, username, mobile, password } = req.body;

        if (!email || !username || !mobile || !password) {
            console.error("Missing fields:", { email, username, mobile, password });
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        let owner = await prisma.owner.findFirst({
            where: {
                email: email,
            }
        })
        if (owner) {
            res.status(400).json({ message: "Owner already exists" });
            return;
        }
        const hashedPass = await bcrypt.hash(password, 8);

        const otp = parseInt(generateOTP());

        owner = await prisma.owner.create({
            data: {
                email: email,
                username: username,
                mobile: mobile,
                password: hashedPass,
                otp: otp,
                isPhoneVerified: false
            }
        })
        res.status(201).json({ message: "Owner registered .Otp sent to mobile" });
        return;

    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Failed to register Owner" });
    }
});

//OTP VERIFICATION ROUTE
ownerRouter.post("/verify-otp", async (req: Request, res: Response) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            res.status(400).json({ error: "Mobile and OTP are required." });
            return;
        }

        const owner = await prisma.owner.findUnique({ where: { mobile } });
        console.log("Fetched user:", owner);

        if (!owner) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        if (owner.otp !== parseInt(otp)) {
            console.log("Invalid OTP:", { storedOtp: owner.otp, receivedOtp: otp });
            res.status(400).json({ message: "Invalid OTP" });
            return;
        }

        const updatedOwner = await prisma.owner.update({
            where: { mobile: mobile },
            data: {
                isPhoneVerified: true,
                otp: 0,
            },
        });
        console.log("Updated user:", updatedOwner);

        res.status(200).json({ message: "Owner verified" });
    } catch (e) {
        console.error("Error during OTP verification:", e);
        res.status(500).json({ message: "Failed to verify Owner" });
    }
});

//RESEND OTP ROUTE
ownerRouter.post("/resend-otp", async (req: Request, res: Response) => {
    const { mobile } = req.body;

    // Validate the input
    if (!mobile) {
        res.status(400).json({ error: "Empty." });
        return;
    }

    try {
        // Check if the user exists
        const owner = await prisma.owner.findUnique({
            where: {
                mobile: mobile,
            },
        });

        if (!owner) {
            res.status(404).json({ message: "Owner not found" });
            return;
        }

        // Generate a new OTP
        const otp = generateOTP();

        // Update the OTP in the database
        const updatedOwner = await prisma.owner.update({
            where: {
                mobile: mobile,
            },
            data: {
                otp: parseInt(otp),
            },
        });

        console.log("Updated Owner OTP:", updatedOwner);

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
ownerRouter.post("/login", async (req: Request, res: Response) => {
    const { mobile, password } = req.body;

    if (!mobile) {
        res.status(400).json({ error: "Enter Mobile number" });
        return;
    }

    try {
        const owner = await prisma.owner.findUnique({
            where: { mobile: mobile },
        });

        if (!owner) {
            res.status(401).json({ message: "Owner not found" });
            return;
        }

        if (!owner.isPhoneVerified) {
            res.status(403).json({ message: "Owner is not verified. Please verify your phone number first." });
            return;
        }

        const isMatch = await bcrypt.compare(password, owner.password);

        if (!isMatch) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }

        const token = jwt.sign({ id: owner.id, owner , role : owner.role }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            message: "Login successful",
            token: token,
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Failed to login Owner. Please try again later." });
    }
});


//FORGOT PASSWORD ROUTE
ownerRouter.post("/forgot-password", async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            res.status(400).json({ message: "Mobile number is required" });
            return;
        }

        // Check if the user exists
        const owner = await prisma.owner.findUnique({
            where: {
                mobile: mobile,
            },
        });

        if (!owner) {
            res.status(404).json({ message: "Owner not found" });
            return;
        }

        // Generate a new OTP
        const otp = generateOTP();

        // Update the OTP in the database
        await prisma.owner.update({
            where: {
                mobile: mobile,
            },
            data: {
                otp: parseInt(otp),
            },
        });

        // Simulate sending OTP (replace with actual SMS service in production)
        console.log(`OTP sent to ${mobile}: ${otp}`);

        res.status(200).json({ message: "OTP has been sent to the registered mobile number" });
    } catch (e) {
        console.error("Error during forgot password process:", e);
        res.status(500).json({ message: "Failed to send OTP. Please try again later." });
    }
});

//RESET PASSWORD ROUTE
ownerRouter.post("/reset-password", async (req: Request, res: Response) => {
    try {
        const { mobile, newPassword, otp } = req.body;

        if (!mobile || !newPassword || !otp) {
            res.status(400).json({ message: "Mobile number, new password, and OTP are required" });
            return;
        }

        // Check if the owner exists
        const owner = await prisma.owner.findUnique({
            where: {
                mobile: mobile,
            },
        });

        if (!owner) {
            res.status(404).json({ message: "Owner not found" });
            return;
        }

        // Verify the OTP
        if (owner.otp !== parseInt(otp)) {
            res.status(400).json({ message: "Invalid OTP" });
            return;
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 8);

        // Update the user's password and reset the OTP
        await prisma.owner.update({
            where: {
                mobile: mobile,
            },
            data: {
                password: hashedPassword,
                otp: 0, // Reset OTP after successful password reset
            },
        });

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (e) {
        console.error("Error during reset password process:", e);
        res.status(500).json({ message: "Failed to reset password. Please try again later." });
    }
});

ownerRouter.post("/flat", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const ownerId = req.user?.id;
    try {
        const {
            city , townSector , location, landmark, maxprice , minprice, offer ,Bhk,  security, maintenance, totalFlat , adress , totalFloor, waterSupply, powerBackup, noticePeriod, furnishingType, accomoType, parking, preferTenants, petsAllowed, genderPrefer, flatType, insideFacilities, outsideFacilities, careTaker , careTakerNo , listingShowNo } = req.body;

        const filteredParking: string[] = parking ? parking.filter((item: string) => item !== undefined) : [];
        const filteredPreferTenants: string[] = preferTenants ? preferTenants.filter((item: string) => item !== undefined) : [];
        const filteredFlatInside: string[] = insideFacilities ? insideFacilities.filter((item: string) => item !== undefined) : [];
        const filteredFlatOutside: string[] = outsideFacilities ? outsideFacilities.filter((item: string) => item !== undefined) : [];


        const flat = await prisma.flatInfo.create({
            data: {
                owner: {
                    connect: {
                        id: ownerId,
                    },
                },
                city : city,
                townSector : townSector,
                location: location,
                landmark: landmark,
                BHK : Bhk,
                MaxPrice : maxprice,
                MinPrice : minprice,
                Offer: offer,
                security: security,
                maintenance: maintenance,
                Adress: adress,
                totalFlat: parseInt(totalFlat),
                totalFloor: String(totalFloor),
                waterSupply: waterSupply,
                powerBackup: powerBackup,
                noticePeriod: noticePeriod,
                furnishingType: furnishingType,
                accomoType: accomoType,
                parking: filteredParking,
                preferTenants: filteredPreferTenants,
                petsAllowed: Boolean(petsAllowed),
                genderPrefer: genderPrefer,
                flatType: flatType,
                flatInside: filteredFlatInside,
                flatOutside: filteredFlatOutside,
                careTaker: careTaker,
                listingShowNo: listingShowNo,
                isDraft: true,
            },
        });
        res.status(201).json({ message: "Flat listing uploaded successfully", flat });
    } catch (err) {
        console.error("Error during Flat upload:", err);
        res.status(500).json({ message: "Failed to upload Flat. Please try again later." });
    }
});

ownerRouter.post("/room", authenticate , async (req :  AuthenticatedRequest , res : Response) =>{
    const ownerId = req.user?.id;
    try {
        const {
            city , townSector , location, landmark,Bhk, maxprice , minprice, offer ,  security, maintenance, totalRoom   , adress , totalFloor, waterSupply, powerBackup, noticePeriod, furnishingType, accomoType, parking, preferTenants,RoomAvailable,  genderPrefer, roomType, insideFacilities, outsideFacilities, careTaker, listingShowNo } = req.body;

        const filteredParking: string[] = parking ? parking.filter((item: string) => item !== undefined) : [];
        const filteredPreferTenants: string[] = preferTenants ? preferTenants.filter((item: string) => item !== undefined) : [];
        const filteredRoomInside: string[] = insideFacilities ? insideFacilities.filter((item: string) => item !== undefined) : [];
        const filteredRoomOutside: string[] = outsideFacilities ? outsideFacilities.filter((item: string) => item !== undefined) : [];


        const room = await prisma.roomInfo.create({
            data: {
                owner: {
                    connect: {
                        id: ownerId,
                    },
                },
                city : city,
                townSector : townSector,
                location: location,
                landmark: landmark,
                BHK : Bhk,
                security: security,
                MaxPrice : maxprice,
                MinPrice : minprice,
                Offer: offer,
                maintenance: maintenance,
                adress: adress,
                totalRoom: parseInt(totalRoom),
                totalFloor: String(totalFloor),
                waterSupply: waterSupply,
                powerBackup: powerBackup,
                noticePeriod: noticePeriod,
                furnishingType: furnishingType,
                accomoType: accomoType,
                parking: filteredParking,
                preferTenants: filteredPreferTenants,
                genderPrefer: genderPrefer,
                RoomAvailable : RoomAvailable,
                roomType: roomType,
                roomInside: filteredRoomInside,
                roomOutside: filteredRoomOutside,
                careTaker: careTaker,
                listingShowNo: listingShowNo,
                isDraft: true,
            },
        });
        res.status(201).json({ message: "Room listing uploaded successfully", room });
    } catch (err) {
        console.error("Error during Room upload:", err);
        res.status(500).json({ message: "Failed to upload Room. Please try again later." });
    }
})

ownerRouter.post("/pg", authenticate , async (req: AuthenticatedRequest , res : Response ) =>{
    const ownerId = req.user?.id;
    try {
        const {
            city , townSector , location, Bhk, landmark, maxprice , minprice, offer ,  security, maintenance, totalPG , adress , totalFloor, waterSupply, powerBackup, noticePeriod, PGType , bedCount,timeRestriction ,   foodAvailable , furnishingType, accomoType, parking, preferTenants, genderPrefer, insideFacilities, outsideFacilities, careTaker  , listingShowNo } = req.body;

        const filteredParking: string[] = parking ? parking.filter((item: string) => item !== undefined) : [];
        const filteredPreferTenants: string[] = preferTenants ? preferTenants.filter((item: string) => item !== undefined) : [];
        const filteredPGInside: string[] = insideFacilities ? insideFacilities.filter((item: string) => item !== undefined) : [];
        const filteredPGOutside: string[] = outsideFacilities ? outsideFacilities.filter((item: string) => item !== undefined) : [];


        const pg = await prisma.pgInfo.create({
            data: {
                owner: {
                    connect: {
                        id: ownerId,
                    },
                },
                city : city,
                townSector : townSector,
                location: location,
                landmark: landmark,
                BHK : Bhk,
                security: security,
                MaxPrice : maxprice,
                MinPrice : minprice,
                Offer: offer,
                maintenance: maintenance,
                adress: adress,
                totalPG: parseInt(totalPG),
                totalFloor: String(totalFloor),
                waterSupply: waterSupply,
                bedCount: parseInt(bedCount),
                timeRestrict: Boolean(timeRestriction),
                powerBackup: powerBackup,
                noticePeriod: noticePeriod,
                furnishingType: furnishingType,
                accomoType: accomoType,
                foodAvailable: Boolean(foodAvailable),
                parking: filteredParking,
                preferTenants: filteredPreferTenants,
                genderPrefer: genderPrefer,
                PGType: PGType,
                PGInside: filteredPGInside,
                PGOutside: filteredPGOutside,
                careTaker: careTaker,
                listingShowNo: listingShowNo,
                isDraft:  true,
            },
        });
        res.status(201).json({ message: "PG listing uploaded successfully", pg });
    } catch (err) {
        console.error("Error during PG upload:", err);
        res.status(500).json({ message: "Failed to upload PG. Please try again later." });
    }

})

ownerRouter.post("/hourlyroom" , authenticate , async (req: AuthenticatedRequest , res: Response) => {
    const ownerId = req.user?.id;
    try {
        const {city , townSector , palaceName , location , landmark , maxprice , minprice , adress ,totalRoom ,totalFloor , bedcount,noofGuests,furnishingType , accomoType , foodAvailable ,acType, preferTenants, genderPrefer , roomType , insideFacilities , outsideFacilities , parking , manager , listingShowNo } = req.body;
        
        const filteredParking: string[] = parking ? parking.filter((item: string) => item !== undefined) : [];
        const filteredPreferTenants: string[] = preferTenants ? preferTenants.filter((item: string) => item !== undefined) : [];
        const filteredRoomDayNightInside: string[] = insideFacilities ? insideFacilities.filter((item: string) => item !== undefined) : [];
        const filteredRoomDayNightOutside: string[] = outsideFacilities ? outsideFacilities.filter((item: string) => item !== undefined) : [];

        const hourlyroom = await prisma.hourlyInfo.create({
            data : {
                owner : {
                    connect : {
                        id : ownerId
                    }
                },
                city : city,
                townSector : townSector,
                location    : location,
                landmark    : landmark,
                palaceName : palaceName,
                BedCount : parseInt(bedcount), // Ensure bedcount is parsed as an integer
                MaxPrice : maxprice,
                MinPrice : minprice,
                adress : adress,
                totalRoom : parseInt(totalRoom),
                totalFloor : String(totalFloor),
                furnishingType : furnishingType,
                accomoType : accomoType,
                acType : acType,
                noofGuests : parseInt(noofGuests),
                foodAvailable : Boolean(foodAvailable),
                preferTenants : filteredPreferTenants,
                genderPrefer : genderPrefer,
                roomType : roomType,
                roomInside : filteredRoomDayNightInside,
                roomOutside : filteredRoomDayNightOutside,
                manager   : manager,
                ManagerConact : listingShowNo,
                parking         : filteredParking,
                isDraft: true,
            }
        })

        res.status(200).json({ message: "Day Night Room  uploaded successfully", hourlyroom });
    } catch (err) {
        console.error("Error during Day Night Room upload:", err);
        res.status(500).json({ message: "Failed to upload Day Night Room" });
    }
})

ownerRouter.post("/flat/images/presigned-urls", authenticate , async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { flatId } = req.body;
        const parsedFlatId = parseInt(flatId); // Ensure flatId is an integer

        if (!flatId) {
            res.status(400).json({ message: "Flat ID is required" });
            return;
        }

        // Define specific categories for images
        const categories = ["front", "lobby", "inside" ,"kitchen", "toilet", "bathroom", "careTaker"];
        const urls: { [key: string]: string } = {};

        for (const category of categories) {
            // Generate presigned URL for each category
            urls[category] = await putObject(
                `flat/${flatId}/${category}.jpeg`,
                "image/jpeg"
            );
        }
        await prisma.flatInfo.update({
            where: { id: parsedFlatId },
            data: { isDraft: false }, // Update the isDraft field to false
        });


         res.json({ presignedUrls: urls });
         return;
    } catch (err) {
        console.error("Error during image upload:", err);
        res.status(500).json({
             message: "Failed to generate presigned URLs. Please try again later." 
        });
        return;
    }
});

ownerRouter.post("/room/images/presigned-urls", authenticate , async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { roomId } = req.body;
        const parsedRoomId = parseInt(roomId); // Ensure roomId is an integer

        if (!roomId) {
            res.status(400).json({ message: "Room ID is required" });
            return;
        }

        // Define specific categories for images
        const categories = ["front", "lobby", "inside", "roomAngle" ,"kitchen", "toilet", "bathroom", "careTaker"];
        const urls: { [key: string]: string } = {};

        for (const category of categories) {
            // Generate presigned URL for each category
            urls[category] = await putObject(
                `room/${roomId}/${category}.jpeg`,
                "image/jpeg"
            );
        }
        await prisma.roomInfo.update({
            where: { id: parsedRoomId },
            data: { isDraft: false }, // Update the isDraft field to false
        });


         res.json({ presignedUrls: urls });
         return;
    } catch (err) {
        console.error("Error during image upload:", err);
        res.status(500).json({
             message: "Failed to generate presigned URLs. Please try again later." 
        });
        return;
    }
});

ownerRouter.post("/pg/images/presigned-urls", authenticate , async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { pgId } = req.body;
        const parsedPgId = parseInt(pgId); // Ensure pgId is an integer

        if (!pgId) {
            res.status(400).json({ message: "PG ID is required" });
            return;
        }

        // Define specific categories for images
        const categories = ["front", "inside" , "toilet", "bathroom"];
        const urls: { [key: string]: string } = {};

        for (const category of categories) {
            // Generate presigned URL for each category
            urls[category] = await putObject(
                `pg/${pgId}/${category}.jpeg`,
                "image/jpeg"
            );
        }
        await prisma.pgInfo.update({
            where: { id: parsedPgId },
            data: { isDraft: false }, // Update the isDraft field to false
        });

         res.json({ presignedUrls: urls });
         return;
    } catch (err) {
        console.error("Error during image upload:", err);
        res.status(500).json({
             message: "Failed to generate presigned URLs. Please try again later." 
        });
        return;
    }
});

ownerRouter.post("/hourlyroom/images/presigned-urls", authenticate , async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { hourlyroomId } = req.body; // Updated variable name
        const parsedHourlyroomId = parseInt(hourlyroomId); // Ensure hourlyroomId is an integer

        if (!hourlyroomId) {
            res.status(400).json({ message: "Hourly Room ID is required" });
            return;
        }

        // Define specific categories for images
        const categories = ["front", "inside" ,"anotherinsideview" , "toilet", "bathroom"];
        const urls: { [key: string]: string } = {};

        for (const category of categories) {
            // Generate presigned URL for each category
            urls[category] = await putObject(
                `hourlyroom/${hourlyroomId}/${category}.jpeg`,
                "image/jpeg"
            );
        }
        await prisma.hourlyInfo.update({
            where: { id: parsedHourlyroomId },
            data: { isDraft: false }, // Update the isDraft field to false
        });


         res.json({ presignedUrls: urls });
         return;
    } catch (err) {
        console.error("Error during image upload:", err);
        res.status(500).json({
             message: "Failed to generate presigned URLs. Please try again later." 
        });
        return;
    }``
})

ownerRouter.post("/logout", (req: AuthenticatedRequest, res: Response) => {
    localStorage.clear(); 
    res.status(200).json({ message: "Logout successful" });
});

export { ownerRouter };