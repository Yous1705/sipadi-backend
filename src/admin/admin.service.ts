import { Subject } from 'rxjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import * as bcrypt from 'bcryptjs';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { MoveStudentDto } from './dto/move-student.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AssignHomeroomTeacherDto } from './dto/assign-homeroom-teacher.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class AdminService {
  constructor(private readonly repo: AdminRepository) {}

  createStudent(dto: CreateStudentDto) {
    return this.repo.createStudent(dto);
  }

  createTeacher(dto: CreateTeacherDto) {
    return this.repo.createTeacher(dto);
  }

  createClass(dto: CreateClassDto) {
    return this.repo.createClass(dto);
  }

  createSubject(dto: CreateSubjectDto) {
    return this.repo.createSubject(dto);
  }

  moveStudent(dto: MoveStudentDto) {
    return this.repo.moveStudent(dto);
  }

  updateClass(classId: number, dto: UpdateClassDto) {
    return this.repo.updateClass(classId, dto);
  }

  assignHomeroomTeacher(dto: AssignHomeroomTeacherDto) {
    return this.repo.assignHomeroomTeacher(dto);
  }

  assignTeacher(dto: AssignTeacherDto) {
    return this.repo.assignTeacherToClass(dto);
  }

  unassignTeacher(teachingAssignmentId: number) {
    return this.repo.unassignTeacher(teachingAssignmentId);
  }

  async deleteUser(userId: number) {
    await this.repo.deleteUser(userId);

    return { message: 'User deleted successfully' };
  }

  findAllUsers() {
    return this.repo.findAllUsers();
  }

  findUsersByEmail(email: string) {
    return this.repo.findUserByEmail(email);
  }

  findAllStudents() {
    return this.repo.findAllStudents();
  }

  findAllTeachers() {
    return this.repo.findAllTeachers();
  }

  findAllClasses() {
    return this.repo.findAllClasses();
  }

  findTeacherBySubject(subjectName: string) {
    return this.repo.findTeacherBySubject(subjectName);
  }
}
