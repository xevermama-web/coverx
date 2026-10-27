import { useRef, useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Building2, GraduationCap, ImagePlus, LoaderCircle, UserRoundCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Input } from './ui/Input';
import type { CoverPageData } from '../types';

function LogoUploader() {
  const { logoSrc, logoReady, logoIsCustom, setLogoFromFile } = useAppContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Permit reselecting the same file after a failed attempt.
    event.target.value = '';
    if (!file) return;
    setFeedback('');
    setUploading(true);
    try {
      await setLogoFromFile(file);
      setFeedback('Logo saved on this browser.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Logo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="logo-uploader">
      <div className="logo-thumbnail" aria-label="Current university logo">
        <img src={logoSrc} alt="Current university logo" />
      </div>
      <div className="logo-upload-content">
        <strong>University logo</strong>
        <span>{logoIsCustom ? 'Your selected logo' : 'Default university logo'}</span>
        <button type="button" className="upload-action" onClick={() => inputRef.current?.click()} disabled={!logoReady || uploading}>
          {uploading ? <LoaderCircle size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading ? 'Saving logo…' : logoIsCustom ? 'Change logo' : 'Upload logo'}
        </button>
        <input className="visually-hidden" ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleUpload} aria-label="Upload university logo" />
      </div>
      {feedback && <p className="logo-feedback" role="status">{feedback}</p>}
    </div>
  );
}

export function InputForm() {
  const { data, updateField, setData } = useAppContext();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField(event.target.name as keyof CoverPageData, event.target.value);
  };

  return (
    <div className="form-sections">
      <section className="form-section">
        <div className="section-heading"><span className="section-icon"><Building2 size={16} /></span><h3>University</h3></div>
        <div className="field-grid">
          <div className="field-wide"><LogoUploader /></div>
          <Input label="University name" name="universityName" value={data.universityName} onChange={handleChange} containerClassName="field-wide" placeholder="Your university name" maxLength={110} />
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading"><span className="section-icon"><BookOpen size={16} /></span><h3>Course &amp; report</h3></div>
        <div className="field-grid">
          <Input label="Report type" name="assignmentType" value={data.assignmentType} onChange={handleChange} placeholder="e.g. Lab Report - 01" />
          <Input label="Course code" name="courseCode" value={data.courseCode} onChange={handleChange} placeholder="e.g. 0611-3110" />
          <Input label="Course title" name="courseTitle" required value={data.courseTitle} onChange={handleChange} placeholder="Enter course title" containerClassName="field-wide" />
          <div className="field-wide optional-panel">
            <label htmlFor="include-title" className="optional-toggle-row">
              <span className="toggle-copy"><strong>Include title</strong><small>Optional · Show title on cover</small></span>
              <input id="include-title" type="checkbox" role="switch" checked={data.includeTitle}
                onChange={(event) => setData((previous) => ({ ...previous, includeTitle: event.target.checked }))} />
              <span className="toggle-track" aria-hidden="true"><span className="toggle-thumb" /></span>
            </label>
            <AnimatePresence initial={false}>
              {data.includeTitle && (
                <motion.div className="optional-field" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .2 }}>
                  <Input label="Title" name="assignmentTitle" value={data.assignmentTitle} onChange={handleChange} placeholder="Enter report or assignment title" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Input label="Submission date" name="submissionDate" value={data.submissionDate} onChange={handleChange} placeholder="DD-MM-YYYY" containerClassName="field-wide" />
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading"><span className="section-icon"><GraduationCap size={17} /></span><h3>Submitted by</h3></div>
        <div className="field-grid">
          <Input label="Section heading" name="submittedByLabel" value={data.submittedByLabel} onChange={handleChange} />
          <Input label="Student name" name="studentName" value={data.studentName} onChange={handleChange} />
          <Input label="Batch" name="batch" value={data.batch} onChange={handleChange} />
          <Input label="Student ID" name="studentId" value={data.studentId} onChange={handleChange} />
          <Input label="Department" name="studentDepartment" value={data.studentDepartment} onChange={handleChange} containerClassName="field-wide" />
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading"><span className="section-icon"><UserRoundCheck size={16} /></span><h3>Submitted to</h3></div>
        <div className="field-grid">
          <Input label="Section heading" name="submittedToLabel" value={data.submittedToLabel} onChange={handleChange} />
          <Input label="Teacher name" name="teacherName" value={data.teacherName} onChange={handleChange} />
          <Input label="Designation" name="teacherDesignation" value={data.teacherDesignation} onChange={handleChange} />
          <Input label="Department" name="teacherDepartment" value={data.teacherDepartment} onChange={handleChange} />
          <Input label="University / institution" name="teacherUniversity" value={data.teacherUniversity} onChange={handleChange} containerClassName="field-wide" />
        </div>
      </section>
    </div>
  );
}
