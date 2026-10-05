import React from 'react';

interface SkillsTableProps {
  skills: Array<{
    skill: string;
    category: string;
    proficiency: string;
  }>;
}

const SkillsTable: React.FC<SkillsTableProps> = ({ skills }) => {
  return (
    <div className="skills-table-container">
      <h2 className="h5 mb-3">Extracted Skills</h2>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-light">
            <tr>
              <th>Skill</th>
              <th>Category</th>
              {/* <th>Proficiency</th> */}
            </tr>
          </thead>
          <tbody>
            {skills.length > 0 ? (
              skills.map((skillItem, index) => (
                <tr key={index}>
                  <td><strong>{skillItem.skill}</strong></td>
                  <td>
                    <span className={`badge ${skillItem.category === 'Technical' ? 'bg-primary' : 'bg-success'}`}>
                      {skillItem.category}
                    </span>
                  </td>
                  {/* <td>
                    <span className={`badge ${skillItem.proficiency === 'Expert' ? 'bg-danger' : 
                      skillItem.proficiency === 'Advanced' ? 'bg-warning' : 
                      skillItem.proficiency === 'Intermediate' ? 'bg-info' : 'bg-secondary'}`}>
                      {skillItem.proficiency}
                    </span>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-muted">No skills extracted yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4">
        <h3 className="h6 mb-3">Skills Summary</h3>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="card-title text-primary">
                  {skills.filter(s => s.category === 'Technical').length}
                </h3>
                <p className="card-text fw-bold">Technical Skills</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="card-title text-success">
                  {skills.filter(s => s.category === 'Soft Skill').length}
                </h3>
                <p className="card-text fw-bold">Soft Skills</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsTable;