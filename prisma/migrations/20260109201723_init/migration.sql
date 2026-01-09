/*
  Warnings:

  - A unique constraint covering the columns `[studentId,attendanceSessionId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `attendanceSessionId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createBy` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Attendance_studentId_teachingAssigmentId_date_key";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "attendanceSessionId" INTEGER NOT NULL,
ADD COLUMN     "createBy" "Role" NOT NULL;

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" SERIAL NOT NULL,
    "teachingAssigmentId" INTEGER NOT NULL,
    "openAt" TIMESTAMP(3) NOT NULL,
    "closeAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_attendanceSessionId_key" ON "Attendance"("studentId", "attendanceSessionId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_attendanceSessionId_fkey" FOREIGN KEY ("attendanceSessionId") REFERENCES "AttendanceSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_teachingAssigmentId_fkey" FOREIGN KEY ("teachingAssigmentId") REFERENCES "TeachingAssigment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
