-- CreateTable
CREATE TABLE "TempMobileVerification" (
    "id" SERIAL NOT NULL,
    "mobile" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempMobileVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TempMobileVerification_mobile_key" ON "TempMobileVerification"("mobile");
