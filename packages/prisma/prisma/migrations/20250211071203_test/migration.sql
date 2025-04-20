-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlatInfo" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "Type" TEXT NOT NULL DEFAULT 'Flat',
    "city" TEXT NOT NULL,
    "townSector" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "BHK" TEXT NOT NULL,
    "MaxPrice" TEXT NOT NULL,
    "MinPrice" TEXT NOT NULL,
    "Offer" TEXT NOT NULL,
    "security" TEXT NOT NULL,
    "maintenance" TEXT NOT NULL,
    "totalFlat" INTEGER NOT NULL,
    "Adress" TEXT NOT NULL,
    "ageofProperty" TEXT NOT NULL,
    "waterSupply" TEXT NOT NULL,
    "powerBackup" TEXT NOT NULL,
    "noticePeriod" TEXT NOT NULL,
    "furnishingType" TEXT NOT NULL,
    "accomoType" TEXT NOT NULL,
    "parking" TEXT[],
    "preferTenants" TEXT[],
    "petsAllowed" BOOLEAN NOT NULL,
    "genderPrefer" TEXT NOT NULL,
    "flatType" TEXT NOT NULL,
    "careTaker" TEXT NOT NULL,
    "listingShowNo" TEXT NOT NULL,
    "flatInside" TEXT[],
    "flatOutside" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationPending" BOOLEAN NOT NULL DEFAULT true,
    "paymentDone" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FlatInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PgInfo" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "Type" TEXT NOT NULL DEFAULT 'Pg',
    "city" TEXT NOT NULL,
    "townSector" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "BHK" TEXT NOT NULL,
    "MinPrice" TEXT NOT NULL,
    "MaxPrice" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "Offer" TEXT NOT NULL,
    "security" TEXT NOT NULL,
    "maintenance" TEXT NOT NULL,
    "totalPG" INTEGER NOT NULL,
    "ageofProperty" TEXT NOT NULL,
    "waterSupply" TEXT NOT NULL,
    "PGType" TEXT NOT NULL,
    "bedCount" INTEGER NOT NULL,
    "powerBackup" TEXT NOT NULL,
    "noticePeriod" TEXT NOT NULL,
    "furnishingType" TEXT NOT NULL,
    "accomoType" TEXT NOT NULL,
    "foodAvailable" BOOLEAN NOT NULL,
    "parking" TEXT[],
    "preferTenants" TEXT[],
    "genderPrefer" TEXT NOT NULL,
    "timeRestrict" BOOLEAN NOT NULL,
    "PGInside" TEXT[],
    "PGOutside" TEXT[],
    "careTaker" TEXT NOT NULL,
    "listingShowNo" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationPending" BOOLEAN NOT NULL DEFAULT true,
    "paymentDone" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PgInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomInfo" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "Type" TEXT NOT NULL DEFAULT 'Room',
    "city" TEXT NOT NULL,
    "townSector" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "BHK" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "MinPrice" TEXT NOT NULL,
    "MaxPrice" TEXT NOT NULL,
    "Offer" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "security" TEXT NOT NULL,
    "maintenance" TEXT NOT NULL,
    "totalRoom" INTEGER NOT NULL,
    "ageofProperty" TEXT NOT NULL,
    "powerBackup" TEXT NOT NULL,
    "noticePeriod" TEXT NOT NULL,
    "waterSupply" TEXT NOT NULL,
    "furnishingType" TEXT NOT NULL,
    "accomoType" TEXT NOT NULL,
    "parking" TEXT[],
    "preferTenants" TEXT[],
    "genderPrefer" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "roomInside" TEXT[],
    "roomOutside" TEXT[],
    "careTaker" TEXT NOT NULL,
    "listingShowNo" TEXT NOT NULL,
    "RoomAvailable" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationPending" BOOLEAN NOT NULL DEFAULT true,
    "paymentDone" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RoomInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "cities" TEXT[],

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactLog" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "accessDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "propertyType" TEXT NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContactLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_mobile_key" ON "Owner"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "FlatInfo" ADD CONSTRAINT "FlatInfo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PgInfo" ADD CONSTRAINT "PgInfo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInfo" ADD CONSTRAINT "RoomInfo_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLog" ADD CONSTRAINT "ContactLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLog" ADD CONSTRAINT "ContactLog_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
