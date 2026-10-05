import React from 'react';

interface CompletionMeterProps {
  percentage: number;
}

const CompletionMeter: React.FC<CompletionMeterProps> = ({ percentage }) => {
  let progressBarClass = 'bg-success';
  if (percentage < 50) {
    progressBarClass = 'bg-danger';
  } else if (percentage < 75) {
    progressBarClass = 'bg-warning';
  }

  return (
    <div className="completion-meter-container">
      <h2 className="h5 mb-3">Resume Completion</h2>
      
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center">
          <div className="mb-3">
            <div className="display-4 fw-bold text-primary">{percentage}%</div>
            <p className="text-muted mb-0">Your resume is {percentage < 50 ? 'incomplete' : percentage < 75 ? 'partially complete' : 'well completed'}</p>
          </div>
          
          <div className="progress mb-2" style={{ height: '20px' }}>
            <div 
              className={`progress-bar ${progressBarClass}`} 
              role="progressbar" 
              style={{ width: `${percentage}%` }}
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {percentage}%
            </div>
          </div>
          
          <div className="d-flex justify-content-between small text-muted">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="h6 mb-3">Completion Breakdown</h3>
        <ul className="list-group">
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Contact Information
            <span className="badge bg-success rounded-pill">✓</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Professional Summary
            <span className="badge bg-success rounded-pill">✓</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Work Experience
            <span className="badge bg-success rounded-pill">✓</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Education
            <span className="badge bg-success rounded-pill">✓</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Skills
            <span className="badge bg-success rounded-pill">✓</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Certifications
            <span className="badge bg-warning rounded-pill">Missing</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Projects
            <span className="badge bg-warning rounded-pill">Missing</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CompletionMeter;