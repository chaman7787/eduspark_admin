import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'http://localhost:3002/api/support';

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

const SUPPORT_TYPES = [
  { value: 'help_center', label: 'Help Center' },
  { value: 'faq', label: 'FAQ' },
  { value: 'terms_of_service', label: 'Terms of Service' },
  { value: 'privacy_policy', label: 'Privacy Policy' },
  { value: 'about_us', label: 'About Us' }
];

export const Support = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [form, setForm] = useState({
    type: 'help_center',
    targetRole: 'all',
    title: '',
    content: '',
    isActive: true,
    sections: [],
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      whatsapp: ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [newSection, setNewSection] = useState({ title: '', content: '', order: 0 });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/content`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch support content');
      }

      setContents(data.data || []);
    } catch (err) {
      console.error('Error fetching support content:', err);
      setError(err.message || 'Failed to load support content');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content) => {
    setSelectedContent(content);
    setForm({
      type: content.type,
      targetRole: content.targetRole || 'all',
      title: content.title || '',
      content: content.content || '',
      isActive: content.isActive !== undefined ? content.isActive : true,
      sections: content.sections || [],
      contactInfo: content.contactInfo || {
        email: '',
        phone: '',
        address: '',
        whatsapp: ''
      }
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
    setForm({
      type: 'help_center',
      targetRole: 'all',
      title: '',
      content: '',
      isActive: true,
      sections: [],
      contactInfo: {
        email: '',
        phone: '',
        address: '',
        whatsapp: ''
      }
    });
    setNewSection({ title: '', content: '', order: 0 });
    setSelectedFiles([]);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddSection = () => {
    if (newSection.title && newSection.content) {
      setForm(prev => ({
        ...prev,
        sections: [...prev.sections, { ...newSection, order: prev.sections.length }]
      }));
      setNewSection({ title: '', content: '', order: 0 });
    }
  };

  const handleRemoveSection = (index) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      alert('Title and Content are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('targetRole', form.targetRole);
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('isActive', form.isActive);
      formData.append('sections', JSON.stringify(form.sections));
      formData.append('contactInfo', JSON.stringify(form.contactInfo));
      
      // Add file attachments
      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/content`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save support content');
      }

      alert('Support content saved successfully!');
      await fetchContents();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving support content:', err);
      setError(err.message || 'Failed to save support content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2 className="mb-4">Support Content Management</h2>
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
        <h2>Support Content Management</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          Add New Content
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="row">
        {contents.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">No support content found. Create one to get started.</div>
          </div>
        ) : (
          contents.map((content) => (
            <div key={content._id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title">{content.title}</h5>
                      <p className="card-text">
                        <span className={`badge ${content.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {content.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="badge bg-info ms-2">{SUPPORT_TYPES.find(t => t.value === content.type)?.label || content.type}</span>
                        <span className="badge bg-secondary ms-2">
                          {content.targetRole === 'all' ? 'All Users' : 
                           content.targetRole === 'teacher' ? 'Teachers' : 'Students'}
                        </span>
                      </p>
                      <p className="text-muted small">
                        Last updated: {new Date(content.updatedAt).toLocaleDateString()}
                      </p>
                      {content.attachments && content.attachments.length > 0 && (
                        <p className="text-muted small">
                          {content.attachments.length} attachment(s)
                        </p>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(content)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedContent ? 'Edit Support Content' : 'Create Support Content'}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Type *</label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="form-select"
                        required
                        disabled={!!selectedContent}
                      >
                        {SUPPORT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Target Audience *</label>
                      <select
                        name="targetRole"
                        value={form.targetRole}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="all">All Users</option>
                        <option value="teacher">Teachers Only</option>
                        <option value="student">Students Only</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Title *</label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        type="text"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Content *</label>
                      <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        className="form-control"
                        rows="6"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Sections</label>
                      {form.sections.map((section, index) => (
                        <div key={index} className="card mb-2">
                          <div className="card-body">
                            <div className="d-flex justify-content-between">
                              <div className="flex-grow-1">
                                <strong>{section.title}</strong>
                                <p className="mb-0 small">{section.content}</p>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveSection(index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="card">
                        <div className="card-body">
                          <div className="mb-2">
                            <input
                              type="text"
                              className="form-control form-control-sm mb-2"
                              placeholder="Section Title"
                              value={newSection.title}
                              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                            />
                            <textarea
                              className="form-control form-control-sm"
                              placeholder="Section Content"
                              rows="2"
                              value={newSection.content}
                              onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={handleAddSection}
                          >
                            Add Section
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Contact Information</label>
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <input
                            name="contactInfo.email"
                            value={form.contactInfo.email}
                            onChange={handleChange}
                            type="email"
                            className="form-control form-control-sm"
                            placeholder="Email"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <input
                            name="contactInfo.phone"
                            value={form.contactInfo.phone}
                            onChange={handleChange}
                            type="tel"
                            className="form-control form-control-sm"
                            placeholder="Phone"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <input
                            name="contactInfo.whatsapp"
                            value={form.contactInfo.whatsapp}
                            onChange={handleChange}
                            type="tel"
                            className="form-control form-control-sm"
                            placeholder="WhatsApp"
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <input
                            name="contactInfo.address"
                            value={form.contactInfo.address}
                            onChange={handleChange}
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Address"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Attachments</label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                        onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                      />
                      {selectedFiles.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted">Selected files: {selectedFiles.map(f => f.name).join(', ')}</small>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          name="isActive"
                          type="checkbox"
                          className="form-check-input"
                          checked={form.isActive}
                          onChange={handleChange}
                        />
                        <label className="form-check-label">Active</label>
                      </div>
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
                      'Save'
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

