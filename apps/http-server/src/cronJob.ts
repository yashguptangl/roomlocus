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
        const now = new Date();

        // ❌ **Expired Contact Logs Delete Karo**
        await prisma.verificationRequest.updateMany({
            where: {
                status: "DONE",
                updatedAt : { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: { status: "CANCELLED" },
        });


        const updatedProperties = await prisma.flatInfo.updateMany({
            where: {
            isVerified: true,
            verifiedByAdminOrAgent: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: {
            isVerified: false,
            paymentDone : false,
            verificationPending : true,
            verifiedByAdminOrAgent: undefined,
            },
        });

        const updatedProperties2 = await prisma.roomInfo.updateMany({
            where: {
            isVerified: true,
            verifiedByAdminOrAgent: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: {
            isVerified: false,
            paymentDone : false,
            verificationPending : true,
            verifiedByAdminOrAgent: undefined,
            },
        });

        const updatedProperties3 = await prisma.pgInfo.updateMany({
            where: {
            isVerified: true,
            verifiedByAdminOrAgent: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: {
            isVerified: false,
            paymentDone : false,
            verificationPending : true,
            },
        });

        const updatedProperties4 = await prisma.hourlyInfo.updateMany({
            where: {
            isVerified: true,
            verifiedByAdminOrAgent: { lte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            },
            data: {
            isVerified: false,
            paymentDone : false,
            verificationPending : true,
            verifiedByAdminOrAgent: undefined,
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

        // Purane VerificationRequest delete karo
        const deletedVerificationRequests = await prisma.verificationRequest.deleteMany({
            where: {
                createdAt: { lte: oneYearAgo }
            }
        });

        console.log(`🗑 Deleted ${deletedVerificationRequests.count} expired verification requests.`);
        // ...baaki aapka code...
    } catch (error) {
        console.error("❌ Error deleting expired verification requests:", error);
    }
});

console.log("⏳ Cron job started: Checking for expired contact logs every hour...");
