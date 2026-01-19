import { AttendanceSessionService } from './../attendance-session/attendance-session.service';
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
import { AdminRepository } from './admin.repository';
import { AttendanceService } from 'src/attendance/attendance.service';
import { UpdateAttendanceDto } from 'src/attendance/dto/update-attendance.dto';
import { CreateTeacherDto } from 'src/user/dto/create-teacher.dto';
import { CreateStudentDto } from 'src/user/dto/create-student.dto';
import { UpdateSubjectDto } from 'src/teaching/dto/update-subject.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly classesService: ClassesService,
    private readonly teachingService: TeachingService,
    private readonly attendanceSessionService: AttendanceSessionService,
    private readonly attendanceService: AttendanceService,
    private readonly repo: AdminRepository,
  ) {}

  // ===================== DASHBOARD =====================
  async getDashboard() {
    const raw = await this.repo.getDashboardRaw();
    return AdminRepository.mapDashboard(raw);
  }

  // ===================== USERS =====================
  createStudent(dto: CreateStudentDto) {
    return this.userService.createStudent(dto);
  }

  createTeacher(dto: CreateTeacherDto) {
    return this.userService.createTeacher(dto);
  }

  resetUserPassword(userId: number, newPassword: string) {
    return this.userService.resetPassword(userId, newPassword);
  }

  changeUserRole(userId: number, newRole: Role) {
    return this.userService.changeRole(userId, newRole);
  }

  findUserById(id: number) {
    return this.userService.findById(id);
  }

  findAllUsers() {
    return this.userService.findAll();
  }

  findUsersByRole(role: Role) {
    return this.userService.findAllByRole(role);
  }

  findUsersByClass(classId: number) {
    return this.userService.findByClass(classId);
  }

  listUsers(params?: { role?: Role; isActive?: boolean }) {
    return this.userService.listUsers(params);
  }

  // ============== CLASSES =====================
  findAllClasses() {
    return this.classesService.listForAdmin();
  }

  findClassById(id: number) {
    return this.classesService.findById(id);
  }

  findClassByNameAndYear(name: string, year: number) {
    return this.classesService.findByNameAndYear(name, year);
  }

  createClass(dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  createCLass(dto: CreateClassDto) {
    return this.createClass(dto);
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

  // ===================== TEACHING ASSIGNMENT =====================
  findAllTeachingAssignments() {
    return this.teachingService.findAll();
  }

  assignTeacher(dto: AssignTeacherDto) {
    return this.teachingService.assignTeacher(dto);
  }

  unassignTeacher(id: number) {
    return this.teachingService.unassign(id);
  }

  // ===================== SUBJECTS=====================
  createSubject(dto: CreateSubjectDto) {
    return this.teachingService.createSubject(dto);
  }

  updateSubject(id: number, dto: UpdateSubjectDto) {
    return this.teachingService.updateSubject(id, dto);
  }

  findAllSubject() {
    return this.teachingService.findAllSubject();
  }

  deleteSubject(id: number) {
    return this.teachingService.deleteSubject(id);
  }

  // ===================== ATTENDANCE SeSSION =====================
  closeAttendanceSession(attendanceSessionId: number, actorUserId: number) {
    return this.attendanceSessionService.close(
      attendanceSessionId,
      actorUserId,
    );
  }

  // ===================ATTENDANCE =====================
  getAttendances(query: any) {
    return this.attendanceService.getAllAttendances(query);
  }

  updateAttendance(id: number, dto: UpdateAttendanceDto) {
    return this.attendanceService.updateAttendance(id, dto);
  }
}
