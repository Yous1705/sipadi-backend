import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassesRepository } from './classes.repository';
import { AssignHomeroomTeacherDto } from './dto/assign-homeroom-teacher.dto';
import { Role } from '@prisma/client';
import { MoveStudentDto } from './dto/move-student.dto';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class ClassesService {
  constructor(
    private readonly repo: ClassesRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async create(dto: CreateClassDto) {
    const exist = await this.repo.findByNameAndYear(dto.name, dto.year);

    if (exist) {
      throw new BadRequestException('Class already exist');
    }

    return this.repo.create(dto);
  }

  async update(classId: number, dto: UpdateClassDto) {
    const classes = await this.repo.findById(classId);

    if (!classes) {
      throw new BadRequestException('Class not found');
    }
    return this.repo.update(classId, dto);
  }

  async assignHomeroomTeacher(dto: AssignHomeroomTeacherDto) {
    const teacher = await this.userRepo.findById(dto.teacherId);
    if (!teacher || teacher.role !== Role.TEACHER) {
      throw new BadRequestException('User is not a teacher');
    }

    const classes = await this.repo.findActiveById(dto.classId);
    if (!classes) {
      throw new BadRequestException('Class not found or inactive');
    }

    const conflic = await this.userRepo['prisma'].class.findFirst({
      where: {
        homeroomTeacherId: dto.teacherId,
        year: classes.year,
        isActive: true,
      },
    });

    if (conflic) {
      throw new BadRequestException('Homeroom teacher already assigned');
    }
    return this.repo.assignHomeroomTeacher(dto.classId, dto.teacherId);
  }

  async moveStudent(dto: MoveStudentDto) {
    const student = await this.userRepo.findById(dto.studentId);
    if (!student || student.role !== Role.STUDENT) {
      throw new BadRequestException('User is not a student');
    }

    const targetClass = await this.repo.findActiveById(dto.classId);
    if (!targetClass) {
      throw new BadRequestException('Class not found or inactive');
    }

    return this.userRepo.update(dto.studentId, {
      class: { connect: { id: dto.classId } },
    });
  }

  async removeStudent(studentId: number) {
    const student = await this.userRepo.findActiveById(studentId);
    if (!student || student.role !== Role.STUDENT) {
      throw new BadRequestException('User is not a student');
    }

    return this.userRepo.update(studentId, { class: { disconnect: true } });
  }

  async delete(classId: number) {
    const classes = await this.repo.findById(classId);
    if (!classes) {
      throw new BadRequestException('Class not found');
    }

    await this.userRepo['prisma'].user.updateMany({
      where: {
        classId,
      },
      data: {
        classId: null,
      },
    });

    return this.repo.deactivate(classId);
  }

  findAll() {
    return this.repo.findAll();
  }

  findById(id: number) {
    return this.repo.findById(id);
  }
  findByNameAndYear(name: string, year: number) {
    return this.repo.findByNameAndYear(name, year);
  }

  listForAdmin() {
    return this.repo.listForAdmin();
  }
}
