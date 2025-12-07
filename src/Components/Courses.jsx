import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { RiSearch2Line } from 'react-icons/ri';
import { adminAPI } from '../services/api';

export const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    thumbnail: null,
    thumbnailUrl: '',
    price: '', 
    details: {
      duration: '',
      level: '',
      requirements: [''],
      content: ['']
    }
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCourses, setFilteredCourses] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getCourses(1, 100);
      if (response.success) {
        setCourses(response.courses || []);
      } else {
        throw new Error(response.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Search is handled by useEffect
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    const thumbnailUrl = course.thumbnail || '';
    setForm({
      title: course.title || '',
      description: course.description || '',
      thumbnail: null,
      thumbnailUrl: thumbnailUrl.includes('http') ? thumbnailUrl : '',
      price: course.price?.toString() || '',
      details: {
        duration: course.details?.duration || '',
        level: course.details?.level || '',
        requirements: course.details?.requirements?.length > 0 
          ? course.details.requirements 
          : [''],
        content: course.details?.content?.length > 0 
          ? course.details.content 
          : ['']
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      return;
    }

    try {
      setError(null);
      const response = await adminAPI.deleteCourse(course._id);
      
      if (response.success) {
        await fetchCourses();
      } else {
        throw new Error(response.message || 'Failed to delete course');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(err.message || 'Failed to delete course');
    }
  };

  const handleOpenModal = () => {
    setSelectedCourse(null);
    setForm({
      title: '',
      description: '',
      thumbnail: null,
      thumbnailUrl: '',
      price: '',
      details: {
        duration: '',
        level: '',
        requirements: [''],
        content: ['']
      }
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setForm({
      title: '',
      description: '',
      thumbnail: null,
      thumbnailUrl: '',
      price: '',
      details: {
        duration: '',
        level: '',
        requirements: [''],
        content: ['']
      }
    });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('details.')) {
      const detailKey = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [detailKey]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setForm(prev => {
      const newArray = [...prev.details[field]];
      newArray[index] = value;
      return {
        ...prev,
        details: {
          ...prev.details,
          [field]: newArray
        }
      };
    });
  };

  const addArrayItem = (field) => {
    setForm(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: [...prev.details[field], '']
      }
    }));
  };

  const removeArrayItem = (field, index) => {
    setForm(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: prev.details[field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, thumbnail: file, thumbnailUrl: '' }));
    }
  };

  const handleSave = async () => {
    const title = (form.title || '').trim();
    const description = (form.description || '').trim();
    const price = parseFloat(form.price);

    if (!title) {
      alert('Title is required');
      return;
    }
    if (!description) {
      alert('Description is required');
      return;
    }
    if (!form.thumbnail && !form.thumbnailUrl) {
      alert('Thumbnail is required (upload file or provide URL)');
      return;
    }
    if (isNaN(price) || price < 0) {
      alert('Price must be a valid number greater than or equal to 0');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Prepare course data
      const courseData = {
        title,
        description,
        price,
        thumbnail: form.thumbnail || form.thumbnailUrl
      };

      // Prepare details
      const details = {};
      if (form.details.duration) details.duration = form.details.duration;
      if (form.details.level) details.level = form.details.level;
      
      const requirements = form.details.requirements.filter(r => r.trim());
      if (requirements.length > 0) details.requirements = requirements;
      
      const content = form.details.content.filter(c => c.trim());
      if (content.length > 0) details.content = content;

      if (Object.keys(details).length > 0) {
        courseData.details = details;
      }

      let response;
      if (selectedCourse) {
        // Update existing course
        response = await adminAPI.updateCourse(selectedCourse._id, courseData);
      } else {
        // Create new course
        response = await adminAPI.createCourse(courseData);
      }

      if (response.success) {
        await fetchCourses();
        handleCloseModal();
      } else {
        throw new Error(response.message || `Failed to ${selectedCourse ? 'update' : 'create'} course`);
      }
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err.message || `Failed to ${selectedCourse ? 'update' : 'create'} course`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error Loading Courses</h5>
          <p>{error}</p>
          <button className="btn btn-danger" onClick={fetchCourses}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="card-title mb-0">Courses</h4>
            <div className="d-flex gap-2 align-items-center">
              <div className="input-group input-group-sm" style={{ width: 'auto', minWidth: 200 }}>
                <input 
                  className="form-control shadow-none" 
                  placeholder="Search courses..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  style={{ zIndex: 0 }}
                />
                <button 
                  className="btn btn-outline-primary shadow-none" 
                  type="button"
                  onClick={handleSearch}
                  style={{ zIndex: 0 }}
                >
                  <RiSearch2Line size={16} />
                </button>
              </div>
              <button className="btn btn-sm btn-primary" onClick={handleOpenModal}>
                Add Course
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={fetchCourses}>
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 100 }}>Thumbnail</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th style={{ width: 160 }} className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      {searchTerm ? 'No courses found matching your search' : 'No courses available'}
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map(course => (
                    <tr key={course._id}>
                      <td>
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '4px' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="bg-secondary text-white rounded d-inline-flex align-items-center justify-content-center" 
                          style={{ 
                            width: 56, 
                            height: 56, 
                            display: course.thumbnail ? 'none' : 'flex',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {course.title?.substring(0, 2).toUpperCase() || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{course.title}</div>
                        {course.details?.level && (
                          <div className="text-muted small">Level: {course.details.level}</div>
                        )}
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '300px' }}>
                          {course.description || 'No description'}
                        </div>
                      </td>
                      <td>₹{course.price || 0}</td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleEdit(course)} 
                          className="btn btn-outline-primary btn-sm me-2"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(course)} 
                          className="btn btn-outline-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Course */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '800px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedCourse ? 'Edit Course' : 'Add Course'}</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    aria-label="Close" 
                    onClick={handleCloseModal}
                    disabled={saving}
                  ></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Title *</label>
                      <input 
                        name="title" 
                        value={form.title} 
                        onChange={handleChange} 
                        type="text" 
                        className="form-control" 
                        required
                        disabled={saving}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea 
                        name="description" 
                        value={form.description} 
                        onChange={handleChange} 
                        className="form-control" 
                        rows="3"
                        required
                        disabled={saving}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Price * (₹)</label>
                      <input 
                        name="price" 
                        value={form.price} 
                        onChange={handleChange} 
                        type="number" 
                        className="form-control" 
                        min="0"
                        step="0.01"
                        required
                        disabled={saving}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thumbnail *</label>
                      <div className="d-flex gap-2 mb-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="form-control"
                          disabled={saving}
                        />
                        {form.thumbnail && (
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setForm(prev => ({ ...prev, thumbnail: null }))}
                            disabled={saving}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="text-muted small mb-2">OR</div>
                      <input 
                        name="thumbnailUrl" 
                        value={form.thumbnailUrl} 
                        onChange={(e) => setForm(prev => ({ ...prev, thumbnailUrl: e.target.value, thumbnail: null }))}
                        type="text" 
                        className="form-control" 
                        placeholder="Thumbnail URL"
                        disabled={saving || !!form.thumbnail}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Duration</label>
                      <input 
                        name="details.duration" 
                        value={form.details.duration} 
                        onChange={handleChange} 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. 4 weeks, 8 hours"
                        disabled={saving}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Level</label>
                      <select 
                        name="details.level" 
                        value={form.details.level} 
                        onChange={handleChange}
                        className="form-select"
                        disabled={saving}
                      >
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Requirements</label>
                      {form.details.requirements.map((req, index) => (
                        <div key={index} className="d-flex gap-2 mb-2">
                          <input 
                            type="text" 
                            value={req} 
                            onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                            className="form-control" 
                            placeholder={`Requirement ${index + 1}`}
                            disabled={saving}
                          />
                          {form.details.requirements.length > 1 && (
                            <button 
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeArrayItem('requirements', index)}
                              disabled={saving}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => addArrayItem('requirements')}
                        disabled={saving}
                      >
                        Add Requirement
                      </button>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Content</label>
                      {form.details.content.map((cont, index) => (
                        <div key={index} className="d-flex gap-2 mb-2">
                          <input 
                            type="text" 
                            value={cont} 
                            onChange={(e) => handleArrayChange('content', index, e.target.value)}
                            className="form-control" 
                            placeholder={`Content item ${index + 1}`}
                            disabled={saving}
                          />
                          {form.details.content.length > 1 && (
                            <button 
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeArrayItem('content', index)}
                              disabled={saving}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => addArrayItem('content')}
                        disabled={saving}
                      >
                        Add Content
                      </button>
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
                        {selectedCourse ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      selectedCourse ? 'Update Course' : 'Create Course'
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



