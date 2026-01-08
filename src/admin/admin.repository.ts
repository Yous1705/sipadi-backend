import { PrismaService } from 'src/prisma/prisma.service';
import { Admin } from './entities/admin.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { connect } from 'http2';
import * as bcrypt from 'bcryptjs';
import { Subject } from 'rxjs';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==================================
  //  Get
  // ===================================
  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findAllUsers() {
    return this.prisma.user.findMany();
  }

  findAllStudents() {
    return this.prisma.user.findMany({
      where: { role: Role.STUDENT, isActive: true },
    });
  }

  findAllTeachers() {
    return this.prisma.user.findMany({
      where: { role: Role.TEACHER, isActive: true },
    });
  }

  findAllClasses() {
    return this.prisma.class.findMany({
      where: { isActive: true },
    });
  }

  findTeacherBySubject(subjectName: string) {
    return this.prisma.teachingAssigment.findMany({
      where: { subject: { name: subjectName } },
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
        class: {
          select: {
            name: true,
            year: true,
          },
        },
      },
    });
  }

  findAllAttendances() {
    return this.prisma.attendance.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        teachingAssigment: {
          include: {
            teacher: {
              select: {
                name: true,
              },
            },
            class: {
              select: {
                name: true,
              },
            },
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  findAttendancesByFilter(filter: {
    classId?: number;
    studentId?: number;
    teacherId?: number;
    subjectId?: number;
    date?: Date;
  }) {
    return this.prisma.attendance.findMany({
      where: {
        studentId: filter.studentId,
        date: filter.date,
        teachingAssigment: {
          teacherId: filter.teacherId,
          classId: filter.classId,
          subjectId: filter.subjectId,
        },
      },
      include: {
        student: {
          select: {
            name: true,
          },
        },
        teachingAssigment: {
          include: {
            class: {
              select: {
                name: true,
                year: true,
              },
            },
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  // ==========================================
  //  CREATE
  // =======================================
  async createStudent(data: {
    name: string;
    email: string;
    password: string;
    classId: number;
  }) {
    const exist = await this.findUserByEmail(data.email);
    const hashed = await bcrypt.hash(data.password, 10);
    const studentclass = await this.prisma.class.findUnique({
      where: { id: data.classId },
    });

    if (exist) {
      throw new BadRequestException('Email already exists');
    }

    if (!data.classId) {
      throw new BadRequestException('Class ID is required');
    }

    if (!studentclass) {
      throw new BadRequestException('Class not found');
    }

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        classId: data.classId,
        role: Role.STUDENT,
      },
    });
  }

  async createTeacher(data: { name: string; email: string; password: string }) {
    const exist = await this.findUserByEmail(data.email);
    const hashed = await bcrypt.hash(data.password, 10);

    if (exist) {
      throw new BadRequestException('Email already exists');
    }

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        role: Role.TEACHER,
      },
    });
  }

  async createClass(data: { name: string; year: number }) {
    const exist = await this.prisma.class.findMany({
      where: { name: data.name, year: data.year },
    });

    if (exist) {
      throw new BadRequestException('Class already exists');
    }

    return this.prisma.class.create({
      data: {
        name: data.name,
        year: data.year,
      },
    });
  }

  createSubject(data: { name: string }) {
    return this.prisma.subject.create({
      data: {
        name: data.name,
      },
    });
  }

  // ==========================================
  // uPDATE
  // =======================================
  async moveStudent(data: { studentId: number; classId: number }) {
    const student = await this.prisma.user.findFirst({
      where: { id: data.studentId, role: Role.STUDENT, isActive: true },
    });

    const studentClass = await this.prisma.class.findUnique({
      where: { id: data.classId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    if (!studentClass) {
      throw new BadRequestException('Class not found');
    }

    return this.prisma.user.update({
      where: { id: data.studentId },
      data: { class: { connect: { id: data.classId } } },
      include: {
        class: {
          select: {
            name: true,
            year: true,
          },
        },
      },
    });
  }

  async updateStudent(
    studentId: number,
    data: {
      name?: string;
      email?: string;
      classId?: number;
    },
  ) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: studentId,
        role: Role.STUDENT,
        isActive: true,
      },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    if (data.email && data.email !== student.email) {
      const exist = await this.findUserByEmail(data.email);
      if (exist) {
        throw new BadRequestException('Email already exists');
      }
    }

    await this.prisma.user.update({
      where: {
        id: studentId,
      },
      data: {
        name: data.name,
        email: data.email,
        classId: data.classId,
      },
    });
  }

  async updateTeacher(
    teacherId: number,
    data: { name?: string; email?: string },
  ) {
    const teacher = await this.prisma.user.findFirst({
      where: {
        id: teacherId,
        role: Role.TEACHER,
        isActive: true,
      },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    if (data.email && data.email !== teacher.email) {
      const exist = await this.findUserByEmail(data.email);
      if (exist) {
        throw new BadRequestException('Email already exists');
      }
    }

    return this.prisma.user.update({
      where: {
        id: teacherId,
      },
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }

  async resetPassword(userId: number, newPassord: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new BadRequestException('User not found or inactive');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot reset password for admin user');
    }

    const hashed = await bcrypt.hash(newPassord, 10);
    const isMatch = await bcrypt.compare(newPassord, user.password);

    if (isMatch) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async restoreUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isActive) {
      throw new BadRequestException('User is already active');
    }

    const emailUsed = await this.prisma.user.findFirst({
      where: {
        email: user.email,
        isActive: true,
        NOT: {
          id: userId,
        },
      },
    });

    if (emailUsed) {
      throw new BadRequestException(
        'Cannot restore user. Email is used by another active user',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async changeUserRole(userId: number, newRole: Role) {
    if (newRole === Role.ADMIN) {
      throw new BadRequestException('Cannot change role to admin');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new BadRequestException('User not found or inactive');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot change role of admin user');
    }

    if (user.role === newRole) {
      throw new BadRequestException('User already has this role');
    }

    if (user.role === Role.STUDENT && newRole === Role.TEACHER) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          classId: null,
        },
      });
    }

    if (user.role === Role.TEACHER && newRole === Role.STUDENT) {
      await this.prisma.teachingAssigment.deleteMany({
        where: {
          teacherId: userId,
        },
      });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  updateClass(classId: number, data: { name?: string; year?: number }) {
    return this.prisma.class.update({
      where: { id: classId },
      data: {
        name: data.name,
        year: data.year,
      },
    });
  }

  async assignHomeroomTeacher(data: { classId: number; teacherId: number }) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: data.teacherId, isActive: true },
    });

    const classes = await this.prisma.class.findUnique({
      where: { id: data.classId },
    });

    const exist = await this.prisma.class.findFirst({
      where: { homeroomTeacherId: data.teacherId },
    });

    if (exist) {
      throw new BadRequestException('Homeroom teacher already assigned');
    }

    if (!teacher || teacher.role !== Role.TEACHER) {
      throw new BadRequestException('User is not a teacher');
    }

    if (!classes) {
      throw new BadRequestException('Class not found');
    }

    return this.prisma.class.update({
      where: { id: data.classId },
      data: {
        homeroomTeacher: {
          connect: { id: data.teacherId },
        },
      },
      include: {
        homeroomTeacher: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async assignTeacherToClass(data: {
    teacherId: number;
    classId: number;
    subjectId: number;
  }) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: data.teacherId, isActive: true },
    });

    const classes = await this.prisma.class.findUnique({
      where: { id: data.classId },
    });

    const subject = await this.prisma.subject.findUnique({
      where: { id: data.subjectId },
    });

    const existing = await this.prisma.teachingAssigment.findFirst({
      where: {
        teacherId: data.teacherId,
        classId: data.classId,
        subjectId: data.subjectId,
      },
    });

    if (!classes) {
      throw new BadRequestException('Class not found');
    }

    if (!teacher || teacher.role !== Role.TEACHER) {
      throw new BadRequestException('User is not a teacher');
    }

    if (!subject) {
      throw new BadRequestException('Subject not found');
    }

    if (existing) {
      throw new BadRequestException(
        'Teacher already assigned to this class and subject',
      );
    }

    return this.prisma.teachingAssigment.create({
      data: {
        teacher: { connect: { id: data.teacherId } },
        class: { connect: { id: data.classId } },
        subject: { connect: { id: data.subjectId } },
      },
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  // ==========================================
  // DELETE
  // =======================================

  async unassignTeacher(teachingAssigmentId: number) {
    return this.prisma.teachingAssigment.delete({
      where: { id: teachingAssigmentId },
    });
  }

  async removeStudentFromClass(studentId: number) {
    return this.prisma.user.update({
      where: { id: studentId },
      data: { classId: null },
    });
  }

  async deleteClass(classId: number) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: true,
        teachingAssigment: true,
      },
    });

    if (!classEntity || !classEntity.isActive) {
      throw new BadRequestException('Class not found or already inactive');
    }

    if (classEntity.students.length > 0) {
      await this.prisma.user.updateMany({
        where: {
          classId,
        },
        data: {
          classId: null,
        },
      });
    }

    if (classEntity.teachingAssigment.length > 0) {
      await this.prisma.teachingAssigment.deleteMany({
        where: {
          classId: classId,
        },
      });
    }

    return this.prisma.class.update({
      where: { id: classId },
      data: {
        isActive: false,
        homeroomTeacherId: null,
      },
      select: {
        id: true,
        name: true,
        year: true,
        isActive: true,
      },
    });
  }

  async deleteAttendance(attendanceId: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new BadRequestException('Attendance not found');
    }

    return this.prisma.attendance.delete({
      where: { id: attendanceId },
    });
  }

  async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot delete admin user');
    }

    if (!user.isActive) {
      throw new BadRequestException('User is already inactive');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }
}
