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
  
  // Playlist management state
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
  const [selectedCourseForPlaylist, setSelectedCourseForPlaylist] = useState(null)
  const [playlistItems, setPlaylistItems] = useState([])
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false)
  const [playlistForm, setPlaylistForm] = useState({
    title: '',
    description: '',
    contentType: 'video',
    isFree: false,
    video: null,
    thumbnail: null
  })
  const [savingPlaylist, setSavingPlaylist] = useState(false)

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

  // Playlist management functions
  const handleManagePlaylist = async (course) => {
    setSelectedCourseForPlaylist(course);
    setIsPlaylistModalOpen(true);
    await fetchPlaylistItems(course._id);
  };

  const handleClosePlaylistModal = () => {
    setIsPlaylistModalOpen(false);
    setSelectedCourseForPlaylist(null);
    setPlaylistItems([]);
    setPlaylistForm({
      title: '',
      description: '',
      contentType: 'video',
      isFree: false,
      video: null,
      thumbnail: null
    });
  };

  const fetchPlaylistItems = async (courseId) => {
    try {
      setIsLoadingPlaylist(true);
      const response = await adminAPI.getCoursePlaylist(courseId);
      if (response.success && response.playlistItems) {
        setPlaylistItems(response.playlistItems);
      } else if (response.success && response.playlist) {
        // Fallback for different response format
        setPlaylistItems(response.playlist);
      } else {
        setPlaylistItems([]);
      }
    } catch (err) {
      console.error('Error fetching playlist:', err);
      setPlaylistItems([]);
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  const handlePlaylistFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setPlaylistForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setPlaylistForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePlaylistFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setPlaylistForm(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSavePlaylistItem = async () => {
    const title = (playlistForm.title || '').trim();
    const description = (playlistForm.description || '').trim();

    if (!title) {
      alert('Title is required');
      return;
    }
    if (!description) {
      alert('Description is required');
      return;
    }
    if (!playlistForm.thumbnail) {
      alert('Thumbnail is required');
      return;
    }
    if (['video', 'audio', 'full', 'reel'].includes(playlistForm.contentType) && !playlistForm.video) {
      alert('Video file is required for video/audio content type');
      return;
    }

    try {
      setSavingPlaylist(true);
      setError(null);

      const playlistData = {
        title,
        description,
        contentType: playlistForm.contentType,
        category: 'general', // Default category
        isFree: playlistForm.isFree
      };

      const response = await adminAPI.createPlaylistItem(
        selectedCourseForPlaylist._id,
        playlistData,
        playlistForm.video,
        playlistForm.thumbnail
      );

      if (response.success) {
        await fetchPlaylistItems(selectedCourseForPlaylist._id);
        setPlaylistForm({
          title: '',
          description: '',
          contentType: 'video',
          isFree: false,
          video: null,
          thumbnail: null
        });
      } else {
        throw new Error(response.message || 'Failed to create playlist item');
      }
    } catch (err) {
      console.error('Error saving playlist item:', err);
      setError(err.message || 'Failed to create playlist item');
    } finally {
      setSavingPlaylist(false);
    }
  };

  const handleDeletePlaylistItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this playlist item?')) {
      return;
    }

    try {
      const response = await adminAPI.deletePlaylistItem(selectedCourseForPlaylist._id, itemId);
      if (response.success) {
        await fetchPlaylistItems(selectedCourseForPlaylist._id);
      } else {
        throw new Error(response.message || 'Failed to delete playlist item');
      }
    } catch (err) {
      console.error('Error deleting playlist item:', err);
      alert(err.message || 'Failed to delete playlist item');
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
                  <th>Teacher</th>
                  <th>Price</th>
                  <th style={{ width: 160 }} className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
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
                      <td>
                        {course.teacher ? (
                          <div>
                            <div className="fw-semibold">{course.teacher.name || 'N/A'}</div>
                            <div className="text-muted small">{course.teacher.email || ''}</div>
                          </div>
                        ) : (
                          <span className="badge bg-secondary">Admin Created</span>
                        )}
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
                          onClick={() => handleManagePlaylist(course)} 
                          className="btn btn-outline-success btn-sm me-2"
                        >
                          Playlist
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

      {/* Playlist Management Modal */}
      {isPlaylistModalOpen && selectedCourseForPlaylist && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '1000px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Manage Playlist - {selectedCourseForPlaylist.title}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    aria-label="Close" 
                    onClick={handleClosePlaylistModal}
                  ></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Add New Playlist Item Form */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Add New Playlist Video</h6>
                    </div>
                    <div className="card-body">
                      <form>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Title *</label>
                            <input 
                              name="title" 
                              value={playlistForm.title} 
                              onChange={handlePlaylistFormChange} 
                              type="text" 
                              className="form-control" 
                              required
                              disabled={savingPlaylist}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Content Type *</label>
                            <select 
                              name="contentType" 
                              value={playlistForm.contentType} 
                              onChange={handlePlaylistFormChange}
                              className="form-select"
                              required
                              disabled={savingPlaylist}
                            >
                              <option value="video">Video</option>
                              <option value="audio">Audio</option>
                              <option value="full">Full Video</option>
                              <option value="reel">Reel</option>
                              <option value="document">Document</option>
                              <option value="text">Text</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description *</label>
                          <textarea 
                            name="description" 
                            value={playlistForm.description} 
                            onChange={handlePlaylistFormChange} 
                            className="form-control" 
                            rows="3"
                            required
                            disabled={savingPlaylist}
                          />
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Video File *</label>
                            <input 
                              name="video" 
                              type="file" 
                              accept="video/*,audio/*"
                              onChange={handlePlaylistFileChange}
                              className="form-control"
                              disabled={savingPlaylist}
                            />
                            <small className="text-muted">
                              Required for video/audio content types
                            </small>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Thumbnail *</label>
                            <input 
                              name="thumbnail" 
                              type="file" 
                              accept="image/*"
                              onChange={handlePlaylistFileChange}
                              className="form-control"
                              required
                              disabled={savingPlaylist}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="form-check">
                            <input 
                              name="isFree" 
                              type="checkbox" 
                              checked={playlistForm.isFree} 
                              onChange={handlePlaylistFormChange}
                              className="form-check-input"
                              disabled={savingPlaylist}
                            />
                            <label className="form-check-label">
                              Free (First video can be free)
                            </label>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          onClick={handleSavePlaylistItem}
                          disabled={savingPlaylist}
                        >
                          {savingPlaylist ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Adding...
                            </>
                          ) : (
                            'Add to Playlist'
                          )}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Existing Playlist Items */}
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Playlist Items ({playlistItems.length})</h6>
                    </div>
                    <div className="card-body">
                      {isLoadingPlaylist ? (
                        <div className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : playlistItems.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          No playlist items yet. Add your first video above.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Order</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Free</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {playlistItems.map((item, index) => (
                                <tr key={item._id}>
                                  <td>{index + 1}</td>
                                  <td>{item.title}</td>
                                  <td>
                                    <span className="badge bg-info">{item.contentType}</span>
                                  </td>
                                  <td>
                                    {item.isFree ? (
                                      <span className="badge bg-success">Free</span>
                                    ) : (
                                      <span className="badge bg-secondary">Paid</span>
                                    )}
                                  </td>
                                  <td>
                                    <button 
                                      onClick={() => handleDeletePlaylistItem(item._id)} 
                                      className="btn btn-outline-danger btn-sm"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleClosePlaylistModal}
                  >
                    Close
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



