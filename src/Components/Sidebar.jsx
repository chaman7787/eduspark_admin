import React from 'react';
import { RiDashboardLine, RiTeamLine, RiUserLine, RiBookLine, RiFileList3Line, RiLogoutBoxLine, RiWalletLine, RiShieldCheckLine, RiQuestionnaireLine, RiFeedbackLine, RiVideoLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { logout, adminData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="sidebar bg-dark text-white" style={{ minHeight: '100vh', width: '250px', padding: '20px', position: 'relative' }}>
      {/* EduSpark Logo */}
      <div className="text-center mb-3">
        <img 
          src="/logo.png" 
          alt="EduSpark" 
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 20px rgba(0, 173, 239, 0.5)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.3))'
          }}
        />
      </div>
      <h3 className="text-center mb-4" style={{
        background: 'linear-gradient(135deg, #00ADEF, #FFA500)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        fontSize: '1.3rem'
      }}>
        {adminData?.name || adminData?.email?.split('@')[0] || 'Admin'}
      </h3>
      
      {adminData && (
        <div className="admin-profile mb-4 pb-3 border-bottom border-secondary">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00ADEF, #FFA500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: 'white',
              boxShadow: '0 0 20px rgba(0, 173, 239, 0.4), 0 0 40px rgba(255, 165, 0, 0.3)',
              flexShrink: 0
            }}>
              {getInitials(adminData.name || adminData.email)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="mb-0 fw-bold text-truncate" style={{
                background: 'linear-gradient(135deg, #00ADEF, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '1rem'
              }}>
                {adminData.name || adminData.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="mb-0 small text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                {adminData.email}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <nav className="nav flex-column">
        <Link to="/" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 173, 239, 0.15)';
          e.currentTarget.style.borderLeft = '3px solid #00ADEF';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiDashboardLine className="me-2" size={20} /> Dashboard
        </Link>
        <Link to="/teachers" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 173, 239, 0.15)';
          e.currentTarget.style.borderLeft = '3px solid #00ADEF';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiTeamLine className="me-2" size={20} /> Teachers
        </Link>
        <Link to="/students" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
          e.currentTarget.style.borderLeft = '3px solid #10B981';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiUserLine className="me-2" size={20} /> Students
        </Link>
        <Link to="/courses" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 165, 0, 0.15)';
          e.currentTarget.style.borderLeft = '3px solid #FFA500';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiBookLine className="me-2" size={20} /> Courses
        </Link>
        <Link to="/videos" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
          e.currentTarget.style.borderLeft = '3px solid #3B82F6';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiVideoLine className="me-2" size={20} /> Videos
        </Link>
        <Link to="/test" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
          e.currentTarget.style.borderLeft = '3px solid #8B5CF6';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiFileList3Line className="me-2" size={20} /> Test
        </Link>
        <Link to="/withdrawals" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
          e.currentTarget.style.borderLeft = '3px solid #ffd700';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiWalletLine className="me-2" size={20} /> Withdrawals
        </Link>
        <Link to="/kyc" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
          e.currentTarget.style.borderLeft = '3px solid #10B981';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiShieldCheckLine className="me-2" size={20} /> KYC Verification
        </Link>
        <Link to="/support" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 173, 239, 0.15)';
          e.currentTarget.style.borderLeft = '3px solid #00ADEF';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiQuestionnaireLine className="me-2" size={20} /> Support & Help
        </Link>
        <Link to="/feedback" className="nav-link text-white mb-3" style={{
          transition: 'all 0.3s',
          borderRadius: '8px',
          padding: '10px 15px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 215, 0, 0.15)';
          e.currentTarget.style.borderLeft = '3px solid #FFD700';
          e.currentTarget.style.paddingLeft = '12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderLeft = 'none';
          e.currentTarget.style.paddingLeft = '15px';
        }}>
          <RiFeedbackLine className="me-2" size={20} /> Feedback
        </Link>
        <button 
          onClick={handleLogout} 
          className="nav-link text-white mb-3 border-0 bg-transparent d-flex align-items-center"
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.3s',
            borderRadius: '8px',
            padding: '10px 15px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.borderLeft = '3px solid #EF4444';
            e.currentTarget.style.paddingLeft = '12px';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderLeft = 'none';
            e.currentTarget.style.paddingLeft = '15px';
          }}
        >
          <RiLogoutBoxLine className="me-2" size={20} /> Logout
        </button>
      </nav>
    </div>
  );
};
