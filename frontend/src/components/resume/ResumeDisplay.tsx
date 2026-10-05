import React from 'react';


interface ResumeDisplayProps {
  summary?: string;
}

const ResumeDisplay: React.FC<ResumeDisplayProps> = ({ summary }) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h5 mb-0">Resume Summary</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary">Export PDF</button>
        </div>
      </div>
      
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <div className="resume-section mb-4">
            <h3 className="h5 border-bottom pb-1 mb-2">Professional Summary</h3>
            <p className="mb-0">
              {summary || 'Upload your resume to see the extracted summary here.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDisplay;