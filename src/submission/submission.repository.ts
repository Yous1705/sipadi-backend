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
}
