-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "exportedAt" TEXT,
ADD COLUMN     "exportedBy" TEXT,
ADD COLUMN     "isImported" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleteToken" TEXT,
ADD COLUMN     "deleteTokenExp" TIMESTAMP(3),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExp" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verificationTokenExp" TIMESTAMP(3),
ADD COLUMN     "writerName" TEXT;

-- CreateTable
CREATE TABLE "character_relations" (
    "id" SERIAL NOT NULL,
    "project_id" TEXT NOT NULL,
    "char_a_id" TEXT NOT NULL,
    "char_b_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Amizade',
    "intensity" INTEGER NOT NULL DEFAULT 6,
    "scene_id" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_relations_pkey" PRIMARY KEY ("id")
);
