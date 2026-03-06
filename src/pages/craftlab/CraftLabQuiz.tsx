import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Wind, FlaskConical } from 'lucide-react';
import './CraftLabQuiz.css';
import confetti from 'canvas-confetti';
import { markEducationAsCompleted } from '../../lib/user-progress';

export const CraftLabQuiz: React.FC = () => {
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);
    const [errorHighlight, setErrorHighlight] = useState<number | null>(null);

    const handleOptionClick = (isCorrect: boolean, index: number) => {
        if (isCorrect) {
            setSuccess(true);
            // Confetti burst
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#e6007e', '#1a2b4c', '#ffffff'] // Brand colors
            });

            // Navigate to the Configurator Welcome after delay
            setTimeout(async () => {
                // Save flag to bypass education next time
                await markEducationAsCompleted();
                navigate('/craftlab/welcome');
            }, 3000);
        } else {
            setErrorHighlight(index);
            setTimeout(() => setErrorHighlight(null), 800);
        }
    };

    return (
        <div className="craftlab-quiz-container">
            {success ? (
                <div className="quiz-success-overlay">
                    <CheckCircle size={80} className="success-icon" />
                    <h1 className="success-title">Congratulations!</h1>
                    <p className="success-text">You are now a certified CraftLab Creator.</p>
                    <div className="spinner-coffee" style={{ marginTop: '20px' }}></div>
                </div>
            ) : (
                <div className="quiz-card fade-in">
                    <h2 className="quiz-title">Knowledge Check</h2>
                    <p className="quiz-question">
                        If your goal is to highlight intense tropical fruit and boozy notes in your coffee,
                        which fermentation environment do you need?
                    </p>

                    <div className="quiz-options">
                        <button
                            className="quiz-option-btn"
                            onClick={() => handleOptionClick(false, 0)}
                            style={{ borderColor: errorHighlight === 0 ? 'red' : undefined }}
                        >
                            <div className="quiz-option-icon">
                                <Wind size={24} />
                            </div>
                            <div className="quiz-option-text">
                                <h4>Open Tank (Aerobic)</h4>
                                <p>Allowing oxygen to flow freely over the cherry</p>
                            </div>
                        </button>

                        <button
                            className="quiz-option-btn"
                            onClick={() => handleOptionClick(true, 1)}
                        >
                            <div className="quiz-option-icon">
                                <FlaskConical size={24} />
                            </div>
                            <div className="quiz-option-text">
                                <h4>Closed Tank (Anaerobic)</h4>
                                <p>Completely removing oxygen to force metabolic stress</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
