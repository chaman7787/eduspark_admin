import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { adminAPI } from '../services/api';

const API_BASE_URL = 'http://localhost:3002/api/verification';

const getToken = () => {
  const token = localStorage.getItem('adminToken');
  console.log('🔑 Admin Token:', token ? 'Token exists' : 'No token found');
  return token;
};

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    console.error('❌ No authentication token found!');
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const KYC = () => {
  const [activeTab, setActiveTab] = useState('teacher'); // 'teacher' or 'student'
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    fetchData();
  }, [activeTab, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if admin is logged in
      const token = getToken();
      if (!token) {
        setError('Admin authentication required. Please login again.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching verification data...');
      console.log('📋 Active Tab:', activeTab);
      console.log('🎯 Filter Status:', filterStatus);

      if (activeTab === 'teacher') {
        // First, try debug endpoint to see all teachers
        try {
          const debugResponse = await fetch(`${API_BASE_URL}/debug/teachers`, {
            headers: getAuthHeaders(),
          });
          const debugData = await debugResponse.json();
          console.log('🔍 Debug - All teachers:', debugData);
        } catch (debugErr) {
          console.warn('⚠️ Debug endpoint failed:', debugErr);
        }
        
        // Fetch pending teachers
        console.log('🔍 Fetching pending teachers from:', `${API_BASE_URL}/teacher/pending`);
        const pendingResponse = await fetch(`${API_BASE_URL}/teacher/pending`, {
          headers: getAuthHeaders(),
        });
        
        console.log('📥 Pending response status:', pendingResponse.status);
        const pendingData = await pendingResponse.json();
        console.log('📥 Pending response data:', pendingData);
        
        if (!pendingResponse.ok) {
          console.error('❌ Pending response error:', pendingData);
          throw new Error(pendingData.message || `HTTP ${pendingResponse.status}: Failed to fetch pending teachers`);
        }
        
        if (pendingData.success) {
          console.log('✅ Found pending teachers:', pendingData.count || 0);
          console.log('📋 Pending teachers list:', pendingData.teachers);
          setPendingTeachers(pendingData.teachers || []);
        } else {
          console.warn('⚠️ Pending teachers response not successful:', pendingData);
          setPendingTeachers([]);
        }

        // Fetch all teachers based on filter
        console.log('🔍 Fetching all teachers with status:', filterStatus);
        const allResponse = await fetch(`${API_BASE_URL}/teacher/all?status=${filterStatus}`, {
          headers: getAuthHeaders(),
        });
        
        console.log('📥 All teachers response status:', allResponse.status);
        const allData = await allResponse.json();
        console.log('📥 All teachers response data:', allData);
        
        if (!allResponse.ok) {
          throw new Error(allData.message || `HTTP ${allResponse.status}: Failed to fetch all teachers`);
        }
        
        if (allData.success) {
          console.log('✅ Found all teachers:', allData.count || 0);
          setAllTeachers(allData.teachers || []);
        } else {
          console.warn('⚠️ All teachers response not successful:', allData);
          setAllTeachers([]);
        }
      } else {
        // Fetch pending students
        console.log('🔍 Fetching pending students from:', `${API_BASE_URL}/student/pending`);
        const pendingResponse = await fetch(`${API_BASE_URL}/student/pending`, {
          headers: getAuthHeaders(),
        });
        
        console.log('📥 Pending students response status:', pendingResponse.status);
        const pendingData = await pendingResponse.json();
        console.log('📥 Pending students response data:', pendingData);
        
        if (!pendingResponse.ok) {
          throw new Error(pendingData.message || `HTTP ${pendingResponse.status}: Failed to fetch pending students`);
        }
        
        if (pendingData.success) {
          console.log('✅ Found pending students:', pendingData.count || 0);
          setPendingStudents(pendingData.students || []);
        } else {
          console.warn('⚠️ Pending students response not successful:', pendingData);
          setPendingStudents([]);
        }

        // Fetch all students based on filter
        console.log('🔍 Fetching all students with status:', filterStatus);
        const allResponse = await fetch(`${API_BASE_URL}/student/all?status=${filterStatus}`, {
          headers: getAuthHeaders(),
        });
        
        console.log('📥 All students response status:', allResponse.status);
        const allData = await allResponse.json();
        console.log('📥 All students response data:', allData);
        
        if (!allResponse.ok) {
          throw new Error(allData.message || `HTTP ${allResponse.status}: Failed to fetch all students`);
        }
        
        if (allData.success) {
          console.log('✅ Found all students:', allData.count || 0);
          setAllStudents(allData.students || []);
        } else {
          console.warn('⚠️ All students response not successful:', allData);
          setAllStudents([]);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching KYC data:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        activeTab,
        filterStatus
      });
      
      let errorMessage = err.message || 'Failed to load KYC requests';
      
      // Check for specific error types
      if (err.message && err.message.includes('401')) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err.message && err.message.includes('403')) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (err.message && err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please ensure backend is running on port 3002.';
      }
      
      setError(errorMessage);
      
      // Also set empty arrays on error
      if (activeTab === 'teacher') {
        setPendingTeachers([]);
        setAllTeachers([]);
      } else {
        setPendingStudents([]);
        setAllStudents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this verification?')) {
      return;
    }

    try {
      setError(null);
      const endpoint = activeTab === 'teacher' 
        ? `${API_BASE_URL}/teacher/approve/${userId}`
        : `${API_BASE_URL}/student/approve/${userId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve verification');
      }

      alert('Verification approved successfully!');
      fetchData();
    } catch (err) {
      console.error('Error approving verification:', err);
      setError(err.message || 'Failed to approve verification');
    }
  };

  const handleReject = (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setError(null);
      const endpoint = activeTab === 'teacher'
        ? `${API_BASE_URL}/teacher/reject/${selectedUser._id}`
        : `${API_BASE_URL}/student/reject/${selectedUser._id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject verification');
      }

      alert('Verification rejected successfully!');
      setIsModalOpen(false);
      setSelectedUser(null);
      setRejectionReason('');
      fetchData();
    } catch (err) {
      console.error('Error rejecting verification:', err);
      setError(err.message || 'Failed to reject verification');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger',
      not_submitted: 'bg-secondary'
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      not_submitted: 'Not Submitted'
    };
    return texts[status] || status;
  };

  const renderDocuments = (documents) => {
    if (!documents) return <span className="text-muted">No documents</span>;

    return (
      <div className="d-flex gap-2 flex-wrap">
        {documents.aadharFront && (
          <a href={documents.aadharFront} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
            Aadhar Front
          </a>
        )}
        {documents.aadharBack && (
          <a href={documents.aadharBack} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
            Aadhar Back
          </a>
        )}
        {documents.panCard && (
          <a href={documents.panCard} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
            PAN Card
          </a>
        )}
        {documents.studentId && (
          <a href={documents.studentId} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
            Student ID
          </a>
        )}
        {documents.marksheet && (
          <a href={documents.marksheet} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
            Marksheet
          </a>
        )}
      </div>
    );
  };

  const currentList = activeTab === 'teacher' 
    ? (filterStatus === 'pending' ? pendingTeachers : allTeachers)
    : (filterStatus === 'pending' ? pendingStudents : allStudents);

  if (loading) {
    return (
      <div className="container mt-4">
        <h2 className="mb-4">KYC Verification</h2>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>KYC Verification</h2>
        <button className="btn btn-primary" onClick={fetchData}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('teacher');
              setFilterStatus('pending');
            }}
          >
            Teachers
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('student');
              setFilterStatus('pending');
            }}
          >
            Students
          </button>
        </li>
      </ul>

      {/* Filter */}
      <div className="mb-3">
        <label className="me-2">Filter by Status:</label>
        <select
          className="form-select d-inline-block"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="not_submitted">Not Submitted</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Documents</th>
              <th>Submitted At</th>
              {filterStatus === 'pending' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentList.length === 0 ? (
              <tr>
                <td colSpan={filterStatus === 'pending' ? 6 : 5} className="text-center">
                  No {activeTab === 'teacher' ? 'teachers' : 'students'} found with status: {getStatusText(filterStatus)}
                </td>
              </tr>
            ) : (
              currentList.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(user.verificationStatus || 'not_submitted')}`}>
                      {getStatusText(user.verificationStatus || 'not_submitted')}
                    </span>
                  </td>
                  <td>{renderDocuments(user.documents)}</td>
                  <td>
                    {user.submittedAt
                      ? new Date(user.submittedAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  {filterStatus === 'pending' && (
                    <td>
                      <button
                        onClick={() => handleApprove(user._id)}
                        className="btn btn-success btn-sm me-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user)}
                        className="btn btn-danger btn-sm"
                      >
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reject Verification</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedUser(null);
                      setRejectionReason('');
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Please provide a reason for rejecting this verification:</p>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedUser(null);
                      setRejectionReason('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleRejectSubmit}
                  >
                    Reject
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

