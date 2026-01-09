import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { adminAPI } from '../services/api';

export const Withdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [statusFilter, setStatusFilter] = useState('')
    const [actionModal, setActionModal] = useState({ isOpen: false, type: '', withdrawal: null })
    const [formData, setFormData] = useState({ rejectionReason: '', transactionId: '', remarks: '' })
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchWithdrawals();
    }, [currentPage, statusFilter]);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getWithdrawals(currentPage, 10, statusFilter);
            if (response.success) {
                setWithdrawals(response.withdrawals || []);
                if (response.pagination) {
                    setTotalPages(response.pagination.pages || 1);
                }
            } else {
                throw new Error(response.message || 'Failed to fetch withdrawals');
            }
        } catch (err) {
            console.error('Error fetching withdrawals:', err);
            setError(err.message || 'Failed to load withdrawals');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (withdrawal) => {
        if (!window.confirm(`Approve withdrawal request of ₹${withdrawal.amount} from ${withdrawal.userId?.name || withdrawal.userId?.email}?`)) {
            return;
        }
        processWithdrawal(withdrawal._id, 'approve');
    };

    const handleReject = (withdrawal) => {
        setActionModal({ isOpen: true, type: 'reject', withdrawal });
        setFormData({ rejectionReason: '', transactionId: '', remarks: '' });
    };

    const handleComplete = (withdrawal) => {
        setActionModal({ isOpen: true, type: 'complete', withdrawal });
        setFormData({ rejectionReason: '', transactionId: '', remarks: '' });
    };

    const processWithdrawal = async (id, action) => {
        try {
            setProcessing(true);
            setError(null);

            let response;
            if (action === 'approve') {
                response = await adminAPI.approveWithdrawal(id);
            } else if (action === 'reject') {
                response = await adminAPI.rejectWithdrawal(id, formData.rejectionReason);
            } else if (action === 'complete') {
                response = await adminAPI.completeWithdrawal(id, formData.transactionId, formData.remarks);
            }

            if (response && response.success) {
                setActionModal({ isOpen: false, type: '', withdrawal: null });
                setFormData({ rejectionReason: '', transactionId: '', remarks: '' });
                await fetchWithdrawals();
            } else {
                throw new Error(response?.message || `Failed to ${action} withdrawal`);
            }
        } catch (err) {
            console.error(`Error ${action}ing withdrawal:`, err);
            alert(err.message || `Failed to ${action} withdrawal`);
        } finally {
            setProcessing(false);
        }
    };

    const handleModalSubmit = () => {
        if (actionModal.type === 'reject') {
            processWithdrawal(actionModal.withdrawal._id, 'reject');
        } else if (actionModal.type === 'complete') {
            processWithdrawal(actionModal.withdrawal._id, 'complete');
        }
    };

    const handleCloseModal = () => {
        setActionModal({ isOpen: false, type: '', withdrawal: null });
        setFormData({ rejectionReason: '', transactionId: '', remarks: '' });
        setError(null);
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { className: 'bg-warning', text: 'Pending' },
            approved: { className: 'bg-info', text: 'Approved' },
            completed: { className: 'bg-success', text: 'Completed' },
            rejected: { className: 'bg-danger', text: 'Rejected' }
        };
        const badge = badges[status] || { className: 'bg-secondary', text: status };
        return <span className={`badge ${badge.className} text-white`}>{badge.text}</span>;
    };

    const getPaymentMethodLabel = (method) => {
        const labels = {
            bank_transfer: 'Bank Transfer',
            upi: 'UPI',
            paytm: 'Paytm'
        };
        return labels[method] || method;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Withdrawal Requests</h2>
                <div className="d-flex gap-2">
                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button
                        className="btn btn-primary"
                        onClick={fetchWithdrawals}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError(null)}
                    ></button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : withdrawals.length === 0 ? (
                <div className="alert alert-info">
                    No withdrawal requests found.
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Payment Method</th>
                                    <th>Status</th>
                                    <th>Request Date</th>
                                    <th>Processed By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.map((withdrawal) => (
                                    <tr key={withdrawal._id}>
                                        <td>
                                            <div>
                                                <strong>{withdrawal.userId?.name || 'N/A'}</strong>
                                                <br />
                                                <small className="text-muted">{withdrawal.userId?.email || 'N/A'}</small>
                                                <br />
                                                <small className="badge bg-secondary">
                                                    {withdrawal.userId?.role || 'N/A'}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <strong>₹{withdrawal.amount?.toLocaleString('en-IN') || '0'}</strong>
                                        </td>
                                        <td>
                                            {getPaymentMethodLabel(withdrawal.paymentMethod)}
                                            {withdrawal.paymentMethod === 'bank_transfer' && withdrawal.bankDetails && (
                                                <div className="mt-1 small text-muted">
                                                    <div>{withdrawal.bankDetails.bankName}</div>
                                                    <div>{withdrawal.bankDetails.accountNumber?.slice(-4)}</div>
                                                </div>
                                            )}
                                            {withdrawal.paymentMethod === 'upi' && withdrawal.upiId && (
                                                <div className="mt-1 small text-muted">
                                                    {withdrawal.upiId}
                                                </div>
                                            )}
                                        </td>
                                        <td>{getStatusBadge(withdrawal.status)}</td>
                                        <td>{formatDate(withdrawal.createdAt)}</td>
                                        <td>
                                            {withdrawal.processedBy ? (
                                                <div>
                                                    <div>{withdrawal.processedBy?.name || 'N/A'}</div>
                                                    <small className="text-muted">{formatDate(withdrawal.processedAt)}</small>
                                                </div>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1 flex-wrap">
                                                {withdrawal.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleApprove(withdrawal)}
                                                            disabled={processing}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleReject(withdrawal)}
                                                            disabled={processing}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {withdrawal.status === 'approved' && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleComplete(withdrawal)}
                                                        disabled={processing}
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <nav aria-label="Page navigation" className="mt-4">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <li
                                        key={idx + 1}
                                        className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(idx + 1)}
                                        >
                                            {idx + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            )}

            {/* Reject Modal */}
            {actionModal.isOpen && actionModal.type === 'reject' && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reject Withdrawal Request</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    <strong>User:</strong> {actionModal.withdrawal?.userId?.name} ({actionModal.withdrawal?.userId?.email})
                                </p>
                                <p>
                                    <strong>Amount:</strong> ₹{actionModal.withdrawal?.amount?.toLocaleString('en-IN')}
                                </p>
                                <div className="mb-3">
                                    <label htmlFor="rejectionReason" className="form-label">
                                        Rejection Reason <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        id="rejectionReason"
                                        className="form-control"
                                        rows="3"
                                        value={formData.rejectionReason}
                                        onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                                        placeholder="Enter reason for rejection..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleModalSubmit}
                                    disabled={processing || !formData.rejectionReason.trim()}
                                >
                                    {processing ? 'Processing...' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Modal */}
            {actionModal.isOpen && actionModal.type === 'complete' && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Complete Withdrawal</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    <strong>User:</strong> {actionModal.withdrawal?.userId?.name} ({actionModal.withdrawal?.userId?.email})
                                </p>
                                <p>
                                    <strong>Amount:</strong> ₹{actionModal.withdrawal?.amount?.toLocaleString('en-IN')}
                                </p>
                                <p>
                                    <strong>Payment Method:</strong> {getPaymentMethodLabel(actionModal.withdrawal?.paymentMethod)}
                                </p>
                                <div className="mb-3">
                                    <label htmlFor="transactionId" className="form-label">
                                        Transaction ID
                                    </label>
                                    <input
                                        type="text"
                                        id="transactionId"
                                        className="form-control"
                                        value={formData.transactionId}
                                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                        placeholder="Enter transaction/reference ID (optional)"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="remarks" className="form-label">
                                        Remarks
                                    </label>
                                    <textarea
                                        id="remarks"
                                        className="form-control"
                                        rows="3"
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                        placeholder="Enter any additional remarks (optional)"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleModalSubmit}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Mark as Completed'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};










