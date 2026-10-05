import React from 'react';


interface StatsSectionProps {
  skillsCount?: number;
  technicalSkills?: number;
  softSkills?: number;
  completionPercentage?: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({ 
  skillsCount = 0, 
  technicalSkills = 0, 
  softSkills = 0,
  completionPercentage = 0
}) => {
  const stats = [
    { title: 'Skills Identified', value: skillsCount.toString(), description: 'Total skills extracted from your resume' },
    { title: 'Completion', value: `${completionPercentage}%`, description: 'Resume completion progress' },
    { title: 'Technical Skills', value: technicalSkills.toString(), description: 'Number of technical skills found' },
    { title: 'Soft Skills', value: softSkills.toString(), description: 'Number of soft skills found' },
  ];

  return (
    <div>
      <h2 className="h5 mb-4">Resume Statistics</h2>
      
      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="card-title text-primary">{stat.value}</h3>
                <p className="card-text fw-bold">{stat.title}</p>
                <small className="text-muted">{stat.description}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="performance-section">
        <h3 className="h6 fw-bold mb-3">Resume Performance</h3>
        <div className="d-flex justify-content-between mb-2">
          <span>Keywords Match</span>
          <span>72%</span>
        </div>
        <div className="progress mb-4" style={{ height: '8px' }}>
          <div className="progress-bar bg-success" role="progressbar" style={{ width: '72%' }} aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}></div>
        </div>
        
        <div className="d-flex justify-content-between mb-2">
          <span>ATS Compatibility</span>
          <span>85%</span>
        </div>
        <div className="progress" style={{ height: '8px' }}>
          <div className="progress-bar bg-info" role="progressbar" style={{ width: '85%' }} aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}></div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;