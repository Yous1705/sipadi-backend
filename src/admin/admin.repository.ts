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
      where: { role: Role.STUDENT },
    });
  }

  findAllTeachers() {
    return this.prisma.user.findMany({
      where: { role: Role.TEACHER },
    });
  }

  findAllClasses() {
    return this.prisma.class.findMany();
  }

  findTeacherBySubject(subjectName: string) {
    return this.prisma.user.findMany({
      where: {
        role: Role.TEACHER,
        teachingAssigment: {
          some: {
            subject: {
              name: subjectName,
            },
          },
        },
      },
      select: {
        name: true,
      },
    });
  }

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

  async moveStudent(data: { studentId: number; classId: number }) {
    const student = await this.prisma.user.findUnique({
      where: { id: data.studentId, role: Role.STUDENT },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    return this.prisma.user.update({
      where: { id: data.studentId },
      data: { class: { connect: { id: data.classId } } },
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

  createClass(data: { name: string; year: number }) {
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
      where: { id: data.teacherId },
    });

    if (!teacher || teacher.role !== Role.TEACHER) {
      throw new BadRequestException('User is not a teacher');
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

  async unassignTeacher(teachingAssigmentId: number) {
    return this.prisma.teachingAssigment.delete({
      where: { id: teachingAssigmentId },
    });
  }

  async deleteUser(userId: number) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
