import { Injectable } from '@nestjs/common';
import { AssignmentStatus, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardRaw() {
    const now = new Date();

    const [
      userGrouped,
      classTotal,
      classActive,
      subjects,
      teachingAssignments,
      assignmentGrouped,
      activeSessions,
      pendingGrading,
      classesWithoutHomeroom,
      upcomingAttendanceSessions,
      recentAssignments,
    ] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
        where: { isActive: true },
      }),
      this.prisma.class.count(),
      this.prisma.class.count({ where: { isActive: true } }),
      this.prisma.subject.count(),
      this.prisma.teachingAssigment.count(),
      this.prisma.assignment.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { deletedAt: null },
      }),
      this.prisma.attendanceSession.count({
        where: {
          isActive: true,
          openAt: { lte: now },
          closeAt: { gte: now },
        },
      }),
      this.prisma.submission.count({
        where: {
          score: null,
          assignment: { deletedAt: null },
        },
      }),
      this.prisma.class.findMany({
        where: { isActive: true, homeroomTeacherId: null },
        select: { id: true, name: true, year: true },
        orderBy: [{ year: 'desc' }, { name: 'asc' }],
        take: 10,
      }),
      this.prisma.attendanceSession.findMany({
        where: { isActive: true, closeAt: { gte: now } },
        orderBy: { closeAt: 'asc' },
        take: 5,
        select: {
          id: true,
          name: true,
          openAt: true,
          closeAt: true,
          teachingAssigment: {
            select: {
              id: true,
              class: { select: { id: true, name: true, year: true } },
              subject: { select: { id: true, name: true } },
              teacher: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.assignment.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          dueDate: true,
          status: true,
          createdAt: true,
          teachingAssigment: {
            select: {
              id: true,
              class: { select: { id: true, name: true, year: true } },
              subject: { select: { id: true, name: true } },
              teacher: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return {
      now,
      userGrouped,
      classTotal,
      classActive,
      subjects,
      teachingAssignments,
      assignmentGrouped,
      activeSessions,
      pendingGrading,
      classesWithoutHomeroom,
      upcomingAttendanceSessions,
      recentAssignments,
    };
  }

  static mapDashboard(
    raw: Awaited<ReturnType<AdminRepository['getDashboardRaw']>>,
  ) {
    const userCounts = { total: 0, students: 0, teachers: 0, admins: 0 };

    for (const row of raw.userGrouped) {
      if (row.role === Role.STUDENT) userCounts.students = row._count._all;
      if (row.role === Role.TEACHER) userCounts.teachers = row._count._all;
      if (row.role === Role.ADMIN) userCounts.admins = row._count._all;
    }
    userCounts.total =
      userCounts.students + userCounts.teachers + userCounts.admins;

    const assignmentCounts: Record<AssignmentStatus, number> = {
      [AssignmentStatus.DRAFT]: 0,
      [AssignmentStatus.PUBLISHED]: 0,
      [AssignmentStatus.CLOSED]: 0,
    };
    for (const row of raw.assignmentGrouped) {
      assignmentCounts[row.status] = row._count._all;
    }
    const assignmentTotal =
      assignmentCounts.DRAFT +
      assignmentCounts.PUBLISHED +
      assignmentCounts.CLOSED;

    return {
      generatedAt: raw.now,
      counts: {
        users: userCounts,
        classes: { total: raw.classTotal, active: raw.classActive },
        subjects: raw.subjects,
        teachingAssignments: raw.teachingAssignments,
        assignments: {
          total: assignmentTotal,
          draft: assignmentCounts.DRAFT,
          published: assignmentCounts.PUBLISHED,
          closed: assignmentCounts.CLOSED,
        },
        attendanceSessions: { activeNow: raw.activeSessions },
        submissions: { pendingGrading: raw.pendingGrading },
      },
      highlights: {
        classesWithoutHomeroom: raw.classesWithoutHomeroom,
        upcomingAttendanceSessions: raw.upcomingAttendanceSessions,
        recentAssignments: raw.recentAssignments,
      },
    };
  }
}
