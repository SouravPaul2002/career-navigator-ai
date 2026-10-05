import React, { useState } from 'react';

interface ResumeUploadProps {
  onUploadComplete: (resumeData: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check if file type is supported
      if (!selectedFile.type.match('application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        setUploadError('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setUploadError('File size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Simulating API call to backend
      // In a real application, you would send the file to your backend API
      const formData = new FormData();
      formData.append('resume', file);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response data that would come from the backend API
      const mockApiResponse = {
        skills: [
          { skill: 'JavaScript', category: 'Technical', proficiency: 'Expert' },
          { skill: 'TypeScript', category: 'Technical', proficiency: 'Advanced' },
          { skill: 'React', category: 'Technical', proficiency: 'Expert' },
          { skill: 'Node.js', category: 'Technical', proficiency: 'Intermediate' },
          { skill: 'Communication', category: 'Soft Skill', proficiency: 'Advanced' },
          { skill: 'Leadership', category: 'Soft Skill', proficiency: 'Intermediate' },
          { skill: 'Problem Solving', category: 'Soft Skill', proficiency: 'Expert' },
          { skill: 'Project Management', category: 'Soft Skill', proficiency: 'Intermediate' },
        ],
        completionPercentage: 78,
        feedback: [
          'Your resume has a strong technical skill section',
          'Consider adding more quantifiable achievements in your work experience',
          'Your summary could better highlight your key accomplishments',
          'Consider adding a certifications section to strengthen your profile'
        ],
        summary: 'Experienced software engineer with expertise in modern web technologies, specializing in building responsive and user-friendly applications. Proven track record of leading successful projects and mentoring team members.'
      };

      onUploadComplete(mockApiResponse);
    } catch (error) {
      setUploadError('Failed to upload and process the resume. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="resume-upload-container">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title h5 mb-3">Upload Your Resume to Get Started</h2>
          <p className="text-muted mb-4">Upload your resume in PDF, DOC, or DOCX format for instant analysis</p>
          
          <div 
            className={`upload-area border rounded text-center mb-3 ${file ? 'border-success' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
                setUploadError(null);
              }
            }}
            style={{padding:"15px"}}
          >
            <div className="mb-3">
              <i className="bi bi-cloud-upload display-5 text-muted"></i>
            </div>
            
            {!file ? (
              <>
                <p className="mb-2 p-4">Drag & drop your resume here or select file</p>
                {/* <p className="text-muted small mb-3">or</p> */}
                {/* <label htmlFor="resume-upload" className="btn btn-outline-primary"> */}
                  
                {/* </label> */}
                <input 
                  id="resume-upload"
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  className="d-none" 
                  onChange={handleFileChange}
                />
              </>
            ) : (
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-start">
                  <p className="mb-1"><strong>{file.name}</strong></p>
                  <p className="text-muted small mb-0">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          
          {uploadError && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {uploadError}
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setUploadError(null)}></button>
            </div>
          )}
          
          <button 
            className="btn btn-primary w-100" 
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              'Upload & Analyze Resume'
            )}
          </button>
          
          <div className="mt-3">
            <small className="text-muted">
              Supported formats: PDF, DOC, DOCX | Max size: 5 MB
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;