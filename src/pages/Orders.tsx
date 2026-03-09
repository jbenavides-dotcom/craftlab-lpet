import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Leaf, Coffee, TestTube2, Home as HomeIcon, ShoppingBag, Info, Package, Loader2 } from 'lucide-react';
import { getUserConfigs, LotConfiguration } from '../lib/lot-config';
import { Button } from '../components/ui/Button';
import './Orders.css';
import './Home.css';

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    processing: 'Processing',
    completed: 'Completed'
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'var(--color-gray-medium)',
    submitted: 'var(--color-tan)',
    processing: 'var(--color-brand-red)',
    completed: 'var(--color-success)'
};

export const Orders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<LotConfiguration[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const configs = await getUserConfigs();
                // Filter out drafts, only show submitted+
                setOrders(configs.filter(c => c.status !== 'draft'));
            } catch (err) {
                console.error('Error loading orders:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, []);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getProgressStep = (status: string) => {
        switch (status) {
            case 'submitted': return 1;
            case 'processing': return 2;
            case 'completed': return 4;
            default: return 0;
        }
    };

    return (
        <div className="fb-final-container">
            <header className="fb-final-header">
                <button className="back-btn" onClick={() => navigate('/home')}>
                    <ChevronLeft size={24} />
                </button>
                <span className="fb-final-title">My Orders</span>
                <div style={{ width: 24 }}></div>
            </header>

            <main className="fb-final-main" style={{ paddingBottom: '100px' }}>
                {isLoading ? (
                    <div className="orders-loading">
                        <Loader2 size={32} className="animate-spin" />
                        <p>Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="orders-empty">
                        <Package size={64} strokeWidth={1} />
                        <h2>No orders yet</h2>
                        <p>Your custom coffee configurations will appear here once submitted.</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/craftlab/onboarding')}
                        >
                            Create Your First Lot
                        </Button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div
                                key={order.id}
                                className="order-card"
                                onClick={() => {/* Future: navigate to order detail */}}
                            >
                                <div className="order-header">
                                    <span>Submitted: {formatDate(order.submitted_at)}</span>
                                    <span style={{ color: STATUS_COLORS[order.status], fontWeight: 600 }}>
                                        {STATUS_LABELS[order.status]}
                                    </span>
                                </div>

                                <div className="order-details">
                                    <div className="order-info">
                                        <p className="order-profile">{order.macro || 'Custom'} Profile</p>
                                        <p className="order-flavor">{order.flavor || 'Custom blend'}</p>
                                    </div>
                                    <div className="order-weight">
                                        {order.quantity || '35kg'}
                                    </div>
                                </div>

                                <div className="order-progress">
                                    {['Order', 'Fermentation', 'Drying', 'Ready'].map((label, idx) => (
                                        <div key={label} style={{ position: 'relative' }}>
                                            <div className={`progress-dot ${
                                                idx < getProgressStep(order.status) ? 'completed' :
                                                idx === getProgressStep(order.status) ? 'active' : ''
                                            }`}></div>
                                            <span className="progress-label">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <nav className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/home')}>
                    <HomeIcon size={24} />
                    <span>Home</span>
                </button>
                <button className="nav-item active">
                    <ShoppingBag size={24} />
                    <span>Orders</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/about')}>
                    <Info size={24} />
                    <span>Us</span>
                </button>
            </nav>
        </div>
    );
};
