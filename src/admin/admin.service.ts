import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateClassDto } from '../classes/dto/create-class.dto';
import { MoveStudentDto } from '../classes/dto/move-student.dto';
import { UpdateClassDto } from '../classes/dto/update-class.dto';
import { AssignHomeroomTeacherDto } from './dto/assign-homeroom-teacher.dto';
import { AssignTeacherDto } from '../teaching/dto/assign-teacher.dto';
import { Role } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { ClassesService } from 'src/classes/classes.service';
import { TeachingService } from 'src/teaching/teaching.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly classesService: ClassesService,
    private readonly teachingService: TeachingService,
  ) {}

  createStudent(dto) {
    return this.userService.createStudent(dto);
  }

  createTeacher(dto) {
    return this.userService.createTeacher(dto);
  }

  resetUserPassword(userId: number, newPassword: string) {
    return this.userService.resetPassword(userId, newPassword);
  }

  changeUserRole(userId: number, newRole: Role) {
    return this.userService.changeRole(userId, newRole);
  }

  createCLass(dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  updateClass(id: number, dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  deleteClass(id: number) {
    return this.classesService.delete(id);
  }

  assignHomeroomTeacher(dto: AssignHomeroomTeacherDto) {
    return this.classesService.assignHomeroomTeacher(dto);
  }

  moveStudent(dto: MoveStudentDto) {
    return this.classesService.moveStudent(dto);
  }

  removeStudentFromClass(studentId: number) {
    return this.classesService.removeStudent(studentId);
  }

  assignTeacher(dto: AssignTeacherDto) {
    return this.teachingService.assignTeacher(dto);
  }

  unassignTeacher(id: number) {
    return this.teachingService.unassign(id);
  }
}
