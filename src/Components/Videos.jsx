import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { RiSearch2Line } from 'react-icons/ri';
import { adminAPI } from '../services/api';

export const Videos = () => {
  const [videos, setVideos] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    contentType: 'full',
    category: '',
    customCategory: '',
    teacherId: '',
    video: null,
    thumbnail: null,
    videoUrl: '',
    thumbnailUrl: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredVideos, setFilteredVideos] = useState([])
  const [saving, setSaving] = useState(false)
  const [contentTypeFilter, setContentTypeFilter] = useState('')

  useEffect(() => {
    fetchVideos();
    fetchTeachers();
  }, []);

  useEffect(() => {
    let filtered = videos;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(video => 
        video.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        video.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (contentTypeFilter) {
      filtered = filtered.filter(video => video.contentType === contentTypeFilter);
    }
    
    setFilteredVideos(filtered);
  }, [searchTerm, contentTypeFilter, videos]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getVideos(1, 100, contentTypeFilter, searchTerm);
      if (response.success) {
        setVideos(response.videos || []);
      } else {
        throw new Error(response.message || 'Failed to fetch videos');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getTeachers(1, 1000);
      if (response.success) {
        setTeachers(response.teachers || []);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const handleSearch = () => {
    fetchVideos();
  };

  const handleEdit = (video) => {
    setSelectedVideo(video);
    setForm({
      title: video.title || '',
      description: video.description || '',
      contentType: video.contentType || 'full',
      category: Array.isArray(video.category) ? video.category.join(',') : video.category || '',
      customCategory: video.customCategory || '',
      teacherId: video.uploadedBy?._id || '',
      video: null,
      thumbnail: null,
      videoUrl: video.videoUrl || '',
      thumbnailUrl: video.thumbnailUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (video) => {
    if (!window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
      return;
    }

    try {
      setError(null);
      const response = await adminAPI.deleteVideo(video._id);
      
      if (response.success) {
        await fetchVideos();
      } else {
        throw new Error(response.message || 'Failed to delete video');
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      alert(err.message || 'Failed to delete video');
    }
  };

  const handleOpenModal = () => {
    setSelectedVideo(null);
    setForm({
      title: '',
      description: '',
      contentType: 'full',
      category: '',
      customCategory: '',
      teacherId: '',
      video: null,
      thumbnail: null,
      videoUrl: '',
      thumbnailUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
    setForm({
      title: '',
      description: '',
      contentType: 'full',
      category: '',
      customCategory: '',
      teacherId: '',
      video: null,
      thumbnail: null,
      videoUrl: '',
      thumbnailUrl: ''
    });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSave = async () => {
    const title = (form.title || '').trim();
    const description = (form.description || '').trim();

    if (!title) {
      alert('Title is required');
      return;
    }
    if (!description) {
      alert('Description is required');
      return;
    }
    if (!form.teacherId) {
      alert('Please select a teacher');
      return;
    }
    if (!selectedVideo && !form.video && !form.videoUrl) {
      alert('Video file or URL is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const videoData = {
        title,
        description,
        contentType: form.contentType,
        teacherId: form.teacherId,
        category: form.category,
        customCategory: form.customCategory
      };

      let response;
      if (selectedVideo) {
        // Update existing video
        response = await adminAPI.updateVideo(selectedVideo._id, videoData, form.video, form.thumbnail);
      } else {
        // Create new video
        if (!form.video) {
          alert('Video file is required for new videos');
          setSaving(false);
          return;
        }
        response = await adminAPI.createVideo(videoData, form.video, form.thumbnail);
      }

      if (response.success) {
        await fetchVideos();
        handleCloseModal();
      } else {
        throw new Error(response.message || `Failed to ${selectedVideo ? 'update' : 'create'} video`);
      }
    } catch (err) {
      console.error('Error saving video:', err);
      setError(err.message || `Failed to ${selectedVideo ? 'update' : 'create'} video`);
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

  if (error && videos.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error Loading Videos</h5>
          <p>{error}</p>
          <button className="btn btn-danger" onClick={fetchVideos}>
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
            <h4 className="card-title mb-0">Videos</h4>
            <div className="d-flex gap-2 align-items-center">
              <div className="input-group input-group-sm" style={{ width: 'auto', minWidth: 200 }}>
                <input 
                  className="form-control shadow-none" 
                  placeholder="Search videos..." 
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
              <select 
                className="form-select form-select-sm" 
                style={{ width: 'auto' }}
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="full">Full Videos</option>
                <option value="reel">Reels</option>
              </select>
              <button className="btn btn-sm btn-primary" onClick={handleOpenModal}>
                Add Video
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={fetchVideos}>
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
                  <th>Type</th>
                  <th>Teacher</th>
                  <th style={{ width: 160 }} className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      {searchTerm || contentTypeFilter ? 'No videos found matching your search' : 'No videos available'}
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map(video => (
                    <tr key={video._id}>
                      <td>
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
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
                            display: video.thumbnailUrl ? 'none' : 'flex',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {video.title?.substring(0, 2).toUpperCase() || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{video.title}</div>
                        {video.category && video.category.length > 0 && (
                          <div className="text-muted small">
                            {Array.isArray(video.category) ? video.category.join(', ') : video.category}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '300px' }}>
                          {video.description || 'No description'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${video.contentType === 'reel' ? 'bg-info' : 'bg-primary'}`}>
                          {video.contentType === 'reel' ? 'Reel' : 'Full Video'}
                        </span>
                      </td>
                      <td>
                        {video.uploadedBy ? (
                          <div>
                            <div className="fw-semibold">{video.uploadedBy.name || 'N/A'}</div>
                            <div className="text-muted small">{video.uploadedBy.email || ''}</div>
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleEdit(video)} 
                          className="btn btn-outline-primary btn-sm me-2"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(video)} 
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

      {/* Modal for Add/Edit Video */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '800px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedVideo ? 'Edit Video' : 'Add Video'}</h5>
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
                      <label className="form-label">Teacher *</label>
                      <select 
                        name="teacherId" 
                        value={form.teacherId} 
                        onChange={handleChange} 
                        className="form-select" 
                        required
                        disabled={saving}
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map(teacher => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.name} ({teacher.email})
                          </option>
                        ))}
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
                      <label className="form-label">Content Type *</label>
                      <select 
                        name="contentType" 
                        value={form.contentType} 
                        onChange={handleChange}
                        className="form-select"
                        required
                        disabled={saving}
                      >
                        <option value="full">Full Video</option>
                        <option value="reel">Reel</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <input 
                        name="category" 
                        value={form.category} 
                        onChange={handleChange} 
                        type="text" 
                        className="form-control" 
                        placeholder="Comma-separated categories"
                        disabled={saving}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Custom Category</label>
                      <input 
                        name="customCategory" 
                        value={form.customCategory} 
                        onChange={handleChange} 
                        type="text" 
                        className="form-control" 
                        disabled={saving}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Video File {!selectedVideo && '*'}</label>
                      <input 
                        type="file" 
                        accept="video/*"
                        name="video"
                        onChange={handleFileChange}
                        className="form-control"
                        disabled={saving}
                      />
                      {selectedVideo && form.videoUrl && (
                        <div className="text-muted small mt-1">
                          Current: <a href={form.videoUrl} target="_blank" rel="noopener noreferrer">View Video</a>
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thumbnail Image</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        name="thumbnail"
                        onChange={handleFileChange}
                        className="form-control"
                        disabled={saving}
                      />
                      {selectedVideo && form.thumbnailUrl && (
                        <div className="mt-2">
                          <img 
                            src={form.thumbnailUrl} 
                            alt="Thumbnail" 
                            style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
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
                        {selectedVideo ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      selectedVideo ? 'Update Video' : 'Create Video'
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



