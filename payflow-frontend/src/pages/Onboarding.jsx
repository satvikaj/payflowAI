import React, { useState } from 'react';
import './Onboarding.css';

export default function Onboarding() {
    const [formData, setFormData] = useState({
        fullName: '',
        department: '',
        role: '',
        email: '',
        phone: '',
        address: '',
        joiningDate: '',
        hasExperience: 'No',
        experienceYears: '',
        previousRole: '',
        previousCompany: '',
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/employees/onboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Candidate onboarded successfully!');
                setFormData({
                    fullName: '',
                    department: '',
                    role: '',
                    email: '',
                    phone: '',
                    address: '',
                    joiningDate: '',
                    hasExperience: 'No',
                    experienceYears: '',
                    previousRole: '',
                    previousCompany: '',
                });
            } else {
                alert('Failed to onboard candidate.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong.');
        }
    };


    return (
        <div className="onboarding-form-container">
            <h2>Candidate Onboarding</h2>
            <form className="onboarding-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <label>Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <label>Department</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <label>Role</label>
                    <input type="text" name="role" value={formData.role} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <label>Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <label>Joining Date</label>
                    <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
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
                        <div className="form-row">
                            <label>Years of Experience</label>
                            <input
                                type="number"
                                name="experienceYears"
                                value={formData.experienceYears}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Previous Role</label>
                            <input type="text" name="previousRole" value={formData.previousRole} onChange={handleChange} required />
                        </div>
                        <div className="form-row">
                            <label>Previous Company Name</label>
                            <input type="text" name="previousCompany" value={formData.previousCompany} onChange={handleChange} required />
                        </div>
                    </>
                )}

                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </div>
    );
}
