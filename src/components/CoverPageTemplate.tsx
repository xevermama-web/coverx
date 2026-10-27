import { forwardRef } from 'react';
import type { CoverPageData } from '../types';

interface Props {
  data: CoverPageData;
  logoSrc: string;
}

export const CoverPageTemplate = forwardRef<HTMLDivElement, Props>(
  ({ data, logoSrc }, ref) => {
    const universityFontSize = data.universityName.length > 55 ? 23 : data.universityName.length > 36 ? 26 : 30;
    return (
      <div ref={ref} className="document-page">
        <div className="document-border-first">
          <div className="document-border-second">
            <div className="document-border-third">
              <div className="document-top">
                <div className="document-logo" aria-label="University logo">
                  <img src={logoSrc} alt="" />
                </div>
                <h1 className="document-university" style={{ fontSize: universityFontSize }}>
                  {data.universityName}
                </h1>
                <h2 className="document-type">{data.assignmentType}</h2>
                <div className="document-course">
                  <p>Course Code: {data.courseCode}</p>
                  <p>Course Title: {data.courseTitle}</p>
                </div>
                {data.includeTitle && <p className="document-assignment-title">Title: {data.assignmentTitle}</p>}
              </div>
              <div className="document-fill" />
              <div className="document-parties">
                <div className="document-party">
                  <p className="document-party-heading">{data.submittedByLabel}</p>
                  <div className="document-party-details">
                    <strong>{data.studentName}</strong>
                    <span>Batch: {data.batch}</span>
                    <span>ID: {data.studentId}</span>
                    <span>{data.studentDepartment}</span>
                  </div>
                </div>
                <div className="document-party">
                  <p className="document-party-heading">{data.submittedToLabel}</p>
                  <div className="document-party-details">
                    <strong>{data.teacherName}</strong>
                    <span>{data.teacherDesignation}</span>
                    <span>{data.teacherDepartment}</span>
                    <span>{data.teacherUniversity}</span>
                  </div>
                </div>
              </div>
              <div className="document-date">Submission Date: {data.submissionDate}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
CoverPageTemplate.displayName = 'CoverPageTemplate';
