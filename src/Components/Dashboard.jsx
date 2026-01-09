import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalTests: 0,
        loading: true,
        error: null
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setStats(prev => ({ ...prev, loading: true, error: null }));
            const response = await adminAPI.getDashboardStats();
            
            if (response.success && response.stats) {
                setStats({
                    totalStudents: response.stats.users?.students || 0,
                    totalTeachers: response.stats.users?.teachers || 0,
                    totalTests: response.stats.quizzes?.total || 0,
                    loading: false,
                    error: null
                });
            } else {
                throw new Error(response.message || 'Failed to fetch dashboard statistics');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setStats(prev => ({
                ...prev,
                loading: false,
                error: error.message || 'Failed to load dashboard statistics. Please try again.'
            }));
        }
    };

    const statCards = [
        { id: 1, title: 'Total Students', value: stats.totalStudents, variant: 'primary' },
        { id: 2, title: 'Total Teachers', value: stats.totalTeachers, variant: 'success' },
        { id: 3, title: 'Total Tests', value: stats.totalTests, variant: 'info' },
    ];

    if (stats.loading) {
        return (
            <div className="container py-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (stats.error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger" role="alert">
                    <h5 className="alert-heading">Error Loading Dashboard</h5>
                    <p>{stats.error}</p>
                    <button className="btn btn-danger" onClick={fetchDashboardStats}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="mb-4">Dashboard Overview</h2>
            <div className="row g-3">
                {statCards.map((s) => (
                    <div key={s.id} className="col-12 col-sm-6 col-md-4">
                        <div className={`card text-white bg-${s.variant} h-100`}>
                            <div className="card-body">
                                <h6 className="card-title mb-2">{s.title}</h6>
                                <h2 className="card-text">{s.value.toLocaleString()}</h2>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;