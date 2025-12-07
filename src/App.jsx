import { Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import { Sidebar } from './Components/Sidebar'
import Dashboard from './Components/Dashboard'
import { Teachers } from './Components/Teachers'
import { Students } from './Components/Students'
import { Courses } from './Components/Courses'
import Login from './Components/Login'
import ProtectedRoute from './Components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { Test } from './Components/Test'

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path='/login' element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      <Route path='/' element={
        <ProtectedRoute>
          <div className='row'>
            <div className='col-lg-3 col-sm-12 col-md-3'>
              <Sidebar/>
            </div>
            <div className='col-lg-9 col-sm-12 col-md-9'>
              <Dashboard/>
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path='/teachers' element={
        <ProtectedRoute>
          <div className='row'>
            <div className='col-lg-3 col-sm-12 col-md-3'>
              <Sidebar/>
            </div>
            <div className='col-lg-9 col-sm-12 col-md-9'>
              <Teachers/>
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path='/students' element={
        <ProtectedRoute>
          <div className='row'>
            <div className='col-lg-3 col-sm-12 col-md-3'>
              <Sidebar/>
            </div>
            <div className='col-lg-9 col-sm-12 col-md-9'>
              <Students/>
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path='/courses' element={
        <ProtectedRoute>
          <div className='row'>
            <div className='col-lg-3 col-sm-12 col-md-3'>
              <Sidebar/>
            </div>
            <div className='col-lg-9 col-sm-12 col-md-9'>
              <Courses/>
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path='/test' element={
        <ProtectedRoute>
          <div className='row'>
            <div className='col-lg-3 col-sm-12 col-md-3'>
              <Sidebar/>
            </div>
            <div className='col-lg-9 col-sm-12 col-md-9'>
              <Test/>
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path='*' element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
