import React from 'react';

interface FeedbackSectionProps {
  feedback: string[];
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ feedback }) => {
  return (
    <div className="feedback-section">
      <h2 className="h5 mb-3">Resume Feedback</h2>
      
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h3 className="h6 fw-bold mb-3">AI-Powered Suggestions</h3>
          
          {feedback.length > 0 ? (
            <ul className="list-group list-group-flush">
              {feedback.map((item, index) => (
                <li key={index} className="list-group-item border-0 px-0">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0 me-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '32px', height: '32px' }}>
                        <i className="bi bi-lightbulb"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-0">{item}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No feedback generated yet. Upload your resume to receive suggestions.</p>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="h6 fw-bold mb-3">Top Improvement Areas</h3>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-light text-dark">Quantify Achievements</span>
              <span className="badge bg-light text-dark">Keywords Optimization</span>
              <span className="badge bg-light text-dark">Summary Enhancement</span>
              <span className="badge bg-light text-dark">Skills Section</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;