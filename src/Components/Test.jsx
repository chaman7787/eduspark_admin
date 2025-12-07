import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { RiSearch2Line } from 'react-icons/ri';
import { adminAPI } from '../services/api';

export const Test = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    totalDuration: '', 
    totalMarks: '',
    level: '',
    questions: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [saving, setSaving] = useState(false)
  const [isRankingsModalOpen, setIsRankingsModalOpen] = useState(false)
  const [rankingsData, setRankingsData] = useState(null)
  const [loadingRankings, setLoadingRankings] = useState(false)

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    } else {
      setFilteredQuizzes(quizzes);
    }
  }, [searchTerm, quizzes]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getQuizzes(1, 100);
      if (response.success) {
        // Fetch participant count for each quiz
        const quizzesWithParticipants = await Promise.all(
          (response.quizzes || []).map(async (quiz) => {
            try {
              const attemptsResponse = await adminAPI.getQuizAttempts(quiz._id, 1, 1);
              return {
                ...quiz,
                participantCount: attemptsResponse.totalParticipants || 0
              };
            } catch (err) {
              console.error(`Error fetching attempts for quiz ${quiz._id}:`, err);
              return {
                ...quiz,
                participantCount: 0
              };
            }
          })
        );
        setQuizzes(quizzesWithParticipants);
      } else {
        throw new Error(response.message || 'Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Search is handled by useEffect
  };

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    
    // Format dates for input fields
    const startDate = quiz.startDate ? new Date(quiz.startDate).toISOString().split('T')[0] : '';
    const endDate = quiz.endDate ? new Date(quiz.endDate).toISOString().split('T')[0] : '';
    
    setForm({
      title: quiz.title || '',
      description: quiz.description || '',
      startDate: startDate,
      endDate: endDate,
      startTime: quiz.startTime || '',
      endTime: quiz.endTime || '',
      totalDuration: quiz.totalDuration?.toString() || '',
      totalMarks: quiz.totalMarks?.toString() || '',
      level: quiz.level || '',
      questions: quiz.questions && Array.isArray(quiz.questions) ? quiz.questions.map(q => ({
        questionText: q.questionText || '',
        options: q.options || ['', '', '', ''],
        correctAnswer: q.correctAnswer || 0,
        timeLimit: q.timeLimit || 30
      })) : []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (quiz) => {
    if (!window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      return;
    }

    try {
      setError(null);
      const response = await adminAPI.deleteQuiz(quiz._id);
      
      if (response.success) {
        await fetchQuizzes();
      } else {
        throw new Error(response.message || 'Failed to delete quiz');
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert(err.message || 'Failed to delete quiz');
    }
  };

  const handleViewRankings = async (quiz) => {
    try {
      setLoadingRankings(true);
      setError(null);
      
      const response = await adminAPI.getQuizRankings(quiz._id, 100);
      
      if (response.success) {
        setRankingsData(response);
        setIsRankingsModalOpen(true);
      } else {
        throw new Error(response.message || 'Failed to fetch rankings');
      }
    } catch (err) {
      console.error('Error fetching rankings:', err);
      alert(err.message || 'Failed to fetch quiz rankings');
    } finally {
      setLoadingRankings(false);
    }
  };

  const handleCloseRankingsModal = () => {
    setIsRankingsModalOpen(false);
    setRankingsData(null);
  };

  const handleOpenModal = () => {
    setSelectedQuiz(null);
    setForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      totalDuration: '',
      totalMarks: '',
      level: '',
      questions: []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuiz(null);
    setForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      totalDuration: '',
      totalMarks: '',
      level: '',
      questions: []
    });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timeLimit: 30
      }]
    }));
  };

  const removeQuestion = (index) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setForm(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value
      };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setForm(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex].options[oIndex] = value;
      return { ...prev, questions: newQuestions };
    });
  };

  const handleSave = async () => {
    const title = (form.title || '').trim();
    const description = (form.description || '').trim();
    const startDate = form.startDate;
    const endDate = form.endDate;
    const startTime = form.startTime;
    const endTime = form.endTime;
    const totalDuration = parseInt(form.totalDuration);
    const totalMarks = parseInt(form.totalMarks);

    if (!title) {
      alert('Title is required');
      return;
    }
    if (!description) {
      alert('Description is required');
      return;
    }
    if (!startDate) {
      alert('Start date is required');
      return;
    }
    if (!endDate) {
      alert('End date is required');
      return;
    }
    if (!startTime) {
      alert('Start time is required');
      return;
    }
    if (!endTime) {
      alert('End time is required');
      return;
    }
    if (isNaN(totalDuration) || totalDuration <= 0) {
      alert('Total duration must be a valid number in minutes');
      return;
    }
    if (isNaN(totalMarks) || totalMarks <= 0) {
      alert('Total marks must be a valid number');
      return;
    }
    if (form.questions.length === 0) {
      alert('At least one question is required');
      return;
    }

    // Validate questions
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.questionText.trim()) {
        alert(`Question ${i + 1}: Question text is required`);
        return;
      }
      const filledOptions = q.options.filter(o => o && o.trim());
      if (filledOptions.length < 4) {
        alert(`Question ${i + 1}: All 4 options are required`);
        return;
      }
      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
        alert(`Question ${i + 1}: Valid correct answer (0-3) is required`);
        return;
      }
      if (!q.timeLimit || q.timeLimit < 5) {
        alert(`Question ${i + 1}: Time limit must be at least 5 seconds`);
        return;
      }
    }

    // Validate dates
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const now = new Date();

    // Only check future date for new quizzes
    if (!selectedQuiz && startDateTime <= now) {
      alert('Quiz start date and time must be in the future');
      return;
    }

    // Check that end time is after start time
    if (endDateTime <= startDateTime) {
      alert('Quiz end date and time must be after start date and time. Please check your dates and times.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const quizData = {
        title,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
        totalDuration,
        totalMarks,
        questions: form.questions.map(q => ({
          questionText: q.questionText.trim(),
          options: q.options.filter(o => o && o.trim()),
          correctAnswer: q.correctAnswer,
          timeLimit: q.timeLimit
        }))
      };

      if (form.level) {
        quizData.level = form.level;
      }

      let response;
      if (selectedQuiz) {
        response = await adminAPI.updateQuiz(selectedQuiz._id, quizData);
      } else {
        response = await adminAPI.createQuiz(quizData);
      }

      if (response.success) {
        await fetchQuizzes();
        handleCloseModal();
      } else {
        throw new Error(response.message || `Failed to ${selectedQuiz ? 'update' : 'create'} quiz`);
      }
    } catch (err) {
      console.error('Error saving quiz:', err);
      setError(err.message || `Failed to ${selectedQuiz ? 'update' : 'create'} quiz`);
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

  if (error && quizzes.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error Loading Quizzes</h5>
          <p>{error}</p>
          <button className="btn btn-danger" onClick={fetchQuizzes}>
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
            <h4 className="card-title mb-0">Quizzes/Tests</h4>
            <div className="d-flex gap-2 align-items-center">
              <div className="input-group input-group-sm" style={{ width: 'auto', minWidth: 200 }}>
                <input 
                  className="form-control shadow-none" 
                  placeholder="Search quizzes..." 
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
                Add Quiz
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={fetchQuizzes}>
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
                  <th>Title</th>
                  <th>Description</th>
                  <th>Duration (min)</th>
                  <th>Total Marks</th>
                  <th>Questions</th>
                  <th>Participants</th>
                  <th style={{ width: 220 }} className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      {searchTerm ? 'No quizzes found matching your search' : 'No quizzes available'}
                    </td>
                  </tr>
                ) : (
                  filteredQuizzes.map(quiz => (
                    <tr key={quiz._id}>
                      <td>
                        <div className="fw-semibold">{quiz.title}</div>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '250px' }}>
                          {quiz.description || 'No description'}
                        </div>
                      </td>
                      <td>{quiz.totalDuration || 0}</td>
                      <td>{quiz.totalMarks || 'N/A'}</td>
                      <td>
                        <span className="badge bg-info">
                          {quiz.questions?.length || 0} Q
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {quiz.participantCount || 0}
                        </span>
                      </td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleViewRankings(quiz)} 
                          className="btn btn-outline-info btn-sm me-1"
                          title="View Rankings"
                          disabled={loadingRankings}
                        >
                          Rankings
                        </button>
                        <button 
                          onClick={() => handleEdit(quiz)} 
                          className="btn btn-outline-primary btn-sm me-1"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(quiz)} 
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

      {/* Modal for Add/Edit Quiz */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '900px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedQuiz ? 'Edit Quiz' : 'Add Quiz'}</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    aria-label="Close" 
                    onClick={handleCloseModal}
                    disabled={saving}
                  ></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
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
                        rows="2"
                        required
                        disabled={saving}
                      />
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Start Date *</label>
                        <input 
                          name="startDate" 
                          value={form.startDate} 
                          onChange={handleChange} 
                          type="date" 
                          className="form-control" 
                          required
                          disabled={saving}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Start Time (HH:MM) *</label>
                        <input 
                          name="startTime" 
                          value={form.startTime} 
                          onChange={handleChange} 
                          type="time" 
                          className="form-control" 
                          required
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">End Date *</label>
                        <input 
                          name="endDate" 
                          value={form.endDate} 
                          onChange={handleChange} 
                          type="date" 
                          className="form-control" 
                          required
                          disabled={saving}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">End Time (HH:MM) *</label>
                        <input 
                          name="endTime" 
                          value={form.endTime} 
                          onChange={handleChange} 
                          type="time" 
                          className="form-control" 
                          required
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label">Total Duration (Minutes) *</label>
                        <input 
                          name="totalDuration" 
                          value={form.totalDuration} 
                          onChange={handleChange} 
                          type="number" 
                          className="form-control" 
                          min="1"
                          required
                          disabled={saving}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Total Marks *</label>
                        <input 
                          name="totalMarks" 
                          value={form.totalMarks} 
                          onChange={handleChange} 
                          type="number" 
                          className="form-control" 
                          min="1"
                          required
                          disabled={saving}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Level</label>
                        <select 
                          name="level" 
                          value={form.level} 
                          onChange={handleChange}
                          className="form-select"
                          disabled={saving}
                        >
                          <option value="">Select Level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Questions *</h6>
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={addQuestion}
                          disabled={saving}
                        >
                          + Add Question
                        </button>
                      </div>

                      {form.questions.length === 0 ? (
                        <div className="alert alert-info" role="alert">
                          No questions added yet. Click "Add Question" to get started.
                        </div>
                      ) : (
                        form.questions.map((question, qIndex) => (
                          <div key={qIndex} className="card mb-3">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <h6 className="card-title mb-0">Question {qIndex + 1}</h6>
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeQuestion(qIndex)}
                                  disabled={saving}
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="mb-2">
                                <label className="form-label form-label-sm">Question Text *</label>
                                <input 
                                  type="text" 
                                  value={question.questionText} 
                                  onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                  className="form-control form-control-sm" 
                                  placeholder="Enter question"
                                  disabled={saving}
                                />
                              </div>

                              <div className="mb-2">
                                <label className="form-label form-label-sm">Time Limit (seconds) *</label>
                                <input 
                                  type="number" 
                                  value={question.timeLimit} 
                                  onChange={(e) => handleQuestionChange(qIndex, 'timeLimit', parseInt(e.target.value))}
                                  className="form-control form-control-sm" 
                                  min="5"
                                  placeholder="Minimum 5 seconds"
                                  disabled={saving}
                                />
                              </div>

                              <div className="mb-2">
                                <label className="form-label form-label-sm">Options (All 4 required) *</label>
                                {question.options.map((option, oIndex) => (
                                  <input 
                                    key={oIndex}
                                    type="text" 
                                    value={option} 
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                    className="form-control form-control-sm mb-2" 
                                    placeholder={`Option ${oIndex + 1}`}
                                    disabled={saving}
                                  />
                                ))}
                              </div>

                              <div className="mb-2">
                                <label className="form-label form-label-sm">Correct Answer Index (0-3) *</label>
                                <input 
                                  type="number" 
                                  value={question.correctAnswer} 
                                  onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', parseInt(e.target.value))}
                                  className="form-control form-control-sm" 
                                  min="0"
                                  max="3"
                                  disabled={saving}
                                />
                                <small className="text-muted">0 = Option 1, 1 = Option 2, 2 = Option 3, 3 = Option 4</small>
                              </div>
                            </div>
                          </div>
                        ))
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
                        {selectedQuiz ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      selectedQuiz ? 'Update Quiz' : 'Create Quiz'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rankings Modal */}
      {isRankingsModalOpen && rankingsData && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '1200px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Quiz Rankings: {rankingsData.quiz.title}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    aria-label="Close" 
                    onClick={handleCloseRankingsModal}
                  ></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {/* Statistics Summary */}
                  <div className="row mb-4">
                    <div className="col-md-3">
                      <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                          <h6 className="card-title">Total Participants</h6>
                          <h3>{rankingsData.statistics.totalParticipants}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-success text-white">
                        <div className="card-body text-center">
                          <h6 className="card-title">Average Score</h6>
                          <h3>{rankingsData.statistics.averageScore}%</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-info text-white">
                        <div className="card-body text-center">
                          <h6 className="card-title">Highest Score</h6>
                          <h3>{rankingsData.statistics.highestScore}%</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-warning text-dark">
                        <div className="card-body text-center">
                          <h6 className="card-title">Avg. Time</h6>
                          <h3>{rankingsData.statistics.averageTimeSpentMinutes} min</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rankings Table */}
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ width: 60 }}>Rank</th>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th className="text-center">Score (%)</th>
                          <th className="text-center">Marks</th>
                          <th className="text-center">Correct</th>
                          <th className="text-center">Wrong</th>
                          <th className="text-center">Accuracy</th>
                          <th className="text-center">Time (min)</th>
                          <th>Completed At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankingsData.rankings.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="text-center py-4">
                              No participants yet
                            </td>
                          </tr>
                        ) : (
                          rankingsData.rankings.map((ranking) => (
                            <tr key={ranking.studentId}>
                              <td>
                                <strong className={`badge ${
                                  ranking.rank === 1 ? 'bg-warning text-dark' : 
                                  ranking.rank === 2 ? 'bg-secondary' : 
                                  ranking.rank === 3 ? 'bg-bronze' : 
                                  'bg-light text-dark'
                                }`}>
                                  {ranking.rank === 1 ? '🥇' : 
                                   ranking.rank === 2 ? '🥈' : 
                                   ranking.rank === 3 ? '🥉' : 
                                   `#${ranking.rank}`}
                                </strong>
                              </td>
                              <td>
                                <div className="fw-semibold">{ranking.studentName}</div>
                              </td>
                              <td>
                                <small className="text-muted">{ranking.studentEmail}</small>
                              </td>
                              <td className="text-center">
                                <span className={`badge ${
                                  ranking.score >= 90 ? 'bg-success' :
                                  ranking.score >= 70 ? 'bg-primary' :
                                  ranking.score >= 50 ? 'bg-warning text-dark' :
                                  'bg-danger'
                                }`}>
                                  {ranking.score}%
                                </span>
                              </td>
                              <td className="text-center">
                                {ranking.marksObtained}/{ranking.totalMarks}
                              </td>
                              <td className="text-center">
                                <span className="badge bg-success">{ranking.correctAnswers}</span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-danger">{ranking.wrongAnswers}</span>
                              </td>
                              <td className="text-center">
                                {ranking.accuracy}%
                              </td>
                              <td className="text-center">
                                {ranking.timeSpentMinutes}
                              </td>
                              <td>
                                <small>{new Date(ranking.completedAt).toLocaleString()}</small>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseRankingsModal}
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
