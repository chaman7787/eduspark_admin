import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'http://192.168.31.186:3002/api/admin/support';

const getToken = () => {
  return localStorage.getItem('adminToken');
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const FEEDBACK_TYPES = {
  bug_report: 'Bug Report',
  feature_request: 'Feature Request',
  general_feedback: 'General Feedback',
  complaint: 'Complaint',
  suggestion: 'Suggestion'
};

const FEEDBACK_STATUS = {
  pending: 'Pending',
  in_review: 'In Review',
  resolved: 'Resolved',
  closed: 'Closed'
};

export const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseStatus, setResponseStatus] = useState('resolved');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, [filterStatus, filterType]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_BASE_URL}/feedback?page=1&limit=100`;
      if (filterStatus) url += `&status=${filterStatus}`;
      if (filterType) url += `&type=${filterType}`;

      console.log('🔍 Fetching feedback from:', url);
      console.log('🔍 Filter status:', filterStatus);
      console.log('🔍 Filter type:', filterType);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      console.log('📥 Feedback response status:', response.status);

      const data = await response.json();
      console.log('📥 Feedback response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to fetch feedback`);
      }

      if (data.success) {
        console.log('✅ Found feedback:', data.data?.length || 0);
        console.log('📋 Feedback list:', data.data?.map(f => ({
          id: f._id,
          subject: f.subject,
          status: f.status,
          type: f.type,
          userName: f.userId?.name
        })));
        setFeedbacks(data.data || []);
      } else {
        console.warn('⚠️ Feedback response not successful:', data);
        setFeedbacks([]);
      }
    } catch (err) {
      console.error('❌ Error fetching feedback:', err);
      setError(err.message || 'Failed to load feedback');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseMessage(feedback.adminResponse?.message || '');
    setResponseStatus(feedback.status || 'resolved');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFeedback(null);
    setResponseMessage('');
    setResponseStatus('resolved');
    setError(null);
  };

  const handleSubmitResponse = async () => {
    if (!responseMessage.trim()) {
      alert('Please enter a response message');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/feedback/${selectedFeedback._id}/respond`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: responseMessage,
          status: responseStatus
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit response');
      }

      alert('Response submitted successfully!');
      await fetchFeedbacks();
      handleCloseModal();
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err.message || 'Failed to submit response');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning',
      in_review: 'bg-info',
      resolved: 'bg-success',
      closed: 'bg-secondary'
    };
    return badges[status] || 'bg-secondary';
  };

  const getTypeBadge = (type) => {
    const badges = {
      bug_report: 'bg-danger',
      feature_request: 'bg-primary',
      general_feedback: 'bg-info',
      complaint: 'bg-warning',
      suggestion: 'bg-success'
    };
    return badges[type] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2 className="mb-4">Feedback Management</h2>
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
        <h2>Feedback Management</h2>
        <button className="btn btn-primary" onClick={fetchFeedbacks}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Filter by Status:</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {Object.entries(FEEDBACK_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Filter by Type:</label>
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {Object.entries(FEEDBACK_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-light border rounded">
          <h5>Debug Info</h5>
          <p>Filter Status: <strong>{filterStatus || 'All'}</strong></p>
          <p>Filter Type: <strong>{filterType || 'All'}</strong></p>
          <p>Total Feedbacks: <strong>{feedbacks.length}</strong></p>
          <h6>Feedbacks List:</h6>
          <pre className="bg-white p-2 rounded overflow-auto" style={{ maxHeight: '200px' }}>
            {JSON.stringify(feedbacks.map(f => ({ 
              id: f._id, 
              subject: f.subject, 
              status: f.status, 
              type: f.type,
              userName: f.userId?.name 
            })), null, 2)}
          </pre>
        </div>
      )}

      {/* Feedback List */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No feedback found</td>
              </tr>
            ) : (
              feedbacks.map((feedback) => (
                <tr key={feedback._id}>
                  <td>
                    <div>
                      <strong>{feedback.userId?.name || 'N/A'}</strong>
                      <br />
                      <small className="text-muted">{feedback.userId?.email}</small>
                      <br />
                      <span className="badge bg-secondary">{feedback.userId?.role}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getTypeBadge(feedback.type)}`}>
                      {FEEDBACK_TYPES[feedback.type] || feedback.type}
                    </span>
                  </td>
                  <td>{feedback.subject}</td>
                  <td>
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {feedback.message}
                    </div>
                    {feedback.attachments && feedback.attachments.length > 0 && (
                      <div className="mt-1">
                        <small className="text-muted">
                          {feedback.attachments.length} attachment(s)
                        </small>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(feedback.status)}`}>
                      {FEEDBACK_STATUS[feedback.status] || feedback.status}
                    </span>
                  </td>
                  <td>
                    {feedback.rating ? (
                      <span className="badge bg-warning">
                        {'⭐'.repeat(feedback.rating)}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {new Date(feedback.createdAt).toLocaleDateString()}
                    <br />
                    <small className="text-muted">
                      {new Date(feedback.createdAt).toLocaleTimeString()}
                    </small>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleRespond(feedback)}
                    >
                      {feedback.adminResponse ? 'View/Update' : 'Respond'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Response Modal */}
      {isModalOpen && selectedFeedback && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Respond to Feedback</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  {/* Feedback Details */}
                  <div className="card mb-3">
                    <div className="card-header">
                      <strong>Feedback Details</strong>
                    </div>
                    <div className="card-body">
                      <p><strong>User:</strong> {selectedFeedback.userId?.name} ({selectedFeedback.userId?.email})</p>
                      <p><strong>Type:</strong> {FEEDBACK_TYPES[selectedFeedback.type] || selectedFeedback.type}</p>
                      <p><strong>Subject:</strong> {selectedFeedback.subject}</p>
                      <p><strong>Message:</strong></p>
                      <div className="border p-2 bg-light rounded">
                        {selectedFeedback.message}
                      </div>
                      {selectedFeedback.attachments && selectedFeedback.attachments.length > 0 && (
                        <div className="mt-2">
                          <strong>Attachments:</strong>
                          <ul>
                            {selectedFeedback.attachments.map((att, idx) => (
                              <li key={idx}>
                                <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                  {att.fileName}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedFeedback.rating && (
                        <p><strong>Rating:</strong> {'⭐'.repeat(selectedFeedback.rating)}</p>
                      )}
                    </div>
                  </div>

                  {/* Previous Response */}
                  {selectedFeedback.adminResponse && (
                    <div className="card mb-3">
                      <div className="card-header bg-info text-white">
                        <strong>Previous Response</strong>
                      </div>
                      <div className="card-body">
                        <p>{selectedFeedback.adminResponse.message}</p>
                        <small className="text-muted">
                          By: {selectedFeedback.adminResponse.respondedBy?.name || 'Admin'}
                          <br />
                          Date: {new Date(selectedFeedback.adminResponse.respondedAt).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Response Form */}
                  <div className="mb-3">
                    <label className="form-label">Response Message *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Enter your response..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={responseStatus}
                      onChange={(e) => setResponseStatus(e.target.value)}
                    >
                      {Object.entries(FEEDBACK_STATUS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
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
                    onClick={handleSubmitResponse}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      'Submit Response'
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

