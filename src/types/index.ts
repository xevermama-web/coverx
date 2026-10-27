export interface CoverPageData {
  universityName: string;
  assignmentType: string;
  courseCode: string;
  courseTitle: string;
  assignmentTitle: string;
  includeTitle: boolean;
  submittedByLabel: string;
  studentName: string;
  batch: string;
  studentId: string;
  studentDepartment: string;
  submittedToLabel: string;
  teacherName: string;
  teacherDesignation: string;
  teacherDepartment: string;
  teacherUniversity: string;
  submissionDate: string;
}

export type Theme = 'dark' | 'light';
