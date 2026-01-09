import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { adminAPI } from '../services/api';

export const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [form, setForm] = useState({ name: '', email: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getTeachers(1, 100); // Fetch up to 100 teachers
            if (response.success) {
                setTeachers(response.teachers || []);
            } else {
                throw new Error(response.message || 'Failed to fetch teachers');
            }
        } catch (err) {
            console.error('Error fetching teachers:', err);
            setError(err.message || 'Failed to load teachers');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setForm({ name: teacher.name || '', email: teacher.email || '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTeacher(null);
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

        if (!selectedTeacher) {
            setIsModalOpen(false);
            return;
        }

        try {
            setSaving(true);
            setError(null);
            
            const response = await adminAPI.updateTeacher(selectedTeacher._id, {
                name,
                email
            });

            if (response.success) {
                // Refresh the teachers list
                await fetchTeachers();
                handleCloseModal();
            } else {
                throw new Error(response.message || 'Failed to update teacher');
            }
        } catch (err) {
            console.error('Error updating teacher:', err);
            setError(err.message || 'Failed to update teacher');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (teacher) => {
        if (!window.confirm(`Are you sure you want to delete ${teacher.name}?`)) {
            return;
        }

        try {
            setError(null);
            const response = await adminAPI.deleteTeacher(teacher._id);
            
            if (response.success) {
                // Refresh the teachers list
                await fetchTeachers();
            } else {
                throw new Error(response.message || 'Failed to delete teacher');
            }
        } catch (err) {
            console.error('Error deleting teacher:', err);
            alert(err.message || 'Failed to delete teacher');
        }
    };

    const handleTogglePaidQuiz = async (teacherId, canCreatePaidQuiz) => {
        try {
            setSaving(true);
            setError(null);
            
            const response = await adminAPI.toggleTeacherPaidQuizPermission(teacherId, canCreatePaidQuiz);
            
            if (response.success) {
                // Refresh the teachers list
                await fetchTeachers();
            } else {
                throw new Error(response.message || 'Failed to update paid quiz permission');
            }
        } catch (err) {
            console.error('Error toggling paid quiz permission:', err);
            setError(err.message || 'Failed to update paid quiz permission');
            // Refresh to revert the UI state
            await fetchTeachers();
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <h2 className="mb-4">Teachers Directory</h2>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error && teachers.length === 0) {
        return (
            <div className="container mt-4">
                <h2 className="mb-4">Teachers Directory</h2>
                <div className="alert alert-danger" role="alert">
                    <h5 className="alert-heading">Error Loading Teachers</h5>
                    <p>{error}</p>
                    <button className="btn btn-danger" onClick={fetchTeachers}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Teachers Directory</h2>
                <button className="btn btn-primary" onClick={fetchTeachers}>
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
                        <th>Verification Status</th>
                        <th>Paid Quiz Permission</th>
                        <th>Total Earnings</th>
                        <th>Total Withdrawals</th>
                        <th>Available Balance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="text-center">No teachers found</td>
                        </tr>
                    ) : (
                        teachers.map((teacher) => {
                            const stats = teacher.financialStats || {};
                            return (
                                <tr key={teacher._id}>
                                    <td>{teacher.name || 'N/A'}</td>
                                    <td>{teacher.email}</td>
                                    <td>
                                        <span className={`badge ${
                                            teacher.teacherVerification?.status === 'approved' 
                                                ? 'bg-success' 
                                                : teacher.teacherVerification?.status === 'pending'
                                                ? 'bg-warning'
                                                : teacher.teacherVerification?.status === 'rejected'
                                                ? 'bg-danger'
                                                : 'bg-secondary'
                                        }`}>
                                            {teacher.teacherVerification?.status === 'approved' 
                                                ? 'Verified' 
                                                : teacher.teacherVerification?.status === 'pending'
                                                ? 'Pending'
                                                : teacher.teacherVerification?.status === 'rejected'
                                                ? 'Rejected'
                                                : 'Not Submitted'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id={`paidQuiz-${teacher._id}`}
                                                checked={teacher.canCreatePaidQuiz || false}
                                                onChange={(e) => handleTogglePaidQuiz(teacher._id, e.target.checked)}
                                                disabled={saving}
                                            />
                                            <label className="form-check-label" htmlFor={`paidQuiz-${teacher._id}`}>
                                                {teacher.canCreatePaidQuiz ? (
                                                    <span className="badge bg-success">Enabled</span>
                                                ) : (
                                                    <span className="badge bg-secondary">Disabled</span>
                                                )}
                                            </label>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-success fw-bold">
                                            ₹{stats.totalEarnings?.toLocaleString('en-IN') || '0'}
                                        </span>
                                        <br />
                                        <small className="text-muted">
                                            {stats.totalSales || 0} sales
                                        </small>
                                    </td>
                                    <td>
                                        <span className="text-info fw-bold">
                                            ₹{stats.totalWithdrawn?.toLocaleString('en-IN') || '0'}
                                        </span>
                                        {stats.pendingWithdrawals > 0 && (
                                            <>
                                                <br />
                                                <small className="text-warning">
                                                    ₹{stats.pendingWithdrawals?.toLocaleString('en-IN')} pending
                                                </small>
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        <span className="text-primary fw-bold">
                                            ₹{stats.availableBalance?.toLocaleString('en-IN') || '0'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleEdit(teacher)} 
                                            className="btn btn-primary btn-sm me-2"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(teacher)} 
                                            className="btn btn-danger btn-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Bootstrap-only modal for Edit */}
            {isModalOpen && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Teacher</h5>
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
    );
};
