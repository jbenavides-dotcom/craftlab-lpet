import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import './Login.css';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showWelcome, setShowWelcome] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we should show the welcome modal on mount
        const hasSeenWelcome = localStorage.getItem('has_seen_welcome_craftlab');
        if (!hasSeenWelcome) {
            setShowWelcome(true);
            localStorage.setItem('has_seen_welcome_craftlab', 'true');
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (data.user) {
                navigate('/home');
            }
        } catch (err: any) {
            setError(err.message || 'Incorrect email or password');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <img src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1739499739/logo_blanco_lgulzv.png" alt="La Palma & El Tucán" className="login-logo" />
            </div>

            <form className="login-form" onSubmit={handleLogin}>
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <div className="login-error">{error}</div>}

                <Button type="submit" variant="primary" size="full" isLoading={isLoading} className="mt-md">
                    Sign In
                </Button>
            </form>

            <div className="login-footer">
                <a href="mailto:info@lapalmayeltucan.com?subject=Application%20for%20CraftLab" className="login-contact-link">
                    Want to participate in CraftLab? Contact us
                </a>
                <p className="login-copyright">Copyright 2025</p>
            </div>

            <Modal
                isOpen={showWelcome}
                onClose={() => setShowWelcome(false)}
                className="welcome-modal"
            >
                <h1 className="welcome-title">
                    Welcome Craft<span className="welcome-highlight">Lab</span>
                </h1>
                <h2 className="welcome-subtitle">Your Coffee Playground</h2>
                <div className="welcome-body">
                    <p>
                        Where Coffee Dreams become reality. We invite you to explore the fascinating world of
                        coffee fermentation and profile creation.
                    </p>
                    <p>
                        Control every step of the process, learn the science behind the beans,
                        and craft a sensory experience that is uniquely yours.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
