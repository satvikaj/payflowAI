import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import PopupMessage from '../components/PopupMessage';
import Sidebar from '../components/Sidebar';
import '../components/Sidebar.css';
import './Onboarding.css';

// ...imports remain unchanged

export default function Onboarding() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: '',
        joiningDate: '',
        address: '',
        email: '',
        phone: '',
        emergencyContact: '',
        qualification: '',
        institution: '',
        graduationYear: '',
        specialization: '',
        department: '',
        role: '',
        position: '',
        hasExperience: 'No',
        experiences: [],
        certifications: '',
        skills: '',
        languages: '',
        managerId: ''
    });

    const [managers, setManagers] = useState([]);

    useEffect(() => {
        // Fetch all users and filter managers
        fetch('http://localhost:8080/api/admin/users')
            .then(res => res.json())
            .then(data => {
                const mgrs = data.filter(u => u.role && u.role.toUpperCase() === 'MANAGER');
                setManagers(mgrs);
            });
    }, []);

    // For experience form
    const [currentExperience, setCurrentExperience] = useState({ years: '', role: '', company: '', fromDate: '', toDate: '' });

    const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState('');
    const [importSuccess, setImportSuccess] = useState('');
    const [step, setStep] = useState(1);

    const steps = [
        'Personal & Contact',
        'Education',
        'Job & Skills'
    ];

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Experience form handlers
    const handleExperienceChange = (e) => {
        setCurrentExperience(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddExperience = (e) => {
        e.preventDefault();
        if (currentExperience.years && currentExperience.role && currentExperience.company && currentExperience.fromDate && currentExperience.toDate) {
            setFormData(prev => ({
                ...prev,
                experiences: [...prev.experiences, currentExperience]
            }));
            setCurrentExperience({ years: '', role: '', company: '', fromDate: '', toDate: '' });
        }
    };

    const handleRemoveExperience = (idx) => {
        setFormData(prev => ({
            ...prev,
            experiences: prev.experiences.filter((_, i) => i !== idx)
        }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (step < steps.length) setStep(step + 1);
    };

    const handleBack = (e) => {
        e.preventDefault();
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Only send experiences if hasExperience is Yes
        let experiences = [...formData.experiences];
        // If experience fields are filled but not yet added, add them automatically
        if (
            formData.hasExperience === 'Yes' &&
            currentExperience.role && currentExperience.company && currentExperience.years
        ) {
            experiences.push(currentExperience);
        }
        const payload = { ...formData, experiences };
        if (formData.hasExperience !== 'Yes') {
            payload.experiences = [];
        }
        try {
            const response = await fetch('http://localhost:8080/api/employee/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setPopup({ show: true, title: 'Onboarding Successful', message: 'Candidate onboarded successfully!', type: 'success' });
                setFormData({
                    fullName: '',
                    dob: '',
                    gender: '',
                    joiningDate: '',
                    address: '',
                    email: '',
                    phone: '',
                    emergencyContact: '',
                    qualification: '',
                    institution: '',
                    graduationYear: '',
                    specialization: '',
                    department: '',
                    role: '',
                    position: '',
                    hasExperience: 'No',
                    experiences: [],
                    certifications: '',
                    skills: '',
                    languages: ''
                });
                setCurrentExperience({ years: '', role: '', company: '' });
                setStep(1);
                setTimeout(() => {
                    setPopup(p => ({ ...p, show: false }));
                    navigate('/employee');
                }, 1800);
            } else {
                setPopup({ show: true, title: 'Onboarding Failed', message: 'Failed to onboard candidate.', type: 'error' });
            }
        } catch (error) {
            console.error('Error:', error);
            setPopup({ show: true, title: 'Server Error', message: 'Something went wrong.', type: 'error' });
        }
    };

    // Bulk Import Handler
    const requiredFields = [
        'fullName', 'email', 'phone', 'department', 'role', 'position', 'joiningDate', 'managerId'
    ];
    const allFields = [
        'fullName', 'dob', 'gender', 'joiningDate', 'address', 'email', 'phone', 'emergencyContact',
        'qualification', 'institution', 'graduationYear', 'specialization', 'department', 'role', 'position',
        'hasExperience', 'experiences', 'certifications', 'skills', 'languages', 'managerId'
    ];

    const handleImportCSV = (e) => {
        setImportError('');
        setImportSuccess('');
        const file = e.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const employees = results.data;
                // Validate required fields
                for (let i = 0; i < employees.length; i++) {
                    for (let field of requiredFields) {
                        if (!employees[i][field] || employees[i][field].trim() === '') {
                            setImportError(`Row ${i + 2}: Missing required field '${field}'`);
                            return;
                        }
                    }
                }
                setImportLoading(true);
                let successCount = 0;
                let failCount = 0;
                for (let i = 0; i < employees.length; i++) {
                    // Prepare payload, convert hasExperience and experiences
                    let emp = { ...employees[i] };
                    emp.hasExperience = emp.hasExperience === 'Yes' ? 'Yes' : 'No';
                    try {
                        if (emp.experiences) {
                            // Parse experiences as JSON if present
                            emp.experiences = JSON.parse(emp.experiences);
                        } else {
                            emp.experiences = [];
                        }
                    } catch {
                        emp.experiences = [];
                    }
                    // Send to backend
                    try {
                        const response = await fetch('http://localhost:8080/api/employee/onboard', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(emp),
                        });
                        if (response.ok) successCount++;
                        else failCount++;
                    } catch {
                        failCount++;
                    }
                }
                setImportLoading(false);
                setImportSuccess(`Imported ${successCount} employees. ${failCount > 0 ? failCount + ' failed.' : ''}`);
                if (successCount > 0) {
                    setTimeout(() => {
                        setImportModalOpen(false);
                        setPopup({ show: true, title: 'Bulk Import Successful', message: `Imported ${successCount} employees.`, type: 'success' });
                        setTimeout(() => {
                            setPopup(p => ({ ...p, show: false }));
                            navigate('/employee');
                        }, 1800);
                    }, 1200);
                }
            },
            error: (err) => setImportError('CSV Parse Error: ' + err.message)
        });
    };

    return (
        <div className="onboarding-page-layout">
            <Sidebar />
            {popup.show && (
                <PopupMessage title={popup.title} message={popup.message} type={popup.type} onClose={() => setPopup({ ...popup, show: false })} />
            )}
            <div className="onboarding-form-wrapper" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', color: '#222' }}>
                {/* Import Button */}
                <div style={{ position: 'absolute', top: 110, right: 40, zIndex: 10 }}>
                    <button
                        style={{ background: 'linear-gradient(90deg, #6366f1 60%, #818cf8 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #6366f133' }}
                        onClick={() => setImportModalOpen(true)}
                    >
                        + Import
                    </button>
                </div>
                {/* Import Modal */}
                {importModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'linear-gradient(120deg, #e0e7ff 60%, #f8fafc 100%)', borderRadius: 28, padding: '44px 38px 34px 38px', minWidth: 440, maxWidth: 520, boxShadow: '0 18px 56px 0 rgba(99,102,241,0.18), 0 2px 8px rgba(0,0,0,0.12)', border: '2.5px solid #6366f1', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <button
                                style={{ position: 'absolute', top: 18, right: 24, background: 'none', border: 'none', fontSize: 28, color: '#6366f1', cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}
                                onClick={() => { setImportModalOpen(false); setImportError(''); setImportSuccess(''); }}
                                aria-label="Close"
                            >✕</button>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                                <span style={{ background: 'linear-gradient(90deg, #6366f1 60%, #818cf8 100%)', color: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, boxShadow: '0 2px 8px #6366f122' }}>⇪</span>
                                <h2 style={{ color: '#4f46e5', fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>Import Bulk Employees</h2>
                            </div>
                            <div style={{ width: '100%', textAlign: 'left', marginBottom: 18, fontSize: '1rem', color: '#3730a3', background: '#fff', borderRadius: 14, border: '1.5px solid #6366f1', boxShadow: '0 2px 8px #6366f133', padding: '14px 18px' }}>
                                <div style={{ marginBottom: 6 }}><b>Upload a CSV file with the following columns:</b></div>
                                <div style={{ fontSize: '0.98rem', color: '#6366f1', marginBottom: 4 }}>{allFields.join(', ')}</div>
                                <div style={{ fontSize: '0.97rem', color: '#e53935' }}>Mandatory: {requiredFields.join(', ')}</div>
                            </div>
                            <label htmlFor="bulk-import-csv" style={{ marginBottom: 16, fontWeight: 700, color: '#6366f1', fontSize: '1.08rem', cursor: importLoading ? 'not-allowed' : 'pointer' }}>
                                Select CSV File
                            </label>
                            <input id="bulk-import-csv" type="file" accept=".csv" onChange={handleImportCSV} disabled={importLoading} style={{ marginBottom: 8, fontSize: '1rem', padding: '6px 0' }} />
                            {importLoading && <div style={{ color: '#6366f1', marginTop: 14, fontWeight: 700, fontSize: '1.08rem' }}>Importing...</div>}
                            {importError && <div style={{ color: '#e53935', marginTop: 14, fontWeight: 700, fontSize: '1.08rem', textAlign: 'center' }}>{importError}</div>}
                            {importSuccess && <div style={{ color: '#22c55e', marginTop: 14, fontWeight: 700, fontSize: '1.08rem', textAlign: 'center' }}>{importSuccess}</div>}
                        </div>
                    </div>
                )}
                <style>{`
                .onboarding-form-container {
                    background: linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%);
                    border-radius: 18px;
                    box-shadow: 0 8px 32px rgba(99,102,241,0.13), 0 2px 8px rgba(0,0,0,0.07);
                    padding: 36px 28px 28px 28px;
                    position: relative;
                }
                .onboarding-form-container h2 {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #4f46e5;
                    margin-bottom: 24px;
                    text-align: center;
                    letter-spacing: 0.01em;
                    text-shadow: 0 2px 8px rgba(99,102,241,0.08);
                }
                .stepper-bar-horizontal {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    margin-top: 0;
                    position: relative;
                }
                .stepper-step-horizontal {
                    display: flex;
                    align-items: center;
                    position: relative;
                }
                .stepper-circle-horizontal {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #e0e7ff;
                    color: #6366f1;
                    font-weight: 800;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px #6366f122;
                    border: 2px solid #a5b4fc;
                    z-index: 2;
                    transition: background 0.18s, color 0.18s, border 0.18s;
                }
                .stepper-step-horizontal.active .stepper-circle-horizontal {
                    background: linear-gradient(90deg, #6366f1 60%, #818cf8 100%);
                    color: #fff;
                    border: 2px solid #6366f1;
                    box-shadow: 0 4px 18px #6366f155;
                }
                .stepper-step-horizontal.done .stepper-circle-horizontal {
                    background: #22c55e;
                    color: #fff;
                    border: 2px solid #22c55e;
                }
                .stepper-label-horizontal {
                    margin-left: 8px;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #3730a3;
                    letter-spacing: 0.01em;
                }
                .stepper-step-horizontal.active .stepper-label-horizontal {
                    color: #6366f1;
                }
                .stepper-step-horizontal.done .stepper-label-horizontal {
                    color: #22c55e;
                }
                .stepper-line-horizontal {
                    width: 38px;
                    height: 4px;
                    background: linear-gradient(90deg, #a5b4fc 60%, #818cf8 100%);
                    border-radius: 2px;
                    margin-left: 8px;
                    margin-right: 8px;
                }
                .onboarding-form {
                    margin-top: 10px;
                }
                .form-section {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 12px rgba(99,102,241,0.07);
                    padding: 20px 16px 12px 16px;
                    margin-bottom: 18px;
                }
                .form-section h3 {
                    color: #6366f1;
                    font-size: 1.08rem;
                    font-weight: 800;
                    margin-bottom: 14px;
                }
                .form-row {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 10px;
                }
                .form-row label {
                    font-weight: 600;
                    color: #3730a3;
                    margin-bottom: 3px;
                }
                .form-row input, .form-row select, .form-row textarea {
                    padding: 8px 12px;
                    border-radius: 7px;
                    border: 1.5px solid #e0e7ff;
                    font-size: 1rem;
                    background: #f8fafc;
                    outline: none;
                    transition: border 0.18s;
                }
                .form-row input:focus, .form-row select:focus, .form-row textarea:focus {
                    border: 1.5px solid #6366f1;
                }
                .experience-entry-card {
                    background: #f3f4f6;
                    border: 1.5px solid #a5b4fc !important;
                    border-radius: 9px !important;
                    box-shadow: 0 2px 8px #6366f122;
                    padding: 12px 12px 8px 12px !important;
                    margin-bottom: 12px !important;
                }
                .add-exp-btn {
                    background: linear-gradient(90deg, #6366f1 60%, #818cf8 100%);
                    color: #fff;
                    border: none;
                    border-radius: 7px;
                    font-weight: 700;
                    padding: 6px 14px;
                    font-size: 1rem;
                    cursor: pointer;
                    margin-top: 6px;
                    margin-bottom: 6px;
                    box-shadow: 0 2px 8px #6366f133;
                    transition: background 0.18s, color 0.18s;
                }
                .add-exp-btn:disabled {
                    background: #e0e7ff;
                    color: #a1a1aa;
                    cursor: not-allowed;
                }
                .exp-list table {
                    background: #fff;
                    border-radius: 7px;
                    box-shadow: 0 1.5px 6px #6366f122;
                }
                .exp-list th, .exp-list td {
                    padding: 6px 8px;
                    border: 1px solid #e0e7ff;
                }
                .exp-list th {
                    background: #e0e7ff;
                    color: #3730a3;
                    font-weight: 700;
                }
                .remove-exp-btn {
                    background: #e53935;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    padding: 4px 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.18s, color 0.18s;
                }
                .remove-exp-btn:hover {
                    background: #b91c1c;
                }
                .stepper-btns {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 12px;
                }
                .stepper-btn {
                    background: #e0e7ff;
                    color: #3730a3;
                    border: none;
                    border-radius: 7px;
                    padding: 8px 22px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    box-shadow: 0 1.5px 6px #6366f122;
                    transition: background 0.18s, color 0.18s;
                }
                .stepper-btn.primary {
                    background: linear-gradient(90deg, #6366f1 60%, #818cf8 100%);
                    color: #fff;
                }
                .stepper-btn:disabled {
                    background: #f3f4f6;
                    color: #a1a1aa;
                    cursor: not-allowed;
                }
                `}</style>
                <div className="onboarding-form-container">
                    <h2>Candidate Onboarding</h2>
                    {/* Stepper Progress Bar */}
                    <div className="stepper-bar-horizontal">
                        {steps.map((label, idx) => (
                            <div key={label} className={`stepper-step-horizontal${step === idx + 1 ? ' active' : ''}${step > idx + 1 ? ' done' : ''}`}>
                                <div className="stepper-circle-horizontal">{step > idx + 1 ? '✓' : idx + 1}</div>
                                <div className="stepper-label-horizontal">{label}</div>
                                {idx < steps.length - 1 && <div className="stepper-line-horizontal" />}
                            </div>
                        ))}
                    </div>
                    <form className="onboarding-form" onSubmit={step === steps.length ? handleSubmit : handleNext}>
                        {step === 1 && (
                            <div className="form-section">
                                <h3>Personal & Contact Information</h3>
                                <div className="form-row">
                                    <label>Full Name <span style={{color:'red'}}>*</span></label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <label>Date of Birth</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                                </div>
                                <div className="form-row">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <label>Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} />
                                </div>
                                <div className="form-row">
                                    <label>Email <span style={{color:'red'}}>*</span></label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <label>Phone Number <span style={{color:'red'}}>*</span></label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <label>Emergency Contact</label>
                                    <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
                                </div>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="form-section">
                                <h3>Educational Details</h3>
                                <div className="form-row">
                                    <label>Highest Qualification</label>
                                    <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} />
                                </div>
                                <div className="form-row">
                                    <label>University/Institution</label>
                                    <input type="text" name="institution" value={formData.institution} onChange={handleChange} />
                                </div>
                                <div className="form-row">
                                    <label>Year of Graduation</label>
                                    <input type="text" name="graduationYear" value={formData.graduationYear} onChange={handleChange} />
                                </div>
                                <div className="form-row">
                                    <label>Specialization</label>
                                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} />
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <>
                                <div className="form-section">
                                    <h3>Work Experience</h3>
                                    <div className="form-row">
                                        <label>Department <span style={{color:'red'}}>*</span></label>
                                        <select name="department" value={formData.department} onChange={handleChange} required>
                                            <option value="">Select Department</option>
                                            <option value="HR">HR</option>
                                            <option value="Finance">Finance</option>
                                            <option value="IT">IT</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Role <span style={{color:'red'}}>*</span></label>
                                        <select name="role" value={formData.role} onChange={handleChange} required>
                                            <option value="">Select Role</option>
                                            <option value="SDE">SDE</option>
                                            <option value="Software Engineer">Software Engineer</option>
                                            <option value="Senior Software Engineer">Senior Software Engineer</option>
                                            <option value="Developer">Developer</option>
                                            <option value="Frontend Developer">Frontend Developer</option>
                                            <option value="Backend Developer">Backend Developer</option>
                                            <option value="Full Stack Developer">Full Stack Developer</option>
                                            <option value="DevOps">DevOps</option>
                                            <option value="DevOps Engineer">DevOps Engineer</option>
                                            <option value="QA">QA</option>
                                            <option value="QA Engineer">QA Engineer</option>
                                            <option value="Testing">Testing</option>
                                            <option value="Test Engineer">Test Engineer</option>
                                            <option value="Lead">Lead</option>
                                            <option value="Team Lead">Team Lead</option>
                                            <option value="Tech Lead">Tech Lead</option>
                                            <option value="Project Manager">Project Manager</option>
                                            <option value="Product Manager">Product Manager</option>
                                            <option value="Business Analyst">Business Analyst</option>
                                            <option value="Data Analyst">Data Analyst</option>
                                            <option value="Data Scientist">Data Scientist</option>
                                            <option value="UI/UX Designer">UI/UX Designer</option>
                                            <option value="System Administrator">System Administrator</option>
                                            <option value="Database Administrator">Database Administrator</option>
                                            <option value="Intern">Intern</option>
                                            <option value="HR">HR</option>
                                            <option value="HR Executive">HR Executive</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Finance Executive">Finance Executive</option>
                                            <option value="Sales Executive">Sales Executive</option>
                                            <option value="Marketing Executive">Marketing Executive</option>
                                            <option value="Operations Executive">Operations Executive</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Position Level <span style={{color:'red'}}>*</span></label>
                                        <select name="position" value={formData.position} onChange={handleChange} required>
                                            <option value="">Select Position Level</option>
                                            <option value="JUNIOR">Junior Employee (Entry Level)</option>
                                            <option value="SENIOR">Senior Employee</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Joining Date <span style={{color:'red'}}>*</span></label>
                                        <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
                                    </div>
                                    <div className="form-row">
                                        <label>Manager <span style={{color:'red'}}>*</span></label>
                                        <select name="managerId" value={formData.managerId} onChange={handleChange} required>
                                            <option value="">Select Manager</option>
                                            {managers.map(mgr => (
                                                <option key={mgr.id || mgr.username} value={mgr.id}>{mgr.name} ({mgr.username})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Has Previous Experience?</label>
                                        <select name="hasExperience" value={formData.hasExperience} onChange={handleChange}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>

                                    {formData.hasExperience === 'Yes' && (
                                        <>
                                            <div className="experience-entry-card" style={{border:'1px solid #ccc', borderRadius:8, padding:16, marginBottom:16}}>
                                                <h4 style={{marginBottom:8}}>Add Previous Experience</h4>
                                                <div className="form-row">
                                                    <label>Role</label>
                                                    <input type="text" name="role" value={currentExperience.role} onChange={handleExperienceChange} placeholder="e.g. Software Engineer" />
                                                </div>
                                                <div className="form-row">
                                                    <label>Company</label>
                                                    <input type="text" name="company" value={currentExperience.company} onChange={handleExperienceChange} placeholder="e.g. ABC Corp" />
                                                </div>
                                                <div className="form-row">
                                                    <label>Years Worked</label>
                                                    <input type="number" name="years" value={currentExperience.years} onChange={handleExperienceChange} min="0" step="0.1" placeholder="e.g. 2" />
                                                </div>
                                                <div className="form-row">
                                                    <label>From Date</label>
                                                    <input type="date" name="fromDate" value={currentExperience.fromDate} onChange={handleExperienceChange} />
                                                </div>
                                                <div className="form-row">
                                                    <label>To Date</label>
                                                    <input type="date" name="toDate" value={currentExperience.toDate} onChange={handleExperienceChange} />
                                                </div>
                                                <button
                                                    className="add-exp-btn"
                                                    style={{marginTop:8, marginBottom:8, background:'#1976d2', color:'#fff', border:'none', borderRadius:4, padding:'6px 16px', cursor:'pointer'}}
                                                    onClick={handleAddExperience}
                                                    type="button"
                                                    disabled={
                                                        !currentExperience.role ||
                                                        !currentExperience.company ||
                                                        !currentExperience.years ||
                                                        !currentExperience.fromDate ||
                                                        !currentExperience.toDate
                                                    }
                                                >
                                                    ➕ Add Experience
                                                </button>
                                            </div>
                                            <div className="exp-list">
                                                <b>Previous Experiences:</b>
                                                {formData.experiences.length === 0 ? (
                                                    <div style={{color:'#888', margin:'8px 0'}}>No experiences added yet.</div>
                                                ) : (
                                                    <table style={{width:'100%', borderCollapse:'collapse', marginBottom:8}}>
                                                        <thead>
                                                            <tr style={{background:'#f5f5f5'}}>
                                                                <th style={{padding:'6px', border:'1px solid #ddd'}}>Role</th>
                                                                <th style={{padding:'6px', border:'1px solid #ddd'}}>Company</th>
                                                                <th style={{padding:'6px', border:'1px solid #ddd'}}>Years</th>
                                                                <th style={{padding:'6px', border:'1px solid #ddd'}}>From</th>
                                                                <th style={{padding:'6px', border:'1px solid #ddd'}}>To</th>
                                                                <th style={{padding:'6px', border:'1px solid #ddd'}}>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {formData.experiences.map((exp, idx) => (
                                                                <tr key={idx}>
                                                                    <td style={{padding:'6px', border:'1px solid #ddd'}}>{exp.role}</td>
                                                                    <td style={{padding:'6px', border:'1px solid #ddd'}}>{exp.company}</td>
                                                                    <td style={{padding:'6px', border:'1px solid #ddd'}}>{exp.years}</td>
                                                                    <td style={{padding:'6px', border:'1px solid #ddd'}}>{exp.fromDate}</td>
                                                                    <td style={{padding:'6px', border:'1px solid #ddd'}}>{exp.toDate}</td>
                                                                    <td style={{padding:'6px', border:'1px solid #ddd'}}>
                                                                        <button type="button" className="remove-exp-btn" onClick={() => handleRemoveExperience(idx)} style={{background:'#e53935', color:'#fff', border:'none', borderRadius:4, padding:'4px 10px', cursor:'pointer'}}>🗑 Remove</button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="form-section">
                                    <h3>Certifications & Skills</h3>
                                    <div className="form-row">
                                        <label>List of Certifications</label>
                                        <input type="text" name="certifications" value={formData.certifications} onChange={handleChange} />
                                    </div>
                                    <div className="form-row">
                                        <label>Technical Skills</label>
                                        <input type="text" name="skills" value={formData.skills} onChange={handleChange} />
                                    </div>
                                    <div className="form-row">
                                        <label>Languages Known</label>
                                        <input type="text" name="languages" value={formData.languages} onChange={handleChange} />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="stepper-btns">
                            {step > 1 && (
                                <button className="stepper-btn" onClick={handleBack} type="button">Back</button>
                            )}
                            {step < steps.length && (
                                <button className="stepper-btn primary" type="submit">Next</button>
                            )}
                            {step === steps.length && (
                                <button className="stepper-btn primary" type="submit">Submit</button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}