import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttendanceStatus, Role } from '@prisma/client';
@Injectable()
export class TeacherRepository {
  constructor(private readonly prisma: PrismaService) {}

  getMyTeachings(teacherId: number) {
    return this.prisma.teachingAssigment.findMany({
      where: {
        teacherId,
      },
      include: {
        class: true,
        subject: true,
      },
    });
  }

  getStudents(teachingAssigmentId: number) {
    return this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        classId: teachingAssigmentId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  getAssignmet(teachingAssigmentId: number) {
    return this.prisma.assignment.findMany({
      where: {
        teachingAssigmentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSubmission(assignmentId: number, teacherId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        teachingAssigment: true,
      },
    });

    if (!assignment || assignment.teachingAssigment.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized teaching assignment');
    }

    return this.prisma.submission.findMany({
      where: {
        assignmentId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // //   ==============================
  // //   TEACHING ASSIGNMENT
  // //   ==============================
  // findMyTeachingAssignments(teacherId: number) {
  //   return this.prisma.teachingAssigment.findMany({
  //     where: {
  //       teacherId,
  //     },
  //     include: {
  //       class: {
  //         select: {
  //           id: true,
  //           name: true,
  //           year: true,
  //         },
  //       },
  //       subject: {
  //         select: {
  //           id: true,
  //           name: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // async findStudentsByTeachingAssignment(
  //   teacherId: number,
  //   teachingAssigmentId: number,
  // ) {
  //   const teachingAssignment = await this.prisma.teachingAssigment.findFirst({
  //     where: {
  //       id: teachingAssigmentId,
  //       teacherId,
  //     },
  //     include: {
  //       class: {
  //         select: {
  //           students: {
  //             select: {
  //               id: true,
  //               name: true,
  //               email: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (!teachingAssignment) {
  //     throw new BadRequestException('Unauthorized teaching assignment');
  //   }

  //   return teachingAssignment.class.students;
  // }

  // async getAssignmentDetail(teacherId: number, assignmentId: number) {
  //   const assignment = await this.prisma.assignment.findFirst({
  //     where: {
  //       id: assignmentId,
  //       teachingAssigment: {
  //         teacherId,
  //       },
  //     },
  //     include: {
  //       submissions: {
  //         include: {
  //           student: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //         },
  //       },
  //       teachingAssigment: {
  //         include: {
  //           class: {
  //             include: {
  //               students: {
  //                 select: {
  //                   id: true,
  //                   name: true,
  //                   email: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (!assignment) {
  //     throw new BadRequestException('Unauthorized assignment');
  //   }

  //   const submittedStudentId = assignment.submissions.map(
  //     (submission) => submission.studentId,
  //   );

  //   const notSubmitted = assignment.teachingAssigment.class.students.filter(
  //     (student) => !submittedStudentId.includes(student.id),
  //   );

  //   return {
  //     assignment,
  //     totalStudents: assignment.teachingAssigment.class.students.length,
  //     totalSubmissions: assignment.submissions.length,
  //     notSubmitted,
  //   };
  // }

  // async createAssignment(
  //   teacherId: number,
  //   data: {
  //     teachingAssignmentId: number;
  //     title: string;
  //     description?: string;
  //     dueDate: Date;
  //   },
  // ) {
  //   const teachingAssignment = await this.prisma.teachingAssigment.findFirst({
  //     where: {
  //       id: data.teachingAssignmentId,
  //       teacherId,
  //     },
  //   });

  //   if (!teachingAssignment) {
  //     throw new BadRequestException('Unauthorized teaching assignment');
  //   }

  //   return this.prisma.assignment.create({
  //     data: {
  //       title: data.title,
  //       description: data.description,
  //       dueDate: data.dueDate,
  //       teachingAssigmentId: teachingAssignment.id,
  //     },
  //   });
  // }

  // async updateAssignment(
  //   teacherId: number,
  //   assignmentId: number,
  //   data: {
  //     title?: string;
  //     description?: string;
  //     dueDate?: Date;
  //   },
  // ) {
  //   const assignment = await this.prisma.assignment.findFirst({
  //     where: {
  //       id: assignmentId,
  //       teachingAssigment: {
  //         teacherId,
  //       },
  //     },
  //   });

  //   if (!assignment) {
  //     throw new BadRequestException('Assignment not found');
  //   }

  //   return this.prisma.assignment.update({
  //     where: {
  //       id: assignmentId,
  //     },
  //     data,
  //   });
  // }

  // async deleteAssignment(teacherId: number, assignmentId: number) {
  //   const assignment = await this.prisma.assignment.findFirst({
  //     where: {
  //       id: assignmentId,
  //       teachingAssigment: {
  //         teacherId,
  //       },
  //     },
  //   });

  //   if (!assignment) {
  //     throw new BadRequestException('Assignment not found or unauthorized');
  //   }

  //   return this.prisma.assignment.delete({
  //     where: {
  //       id: assignmentId,
  //     },
  //   });
  // }

  // //   ===========================
  // //   ATTeNDANCE
  // // ==============================

  // findAttendance(teacherId: number, teachingAssigmentId: number) {
  //   return this.prisma.attendance.findMany({
  //     where: {
  //       teachingAssigmentId,
  //       teachingAssigment: {
  //         teacherId,
  //       },
  //     },
  //     include: {
  //       student: {
  //         select: {
  //           id: true,
  //           name: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       attendanceSession: {
  //         openAt: 'desc',
  //       },
  //     },
  //   });
  // }

  // async inputAttendance(
  //   teacherId: number,
  //   data: {
  //     teachingAssigmentId: number;
  //     studentId: number;
  //     date: Date;
  //     status: AttendanceStatus;
  //     note?: string;
  //     attendanceSessionId: number;
  //     createBy: Role;
  //   },
  // ) {
  //   const teachingAssignment = await this.prisma.teachingAssigment.findFirst({
  //     where: {
  //       id: data.teachingAssigmentId,
  //       teacherId,
  //       class: {
  //         students: {
  //           some: {
  //             id: data.studentId,
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (!teachingAssignment) {
  //     throw new BadRequestException(
  //       'Unauthorized teaching assignment or student not in class',
  //     );
  //   }

  //   const exist = await this.prisma.attendance.findFirst({
  //     where: {
  //       studentId: data.studentId,
  //       teachingAssigmentId: data.teachingAssigmentId,
  //       date: data.date,
  //     },
  //   });

  //   if (exist) {
  //     throw new BadRequestException('Attendance already exist');
  //   }

  //   return this.prisma.attendance.create({
  //     data: {
  //       studentId: data.studentId,
  //       teachingAssigmentId: data.teachingAssigmentId,
  //       date: data.date,
  //       status: data.status,
  //       note: data.note,
  //       attendanceSessionId: data.attendanceSessionId,
  //       createBy: data.createBy,
  //     },
  //   });
  // }

  // async updateAttendance(
  //   teacherId: number,
  //   attendanceId: number,
  //   data: {
  //     status?: AttendanceStatus;
  //     note?: string;
  //   },
  // ) {
  //   const attendance = await this.prisma.attendance.findFirst({
  //     where: {
  //       id: attendanceId,
  //       teachingAssigment: {
  //         teacherId,
  //       },
  //     },
  //   });

  //   if (!attendance) {
  //     throw new BadRequestException('Attendance not found or unauthorized');
  //   }

  //   return this.prisma.attendance.update({
  //     where: {
  //       id: attendanceId,
  //     },
  //     data,
  //   });
  // }

  // async openAttendance(
  //   teacherId: number,
  //   teachingAssigmentId: number,
  //   data: {
  //     openAt: Date;
  //     closeAt: Date;
  //   },
  // ) {
  //   const teachingAssignment = await this.prisma.teachingAssigment.findFirst({
  //     where: {
  //       id: teachingAssigmentId,
  //       teacherId,
  //     },
  //   });

  //   if (!teachingAssignment) {
  //     throw new BadRequestException('Unauthorized teaching assignment');
  //   }

  //   return this.prisma.attendanceSession.create({
  //     data: {
  //       teachingAssigmentId,
  //       openAt: data.openAt,
  //       closeAt: data.closeAt,
  //     },
  //   });
  // }

  // async closeAttendance(teacherId: number, sessionId: number) {
  //   const session = await this.prisma.attendanceSession.findFirst({
  //     where: {
  //       id: sessionId,
  //       teachingAssigment: {
  //         teacherId,
  //       },
  //     },
  //   });

  //   if (!session) {
  //     throw new BadRequestException('Session not found or unauthorized');
  //   }

  //   return this.prisma.attendanceSession.update({
  //     where: {
  //       id: sessionId,
  //     },
  //     data: {
  //       isActive: false,
  //     },
  //   });
  // }

  // //   ===========================
  // //   SUBMISSION
  // // ==============================

  // findSubmissions(teacherId: number, assignmentId: number) {
  //   return this.prisma.submission.findMany({
  //     where: {
  //       assignmentId,
  //       assignment: {
  //         teachingAssigment: {
  //           teacherId,
  //         },
  //       },
  //     },
  //     include: {
  //       student: {
  //         select: {
  //           id: true,
  //           name: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // async gradeSubmission(
  //   teacherId: number,
  //   submissionId: number,
  //   data: {
  //     score: number;
  //     feedback?: string;
  //   },
  // ) {
  //   if (data.score < 0 || data.score > 100) {
  //     throw new BadRequestException('Score must be between 0 and 100');
  //   }

  //   const submission = await this.prisma.submission.findFirst({
  //     where: {
  //       id: submissionId,
  //       assignment: {
  //         teachingAssigment: {
  //           teacherId,
  //         },
  //       },
  //     },
  //   });

  //   if (!submission) {
  //     throw new BadRequestException('Submission not found or unauthorized');
  //   }

  //   return this.prisma.submission.update({
  //     where: {
  //       id: submissionId,
  //     },
  //     data: {
  //       score: data.score,
  //       feedback: data.feedback,
  //     },
  //   });
  // }
}
