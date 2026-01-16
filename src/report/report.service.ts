import { ForbiddenException, Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import * as ExcelJS from 'exceljs';
import { ReportRepository } from './report.repository';
import { AttendanceStatus } from '@prisma/client';
import { Response } from 'express';
@Injectable()
export class ReportService {
  constructor(private readonly repo: ReportRepository) {}

  async getGradeReport(teachingId: number, teacherId: number) {
    const teaching = await this.repo.getGradeReport(teachingId);

    if (!teaching || teaching.teacherId !== teacherId) {
      throw new ForbiddenException();
    }

    const totalAssignments = teaching.assignment.length;

    const studentsReport = teaching.class.students.map((student) => {
      const assignmentScores = teaching.assignment.map((assignment) => {
        const submission = assignment.submissions.find(
          (s) => s.studentId === student.id,
        );

        return {
          assignmentId: assignment.id,
          title: assignment.title,
          score: submission?.score ?? 0,
          submitted: !!submission,
        };
      });

      const totalScore = assignmentScores.reduce(
        (sum, a) => sum + (a.score ?? 0),
        0,
      );

      const average =
        totalAssignments > 0 ? Math.round(totalScore / totalAssignments) : null;

      return {
        studentId: student.id,
        studentName: student.name,
        className: teaching.class.name,
        assignments: assignmentScores,
        average,
      };
    });

    return {
      teachingId,
      className: teaching.class.name,
      assignments: teaching.assignment.map((a) => ({
        id: a.id,
        title: a.title,
      })),
      students: studentsReport,
    };
  }

  async getClassSummaryReport(classId: number, teacherId: number) {
    const classroom = await this.repo.getClassWithStudents(classId);

    if (!classroom || classroom.homeroomTeacherId !== teacherId) {
      throw new ForbiddenException();
    }

    const teachings = await this.repo.getTeachingAssignmentsByClass(classId);
    const attendances = await this.repo.getAttendancesByClass(classId);

    const subjects = teachings.map((t) => ({
      id: t.subject.id,
      name: t.subject.name,
    }));

    const studentMap = new Map<
      number,
      {
        studentId: number;
        name: string;
        grades: Map<number, number[]>;
        attendance: Record<AttendanceStatus, number>;
      }
    >();

    classroom.students.forEach((s) => {
      studentMap.set(s.id, {
        studentId: s.id,
        name: s.name,
        grades: new Map(),
        attendance: {
          HADIR: 0,
          IZIN: 0,
          SAKIT: 0,
          ALPHA: 0,
        },
      });
    });

    for (const teaching of teachings) {
      for (const assignment of teaching.assignment) {
        for (const submission of assignment.submissions) {
          if (submission.score === null) continue;

          const student = studentMap.get(submission.studentId);
          if (!student) continue;

          if (!student.grades.has(teaching.subjectId)) {
            student.grades.set(teaching.subjectId, []);
          }

          student.grades.get(teaching.subjectId)!.push(submission.score);
        }
      }
    }

    for (const att of attendances) {
      const student = studentMap.get(att.studentId);
      if (!student) continue;

      student.attendance[att.status]++;
    }

    const students = Array.from(studentMap.values()).map((s) => ({
      studentId: s.studentId,
      name: s.name,
      grades: subjects.map((sub) => {
        const scores = s.grades.get(sub.id) ?? [];
        const average =
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null;

        return {
          subjectId: sub.id,
          average,
        };
      }),
      attendance: s.attendance,
    }));

    const studentsWithAvg = students.map((s) => {
      const valid = s.grades
        .map((g) => g.average)
        .filter((v): v is number => v !== null);

      const overall =
        valid.length > 0
          ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
          : null;

      return {
        ...s,
        overallAverage: overall,
        overallGrade: toGrade(overall),
        rank: null as number | null,
      };
    });

    const ranked = studentsWithAvg
      .filter((s) => s.overallAverage !== null)
      .sort((a, b) => b.overallAverage! - a.overallAverage!);

    ranked.forEach((s, i) => {
      s.rank = i + 1;
    });

    studentsWithAvg.forEach((s) => {
      if (s.rank === undefined) s.rank = null;
    });

    const subjectsWithRating = subjects.map((sub) => {
      const values = studentsWithAvg
        .map((s) => s.grades.find((g) => g.subjectId === sub.id)?.average)
        .filter((v): v is number => v !== null);

      const avg =
        values.length > 0
          ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
          : null;

      return {
        ...sub,
        classAverage: avg,
        grade: toGrade(avg),
      };
    });

    return {
      classId,
      className: classroom.name,
      subjects: subjectsWithRating,
      students: studentsWithAvg,
    };
  }

  async exportClassReport(
    classId: number,
    teacherId: number,
    format: 'csv' | 'xlsx',
    res: Response,
  ) {
    const report = await this.getClassSummaryReport(classId, teacherId);

    if (format === 'csv') {
      return this.homeroomExportCsv(report, res);
    }

    if (format === 'xlsx') {
      return this.homeroomExportXlsx(report, res);
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Class Report');

    ws.addRow([
      'Nama',
      ...report.subjects.map((s) => s.name),
      'Average',
      'Rank',
      'Hadir',
      'Izin',
      'Sakit',
      'Alpha',
    ]);

    report.students.forEach((s) => {
      ws.addRow([
        s.name,
        ...report.subjects.map(
          (sub) => s.grades.find((g) => g.subjectId === sub.id)?.average ?? '',
        ),
        s.overallAverage ?? '',
        s.rank ?? '',
        s.attendance.HADIR,
        s.attendance.IZIN,
        s.attendance.SAKIT,
        s.attendance.ALPHA,
      ]);
    });

    ws.addRow([]);
    ws.addRow(['CLASS AVERAGE']);
    ws.addRow([
      '',
      ...report.subjects.map((s) => `${s.classAverage ?? '-'} (${s.grade})`),
    ]);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="class-report-${report.className}.xlsx"`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    await wb.xlsx.write(res);
    res.end();
  }
  //  ===== Helper ==========
  exportCsv(report: {
    className: string;
    assignments: { id: number; title: string }[];
    students: {
      studentName: string;
      className: string;
      assignments: { title: string; score: number | null }[];
      average: number | null;
    }[];
  }) {
    const headers = [
      'Nama',
      'Kelas',
      ...report.assignments.map((a) => a.title),
      'Rata-rata',
    ];

    const records = report.students.map((student) => {
      const scores = student.assignments.map((a) =>
        a.score !== null ? a.score : '',
      );

      return [
        student.studentName,
        student.className,
        ...scores,
        student.average ?? '',
      ];
    });

    const csv = stringify([headers, ...records]);

    return {
      filename: `laporan-nilai-${report.className}.csv`,
      mimeType: 'text/csv',
      content: csv,
    };
  }

  async exportExcel(report: {
    className: string;
    assignments: { id: number; title: string }[];
    students: {
      studentName: string;
      className: string;
      assignments: { title: string; score: number | null }[];
      average: number | null;
    }[];
  }) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Nilai');

    sheet.addRow([
      'Nama',
      'Kelas',
      ...report.assignments.map((a) => a.title),
      'Rata-rata',
    ]);

    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col) => {
      col.width = 20;
    });

    report.students.forEach((student) => {
      sheet.addRow([
        student.studentName,
        student.className,
        ...student.assignments.map((a) => a.score ?? ''),
        student.average ?? '',
      ]);
    });

    const totalColumns = 2 + report.assignments.length + 1;

    sheet.autoFilter = {
      from: 'A1',
      to: `${String.fromCharCode(64 + totalColumns)}1`,
    };

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      filename: `laporan-nilai-${report.className}.xlsx`,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      content: buffer,
    };
  }

  homeroomExportCsv(report, res) {
    const header = [
      'Nama',
      ...report.subjects.map((s) => s.name),
      'Average',
      'Rank',
      'Hadir',
      'Izin',
      'Sakit',
      'Alpha',
    ];

    const rows = report.students.map((s) => [
      s.name,
      ...report.subjects.map(
        (sub) => s.grades.find((g) => g.subjectId === sub.id)?.average ?? '',
      ),
      s.overallAverage ?? '',
      s.rank ?? '',
      s.attendance[AttendanceStatus.HADIR],
      s.attendance[AttendanceStatus.IZIN],
      s.attendance[AttendanceStatus.SAKIT],
      s.attendance[AttendanceStatus.ALPHA],
    ]);

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="class-report.csv"`,
    );
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }
  async homeroomExportXlsx(report: any, res) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Class Report');

    const header = [
      'Nama',
      ...report.subjects.map((s) => s.name),
      'Average',
      'Rank',
      'HADIR',
      'IZIN',
      'SAKIT',
      'ALPHA',
    ];

    sheet.addRow(header);

    report.students.forEach((s) => {
      sheet.addRow([
        s.name,
        ...report.subjects.map(
          (sub) => s.grades.find((g) => g.subjectId === sub.id)?.average ?? '',
        ),
        s.overallAverage ?? '',
        s.rank ?? '',
        s.attendance.HADIR,
        s.attendance.IZIN,
        s.attendance.SAKIT,
        s.attendance.ALPHA,
      ]);
    });

    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col) => {
      col.width = 15;
    });

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="class-report.xlsx"',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}

function toGrade(avg: number | null): 'A' | 'B' | 'C' | 'D' | null {
  if (avg === null) return null;
  if (avg >= 85) return 'A';
  if (avg >= 70) return 'B';
  if (avg >= 55) return 'C';
  return 'D';
}
