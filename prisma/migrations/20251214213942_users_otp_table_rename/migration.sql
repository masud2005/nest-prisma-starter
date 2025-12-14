/*
  Warnings:

  - You are about to drop the `UserOtp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserOtp" DROP CONSTRAINT "UserOtp_userId_fkey";

-- DropTable
DROP TABLE "UserOtp";

-- CreateTable
CREATE TABLE "users_otp" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_otp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users_otp" ADD CONSTRAINT "users_otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
