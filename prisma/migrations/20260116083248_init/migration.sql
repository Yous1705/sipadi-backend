-- CreateEnum
CREATE TYPE "SubmissionPolicy" AS ENUM ('URL_ONLY', 'FILE_ONLY', 'URL_OR_FILE');

-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('URL', 'FILE');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "allowedMime" TEXT,
ADD COLUMN     "maxFileSizeMb" INTEGER DEFAULT 2,
ADD COLUMN     "submissionPolicy" "SubmissionPolicy" NOT NULL DEFAULT 'URL_ONLY';

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "fileUrl" DROP NOT NULL;
