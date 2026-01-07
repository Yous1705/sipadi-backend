/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `_TeacherSubjects` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,teachingAssigmentId,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teachingAssigmentId` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teachingAssigmentId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_classId_fkey";

-- DropForeignKey
ALTER TABLE "_TeacherSubjects" DROP CONSTRAINT "_TeacherSubjects_A_fkey";

-- DropForeignKey
ALTER TABLE "_TeacherSubjects" DROP CONSTRAINT "_TeacherSubjects_B_fkey";

-- DropIndex
DROP INDEX "Attendance_studentId_subjectId_date_key";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "subjectId",
ADD COLUMN     "teachingAssigmentId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "subjectId",
ADD COLUMN     "teachingAssigmentId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "homeroomTeacherId" INTEGER;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "classId";

-- DropTable
DROP TABLE "_TeacherSubjects";

-- CreateTable
CREATE TABLE "TeachingAssigment" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingAssigment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeachingAssigment_teacherId_classId_subjectId_key" ON "TeachingAssigment"("teacherId", "classId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_teachingAssigmentId_date_key" ON "Attendance"("studentId", "teachingAssigmentId", "date");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_teachingAssigmentId_fkey" FOREIGN KEY ("teachingAssigmentId") REFERENCES "TeachingAssigment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_teachingAssigmentId_fkey" FOREIGN KEY ("teachingAssigmentId") REFERENCES "TeachingAssigment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssigment" ADD CONSTRAINT "TeachingAssigment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssigment" ADD CONSTRAINT "TeachingAssigment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssigment" ADD CONSTRAINT "TeachingAssigment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
