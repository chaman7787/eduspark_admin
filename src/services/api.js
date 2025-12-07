const API_BASE_URL = 'http://localhost:3002/api/admin';

// Helper function to get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('adminToken');
};

// Helper function to get headers with authentication
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API service functions
export const adminAPI = {
  // Admin Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin || {}));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Admin Logout
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  },

  // Get Dashboard Statistics
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid, clear auth
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to fetch dashboard stats');
      }

      return data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Get All Teachers
  getTeachers: async (page = 1, limit = 10, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${API_BASE_URL}/teachers?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to fetch teachers');
      }

      return data;
    } catch (error) {
      console.error('Get teachers error:', error);
      throw error;
    }
  },

  // Get All Students
  getStudents: async (page = 1, limit = 10, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${API_BASE_URL}/students?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to fetch students');
      }

      return data;
    } catch (error) {
      console.error('Get students error:', error);
      throw error;
    }
  },

  // Get All Quizzes/Tests (both teacher and admin created)
  getQuizzes: async (page = 1, limit = 10, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${API_BASE_URL}/quizzes?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to fetch quizzes');
      }

      return data;
    } catch (error) {
      console.error('Get quizzes error:', error);
      throw error;
    }
  },

  // Create Quiz
  createQuiz: async (quizData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(quizData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to create quiz');
      }

      return result;
    } catch (error) {
      console.error('Create quiz error:', error);
      throw error;
    }
  },

  // Update Quiz
  updateQuiz: async (id, quizData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(quizData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to update quiz');
      }

      return result;
    } catch (error) {
      console.error('Update quiz error:', error);
      throw error;
    }
  },

  // Delete Quiz
  deleteQuiz: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to delete quiz');
      }

      return result;
    } catch (error) {
      console.error('Delete quiz error:', error);
      throw error;
    }
  },

  // Update Teacher
  updateTeacher: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to update teacher');
      }

      return result;
    } catch (error) {
      console.error('Update teacher error:', error);
      throw error;
    }
  },

  // Delete Teacher
  deleteTeacher: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to delete teacher');
      }

      return result;
    } catch (error) {
      console.error('Delete teacher error:', error);
      throw error;
    }
  },

  // Update Student
  updateStudent: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to update student');
      }

      return result;
    } catch (error) {
      console.error('Update student error:', error);
      throw error;
    }
  },

  // Delete Student
  deleteStudent: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to delete student');
      }

      return result;
    } catch (error) {
      console.error('Delete student error:', error);
      throw error;
    }
  },

  // Get All Courses
  getCourses: async (page = 1, limit = 10, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${API_BASE_URL}/courses?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to fetch courses');
      }

      return data;
    } catch (error) {
      console.error('Get courses error:', error);
      throw error;
    }
  },

  // Create Course
  createCourse: async (courseData) => {
    try {
      // Check if thumbnail is a file or URL string
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('price', courseData.price.toString());
      
      // Handle thumbnail
      if (courseData.thumbnail instanceof File) {
        formData.append('thumbnail', courseData.thumbnail);
      } else if (courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail); // URL or filename string
      }
      
      // Handle details
      if (courseData.details) {
        if (courseData.details.duration) {
          formData.append('details[duration]', courseData.details.duration);
        }
        if (courseData.details.level) {
          formData.append('details[level]', courseData.details.level);
        }
        if (courseData.details.requirements && Array.isArray(courseData.details.requirements)) {
          courseData.details.requirements.forEach((req, index) => {
            formData.append(`details[requirements][]`, req);
          });
        }
        if (courseData.details.content && Array.isArray(courseData.details.content)) {
          courseData.details.content.forEach((content, index) => {
            formData.append(`details[content][]`, content);
          });
        }
      }
      
      // Handle teacherId if provided
      if (courseData.teacherId) {
        formData.append('teacherId', courseData.teacherId);
      }

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to create course');
      }

      return result;
    } catch (error) {
      console.error('Create course error:', error);
      throw error;
    }
  },

  // Update Course
  updateCourse: async (id, courseData) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      if (courseData.title) formData.append('title', courseData.title);
      if (courseData.description) formData.append('description', courseData.description);
      if (courseData.price !== undefined) {
        formData.append('price', courseData.price.toString());
      }
      
      // Handle thumbnail
      if (courseData.thumbnail instanceof File) {
        formData.append('thumbnail', courseData.thumbnail);
      } else if (courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }
      
      // Handle details
      if (courseData.details) {
        if (courseData.details.duration) {
          formData.append('details[duration]', courseData.details.duration);
        }
        if (courseData.details.level) {
          formData.append('details[level]', courseData.details.level);
        }
        if (courseData.details.requirements && Array.isArray(courseData.details.requirements)) {
          courseData.details.requirements.forEach((req) => {
            formData.append(`details[requirements][]`, req);
          });
        }
        if (courseData.details.content && Array.isArray(courseData.details.content)) {
          courseData.details.content.forEach((content) => {
            formData.append(`details[content][]`, content);
          });
        }
      }
      
      // Handle teacherId if provided
      if (courseData.teacherId) {
        formData.append('teacherId', courseData.teacherId);
      }

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to update course');
      }

      return result;
    } catch (error) {
      console.error('Update course error:', error);
      throw error;
    }
  },

  // Delete Course
  deleteCourse: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(result.message || 'Failed to delete course');
      }

      return result;
    } catch (error) {
      console.error('Delete course error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getToken();
  },

  // Get admin data from localStorage
  getAdminData: () => {
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
  },

  // Get Quiz Attempts
  getQuizAttempts: async (quizId, page = 1, limit = 100) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/attempts?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to fetch quiz attempts');
      }

      return data;
    } catch (error) {
      console.error('Get quiz attempts error:', error);
      throw error;
    }
  },

  // Get Quiz Rankings
  getQuizRankings: async (quizId, limit = 100) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/rankings?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          adminAPI.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Failed to fetch quiz rankings');
      }

      return data;
    } catch (error) {
      console.error('Get quiz rankings error:', error);
      throw error;
    }
  },
};

