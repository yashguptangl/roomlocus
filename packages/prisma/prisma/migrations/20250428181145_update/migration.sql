-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_FlatInfo_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "FlatInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_PgInfo_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "PgInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_RoomInfo_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "RoomInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_hourlyInfo_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "hourlyInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
