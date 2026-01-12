import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findExisting(studentId: number, assignmetId: number) {
    return this.prisma.submission.findFirst({
      where: {
        studentId: studentId,
        assignmentId: assignmetId,
      },
    });
  }

  create(data: Prisma.SubmissionCreateInput) {
    return this.prisma.submission.create({ data });
  }

  upsertSubmission(studentId: number, assignmentId: number, fileUrl: string) {
    return this.prisma.submission.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
      },
      update: {
        fileUrl,
        submittedAt: new Date(),
      },
      create: {
        studentId,
        assignmentId,
        fileUrl,
      },
    });
  }

  grade(
    submissionId: number,
    data: {
      score: number;
      feedback?: string;
    },
    teacherId: number,
  ) {
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback,
        gradedById: teacherId,
      },
    });
  }
}
