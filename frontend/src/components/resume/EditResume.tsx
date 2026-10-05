import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';


interface WorkExperience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  startDate: string;
  endDate: string;
}

const EditResume: React.FC = () => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    website: 'www.johndoe.com',
    location: 'New York, NY',
    summary: 'Experienced professional with 5+ years in software development. Expertise in React, TypeScript, and modern web technologies. Passionate about creating intuitive user experiences and solving complex problems.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML/CSS', 'UI/UX Design'],
  });

  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    {
      id: '1',
      position: 'Senior Software Engineer',
      company: 'Tech Company',
      startDate: '2021-01',
      endDate: 'Present',
      description: 'Led development of responsive web applications using React and TypeScript. Improved application performance by 30% through code optimization. Mentored junior developers and conducted code reviews.'
    },
    {
      id: '2',
      position: 'Software Developer',
      company: 'Startup Inc.',
      startDate: '2018-06',
      endDate: '2020-12',
      description: 'Developed and maintained multiple web applications. Collaborated with cross-functional teams to deliver features. Implemented CI/CD pipelines to improve deployment process.'
    }
  ]);

  const [educations, _setEducations] = useState<Education[]>([
    {
      id: '1',
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of Technology',
      startDate: '2014',
      endDate: '2018'
    }
  ]);

  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleAddWorkExperience = () => {
    const newWork: WorkExperience = {
      id: Date.now().toString(),
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setWorkExperiences([...workExperiences, newWork]);
  };

  const handleWorkChange = (id: string, field: keyof WorkExperience, value: string) => {
    setWorkExperiences(workExperiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleRemoveWork = (id: string) => {
    setWorkExperiences(workExperiences.filter(exp => exp.id !== id));
  };

  const handleSave = () => {
    console.log('Saving resume data:', { ...formData, workExperiences, educations });
    alert('Resume updated successfully!');
  };

  return (
    <Layout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Edit Resume</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        </div>

        <form className="edit-form">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">Personal Information</h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="website" className="form-label">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">Professional Summary</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <textarea
                  className="form-control"
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">Skills</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="badge bg-primary me-2 mb-2 d-inline-flex align-items-center">
                    {skill}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      aria-label="Remove"
                      onClick={() => handleRemoveSkill(skill)}
                    ></button>
                  </span>
                ))}
              </div>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={handleAddSkill}>
                  Add Skill
                </button>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">Work Experience</h3>
            </div>
            <div className="card-body">
              {workExperiences.map((exp) => (
                <div key={exp.id} className="work-experience-item mb-4 p-3 border rounded">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor={`position-${exp.id}`} className="form-label">Position</label>
                        <input
                          type="text"
                          className="form-control"
                          id={`position-${exp.id}`}
                          value={exp.position}
                          onChange={(e) => handleWorkChange(exp.id, 'position', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor={`company-${exp.id}`} className="form-label">Company</label>
                        <input
                          type="text"
                          className="form-control"
                          id={`company-${exp.id}`}
                          value={exp.company}
                          onChange={(e) => handleWorkChange(exp.id, 'company', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor={`startDate-${exp.id}`} className="form-label">Start Date</label>
                        <input
                          type="month"
                          className="form-control"
                          id={`startDate-${exp.id}`}
                          value={exp.startDate}
                          onChange={(e) => handleWorkChange(exp.id, 'startDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor={`endDate-${exp.id}`} className="form-label">End Date</label>
                        <input
                          type="month"
                          className="form-control"
                          id={`endDate-${exp.id}`}
                          value={exp.endDate}
                          onChange={(e) => handleWorkChange(exp.id, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor={`description-${exp.id}`} className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id={`description-${exp.id}`}
                      value={exp.description}
                      onChange={(e) => handleWorkChange(exp.id, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveWork(exp.id)}
                  >
                    Remove Experience
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleAddWorkExperience}
              >
                + Add Work Experience
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => window.history.back()}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditResume;