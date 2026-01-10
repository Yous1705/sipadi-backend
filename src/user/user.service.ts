import { UpdateStudentDto } from './dto/update-student.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { Role } from '@prisma/client';
import { CreateStudentDto } from './dto/create-student.dto';
import * as bcrypt from 'bcryptjs';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/updatee-teacher.dto';
@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}
  async createStudent(dto: CreateStudentDto) {
    await this.ensureEmailUnique(dto.email);

    const hashed = await bcrypt.hash(dto.password, 10);

    return this.repo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      class: {
        connect: {
          id: dto.classId,
        },
      },
      role: Role.STUDENT,
    });
  }

  async createTeacher(dto: CreateTeacherDto) {
    await this.ensureEmailUnique(dto.email);

    const hashed = await bcrypt.hash(dto.password, 10);

    return this.repo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: Role.TEACHER,
    });
  }

  async updateStudent(id: number, dto: UpdateStudentDto) {
    const student = await this.ensureActiveUser(id, Role.STUDENT);
    if (dto.email && dto.email !== student.email) {
      await this.ensureEmailUnique(dto.email);
    }

    return this.repo.update(id, {
      name: dto.name,
      email: dto.email,
      class: {
        connect: {
          id: dto.classId,
        },
      },
    });
  }

  async updateTeacher(id: number, dto: UpdateTeacherDto) {
    const teacher = await this.ensureActiveUser(id, Role.TEACHER);

    if (dto.email && dto.email !== teacher.email) {
      this.ensureEmailUnique(dto.email);
    }

    return this.repo.update(id, {
      name: dto.name,
      email: dto.email,
    });
  }

  async resetPassword(userId: number, newPassord: string) {
    const user = await this.ensureActiveUser(userId);

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot reset password for admin user');
    }

    const same = await bcrypt.compare(newPassord, user.password);

    if (same) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }

    const hashed = await bcrypt.hash(newPassord, 10);
    return this.repo.update(user.id, {
      password: hashed,
    });
  }

  async changeRole(userId: number, newRole: Role) {
    const user = await this.ensureActiveUser(userId);
    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot change role to admin');
    }
    if (user.role === newRole) {
      throw new BadRequestException('User already has this role');
    }
    return this.repo.update(user.id, { role: newRole });
  }

  async deactivateUser(userId: number) {
    const user = await this.ensureActiveUser(userId);

    if (!user) {
      throw new BadRequestException('User not found or inactive');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot deactivate admin user');
    }

    if (!user.isActive) {
      throw new BadRequestException('User is already inactive');
    }

    return this.repo.deactivate(userId);
  }

  private async ensureEmailUnique(email: string) {
    const exist = await this.repo.findByEmail(email);
    if (exist) {
      throw new BadRequestException('Email already exists');
    }
  }

  private async ensureActiveUser(id: number, role?: Role) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new BadRequestException('User not found or inactive');
    }
    if (role && user.role !== role) {
      throw new BadRequestException('User role does not match');
    }

    return user;
  }
}
