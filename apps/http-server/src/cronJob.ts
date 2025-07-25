import cron from "node-cron";
import { prisma } from "@repo/db/prisma";

// ⏳ **Har Ek Ghante (Every Hour) Expired Logs Delete Karega**
cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();

        // ❌ **Expired Contact Logs Delete Karo**
        const deletedLogs = await prisma.contactLog.deleteMany({
            where: { expiryDate: { lte: now } },
        });

        console.log(`🗑 Deleted ${deletedLogs.count} expired contact logs.`);
    } catch (error) {
        console.error("❌ Error deleting expired logs:", error);
    }
});

cron.schedule("0 * * * *", async () => {
    try {

        const updatedProperties = await prisma.flatInfo.updateMany({
            where: {
                isVerified: true,
                verifiedByAdminOrAgent: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: {
                isVerified: false,
                paymentDone: false,
                verificationPending: true,
                verifiedByAdminOrAgent: undefined,
                latitude: 0,
                longitude: 0,
                AdressByAPI: "",
                isLiveLocation: false,
            },
        });

        const updatedProperties2 = await prisma.roomInfo.updateMany({
            where: {
                isVerified: true,
                verifiedByAdminOrAgent: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: {
                isVerified: false,
                paymentDone: false,
                verificationPending: true,
                verifiedByAdminOrAgent: undefined,
                latitude: 0,
                longitude: 0,
                AdressByAPI: "",
                isLiveLocation: false,
            },
        });

        const updatedProperties3 = await prisma.pgInfo.updateMany({
            where: {
                isVerified: true,
                verifiedByAdminOrAgent: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: {
                isVerified: false,
                paymentDone: false,
                verificationPending: true,
                verifiedByAdminOrAgent: undefined,
                latitude: 0,
                longitude: 0,
                AdressByAPI: "",
                isLiveLocation: false,
            },
        });

        const updatedProperties4 = await prisma.hourlyInfo.updateMany({
            where: {
                isVerified: true,
                verifiedByAdminOrAgent: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: {
                isVerified: false,
                paymentDone: false,
                verificationPending: true,
                verifiedByAdminOrAgent: undefined,
                latitude: 0,
                longitude: 0,   
                AdressByAPI: "",
                isLiveLocation: false,
            },
        });

        console.log(`🗑 Updated ${updatedProperties.count} expired verified property`);
        console.log(`🗑 Updated ${updatedProperties2.count} expired verified property`)
        console.log(`🗑 Updated ${updatedProperties3.count} expired verified property`)
        console.log(`🗑 Updated ${updatedProperties4.count} expired verified property`);
    }
    catch (error) {
        console.error("❌ Error deleting expired logs:", error);
    }
}
);


cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        // Sirf self wali VerificationRequest delete karo
        const deletedVerificationRequests = await prisma.verificationRequest.deleteMany({
            where: {
                createdAt: { lte: oneYearAgo },
                verificationType: "SELF"
            }
        });

        await prisma.verificationRequest.updateMany({
            where: {
                status: "DONE",
                updatedAt: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: { status: "PENDING" },
        });

        console.log(`🗑 Deleted ${deletedVerificationRequests.count} expired self verification requests.`);
    } catch (error) {
        console.error("❌ Error deleting expired self verification requests:", error);
    }
});
