import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Leaf, Coffee, TestTube2, Home as HomeIcon, ShoppingBag, Info } from 'lucide-react';
import './FinalSteps.css';
import '../pages/Home.css'; // For bottom nav

export const Orders: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="fb-final-container">
            <header className="fb-final-header">
                <button className="back-btn" onClick={() => navigate('/home')}>
                    <ChevronLeft size={24} />
                </button>
                <span className="fb-final-title">Orders Overview</span>
                <div style={{ width: 24 }}></div>
            </header>

            <main className="fb-final-main" style={{ paddingBottom: '100px' }}>
                <div className="orders-list">
                    {/* Mock Order Card */}
                    <div className="order-card" onClick={() => alert('Order detail navigation to come in future update.')}>
                        <div className="order-header">
                            <span>Created: Oct 24, 2025</span>
                            <span style={{ color: 'var(--color-tan)', fontWeight: 600 }}>Active</span>
                        </div>

                        <div className="order-details">
                            <div className="order-icons">
                                <Calendar size={18} />
                                <Leaf size={18} />
                                <Coffee size={18} />
                                <TestTube2 size={18} />
                            </div>
                            <div className="order-weight">
                                70 Kg
                            </div>
                        </div>

                        <div className="order-progress">
                            <div style={{ position: 'relative' }}>
                                <div className="progress-dot completed"></div>
                                <span className="progress-label">Order</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div className="progress-dot active"></div>
                                <span className="progress-label">Fermentation</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div className="progress-dot"></div>
                                <span className="progress-label">Drying</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div className="progress-dot"></div>
                                <span className="progress-label">Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
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
