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

  // createStudent(dto: CreateStudentDto) {
  //   return this.repo.createStudent(dto);
  // }

  // createTeacher(dto: CreateTeacherDto) {
  //   return this.repo.createTeacher(dto);
  // }

  // createClass(dto: CreateClassDto) {
  //   return this.repo.createClass(dto);
  // }

  // createSubject(dto: CreateSubjectDto) {
  //   return this.repo.createSubject(dto);
  // }

  // moveStudent(dto: MoveStudentDto) {
  //   return this.repo.moveStudent(dto);
  // }

  // updateClass(classId: number, dto: UpdateClassDto) {
  //   return this.repo.updateClass(classId, dto);
  // }

  // assignHomeroomTeacher(dto: AssignHomeroomTeacherDto) {
  //   return this.repo.assignHomeroomTeacher(dto);
  // }

  // assignTeacher(dto: AssignTeacherDto) {
  //   return this.repo.assignTeacherToClass(dto);
  // }

  // unassignTeacher(teachingAssignmentId: number) {
  //   return this.repo.unassignTeacher(teachingAssignmentId);
  // }

  // async deleteUser(userId: number) {
  //   await this.repo.deleteUser(userId);

  //   return { message: 'User deleted successfully' };
  // }

  // findAllUsers() {
  //   return this.repo.findAllUsers();
  // }

  // findUsersByEmail(email: string) {
  //   return this.repo.findUserByEmail(email);
  // }

  // findAllStudents() {
  //   return this.repo.findAllStudents();
  // }

  // findAllTeachers() {
  //   return this.repo.findAllTeachers();
  // }

  // findAllClasses() {
  //   return this.repo.findAllClasses();
  // }

  // findTeacherBySubject(subjectName: string) {
  //   return this.repo.findTeacherBySubject(subjectName);
  // }

  // removeStudentFromClass(studentId: number) {
  //   return this.repo.removeStudentFromClass(studentId);
  // }

  // updateStudent(studentId: number, dto: UpdateStudentDto) {
  //   return this.repo.updateStudent(studentId, dto);
  // }

  // updateTeacher(teacherId: number, dto: UpdateTeacherDto) {
  //   return this.repo.updateTeacher(teacherId, dto);
  // }

  // resetPassword(userId: number, newPassword: string) {
  //   return this.repo.resetPassword(userId, newPassword);
  // }

  // restoreUser(userId: number) {
  //   return this.repo.restoreUser(userId);
  // }

  // changeUserRole(userId: number, newRole: Role) {
  //   return this.repo.changeUserRole(userId, newRole);
  // }

  // deleteClass(classId: number) {
  //   return this.repo.deleteClass(classId);
  // }

  // findAllAttendances() {
  //   return this.repo.findAllAttendances();
  // }

  // findAttendancesByFilter(dto: AttendanceFilterDto) {
  //   return this.repo.findAttendancesByFilter(dto);
  // }

  // createAttendance(dto: CreateAttendanceDto) {
  //   return this.repo.createAttendance(dto);
  // }

  // deleteAttendance(attendanceId: number) {
  //   return this.repo.deleteAttendance(attendanceId);
  // }

  // findAllAssignments() {
  //   return this.repo.findAllAssignments();
  // }

  // findAssignmentByFilter(dto: AssignmentFilterDto) {
  //   return this.repo.findAssignmentByFilter(dto);
  // }

  // deleteAssigment(assignmentId: number) {
  //   return this.repo.deleteAssigment(assignmentId);
  // }

  // findAllSubmissions() {
  //   return this.repo.findAllSubmissions();
  // }

  // findSubmissionByFilter(dto: SubmissionFilterDto) {
  //   return this.repo.findSubmissionByFilter(dto);
  // }

  // deleteSubmission(submissionId: number) {
  //   return this.repo.deleteSubmission(submissionId);
  // }

  // updateAttendance(attendanceId: number, dto: UpdateAttendanceDto) {
  //   return this.repo.updateAttendance(attendanceId, dto);
  // }

  // createAssignment(dto: CreateAssignmentDto) {
  //   return this.repo.createAssignment(dto);
  // }

  // updateAssignment(assignmentId: number, dto: UpdateAssignmentDto) {
  //   return this.repo.updateAssignment(assignmentId, dto);
  // }

  // updateSubmissionScore(submissionId: number, dto: UpdateSubmissionScoreDto) {
  //   return this.repo.updateSubmissionScore(submissionId, dto);
  // }

  // createSubmission(dto: CreateSubmissionDto) {
  //   return this.repo.createSubmission(dto);
  // }
}
