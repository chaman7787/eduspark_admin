import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { adminAPI } from '../services/api';

export const Students = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [form, setForm] = useState({ name: '', email: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getStudents(1, 100); // Fetch up to 100 students
            if (response.success) {
                setStudents(response.students || []);
            } else {
                throw new Error(response.message || 'Failed to fetch students');
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setForm({ name: student.name || '', email: student.email || '' });
        setIsModalOpen(true);
    };

    const handleDelete = async (student) => {
        if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) {
            return;
        }

        try {
            setError(null);
            const response = await adminAPI.deleteStudent(student._id);
            
            if (response.success) {
                // Refresh the students list
                await fetchStudents();
            } else {
                throw new Error(response.message || 'Failed to delete student');
            }
        } catch (err) {
            console.error('Error deleting student:', err);
            alert(err.message || 'Failed to delete student');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
        setForm({ name: '', email: '' });
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const name = (form.name || '').trim();
        const email = (form.email || '').trim();
        
        if (!name) {
            alert('Name is required');
            return;
        }
        
        if (!email) {
            alert('Email is required');
            return;
        }

        if (!selectedStudent) {
            setIsModalOpen(false);
            return;
        }

        try {
            setSaving(true);
            setError(null);
            
            const response = await adminAPI.updateStudent(selectedStudent._id, {
                name,
                email
            });

            if (response.success) {
                // Refresh the students list
                await fetchStudents();
                handleCloseModal();
            } else {
                throw new Error(response.message || 'Failed to update student');
            }
        } catch (err) {
            console.error('Error updating student:', err);
            setError(err.message || 'Failed to update student');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <h2 className="mb-4">Students</h2>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error && students.length === 0) {
        return (
            <div className="container mt-4">
                <h2 className="mb-4">Students</h2>
                <div className="alert alert-danger" role="alert">
                    <h5 className="alert-heading">Error Loading Students</h5>
                    <p>{error}</p>
                    <button className="btn btn-danger" onClick={fetchStudents}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Students</h2>
                <button className="btn btn-primary" onClick={fetchStudents}>
                    Refresh
                </button>
            </div>
            
            {error && (
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email Address</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center">No students found</td>
                        </tr>
                    ) : (
                        students.map(st => (
                            <tr key={st._id}>
                                <td>{st.name || 'N/A'}</td>
                                <td>{st.email}</td>
                                <td>
                                    <span className={`badge ${st.isVerified ? 'bg-success' : 'bg-warning'}`}>
                                        {st.isVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        onClick={() => handleEdit(st)} 
                                        className="btn btn-primary btn-sm me-2"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(st)} 
                                        className="btn btn-danger btn-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal for Edit */}
            {isModalOpen && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Student</h5>
                                    <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
                                </div>
                                <div className="modal-body">
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input 
                                                name="name" 
                                                value={form.name} 
                                                onChange={handleChange} 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Full name"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input 
                                                name="email" 
                                                value={form.email} 
                                                onChange={handleChange} 
                                                type="email" 
                                                className="form-control" 
                                                placeholder="Email address"
                                                required
                                            />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={handleCloseModal}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save changes'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
