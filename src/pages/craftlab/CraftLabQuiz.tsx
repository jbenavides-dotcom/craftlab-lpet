import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import './CraftLabQuiz.css';
import confetti from 'canvas-confetti';
import { unlockCraftLab } from '../../lib/user-progress';

// ─── Types ────────────────────────────────────────────────────────────────────

type TankId = 'closed' | 'open';

interface Tank {
    id: TankId;
    label: string;
    description: string;
    isCorrect: boolean;
    emoji: string; // simple visual — no SVG inline
}

const TANKS: Tank[] = [
    {
        id: 'closed',
        label: 'Closed Tank',
        description: 'Sealed — no oxygen exchange',
        isCorrect: true,
        emoji: '🔒',
    },
    {
        id: 'open',
        label: 'Open Tank',
        description: 'Exposed — oxygen flows freely',
        isCorrect: false,
        emoji: '🪣',
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const CraftLabQuiz: React.FC = () => {
    const navigate = useNavigate();

    // UI state
    const [success, setSuccess] = useState(false);
    const [wrongId, setWrongId] = useState<TankId | null>(null);
    const [isDraggingId, setIsDraggingId] = useState<TankId | null>(null);
    const [isDropZoneOver, setIsDropZoneOver] = useState(false);

    // Keyboard-accessible selection
    const [keyboardSelected, setKeyboardSelected] = useState<TankId | null>(null);

    // Touch drag refs
    const touchDragIdRef = useRef<TankId | null>(null);
    const touchGhostRef = useRef<HTMLDivElement | null>(null);
    const dropZoneRef = useRef<HTMLDivElement | null>(null);

    // ── Correct answer logic ──────────────────────────────────────────────────

    const handleCorrectDrop = useCallback(async () => {
        setSuccess(true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#E85A7A', '#0A1E3F', '#ffffff'],
        });
        await unlockCraftLab();
        setTimeout(() => navigate('/craftlab/welcome'), 2800);
    }, [navigate]);

    const handleWrongDrop = useCallback((id: TankId) => {
        setWrongId(id);
        setTimeout(() => setWrongId(null), 600);
    }, []);

    const resolveDrop = useCallback(
        (droppedId: TankId) => {
            const tank = TANKS.find((t) => t.id === droppedId);
            if (!tank) return;
            if (tank.isCorrect) {
                handleCorrectDrop();
            } else {
                handleWrongDrop(droppedId);
            }
        },
        [handleCorrectDrop, handleWrongDrop],
    );

    // ── HTML5 Drag & Drop (mouse / pointer) ───────────────────────────────────

    const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: TankId) => {
        e.dataTransfer.setData('tankId', id);
        e.dataTransfer.effectAllowed = 'move';
        setIsDraggingId(id);
    };

    const onDragEnd = () => {
        setIsDraggingId(null);
        setIsDropZoneOver(false);
    };

    const onDragOverZone = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDropZoneOver(true);
    };

    const onDragLeaveZone = () => {
        setIsDropZoneOver(false);
    };

    const onDropZone = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDropZoneOver(false);
        setIsDraggingId(null);
        const droppedId = e.dataTransfer.getData('tankId') as TankId;
        resolveDrop(droppedId);
    };

    // ── Touch events (mobile) ─────────────────────────────────────────────────

    const createGhost = (label: string, x: number, y: number) => {
        const ghost = document.createElement('div');
        ghost.className = 'quiz-tank-ghost';
        ghost.textContent = label;
        ghost.style.left = `${x - 60}px`;
        ghost.style.top = `${y - 40}px`;
        document.body.appendChild(ghost);
        touchGhostRef.current = ghost;
    };

    const removeGhost = () => {
        if (touchGhostRef.current) {
            touchGhostRef.current.remove();
            touchGhostRef.current = null;
        }
    };

    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>, id: TankId) => {
        touchDragIdRef.current = id;
        const touch = e.touches[0];
        const tank = TANKS.find((t) => t.id === id);
        if (tank) createGhost(`${tank.emoji} ${tank.label}`, touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault(); // prevent page scroll while dragging
        const touch = e.touches[0];
        if (touchGhostRef.current) {
            touchGhostRef.current.style.left = `${touch.clientX - 60}px`;
            touchGhostRef.current.style.top = `${touch.clientY - 40}px`;
        }
        // Highlight drop zone when finger is over it
        const dropZone = dropZoneRef.current;
        if (dropZone) {
            const rect = dropZone.getBoundingClientRect();
            const over =
                touch.clientX >= rect.left &&
                touch.clientX <= rect.right &&
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom;
            setIsDropZoneOver(over);
        }
    };

    const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        removeGhost();
        setIsDropZoneOver(false);
        const touch = e.changedTouches[0];
        const dropZone = dropZoneRef.current;
        const draggedId = touchDragIdRef.current;
        touchDragIdRef.current = null;

        if (!draggedId || !dropZone) return;

        const rect = dropZone.getBoundingClientRect();
        const inside =
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom;

        if (inside) resolveDrop(draggedId);
    };

    // ── Keyboard accessibility ────────────────────────────────────────────────

    const onTankKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, id: TankId) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setKeyboardSelected((prev) => (prev === id ? null : id));
        }
    };

    const onDropZoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if ((e.key === 'Enter' || e.key === ' ') && keyboardSelected) {
            e.preventDefault();
            resolveDrop(keyboardSelected);
            setKeyboardSelected(null);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

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
                        Which tank produces anaerobic fermentation? Drag it into the cup.
                    </p>

                    {keyboardSelected && (
                        <p className="quiz-keyboard-hint" role="status">
                            <strong>{TANKS.find((t) => t.id === keyboardSelected)?.label}</strong> selected.
                            Press Enter on the cup to drop it.
                        </p>
                    )}

                    {/* Draggable tanks */}
                    <div className="quiz-tanks-row" role="group" aria-label="Fermentation tanks">
                        {TANKS.map((tank) => (
                            <div
                                key={tank.id}
                                className={[
                                    'quiz-tank',
                                    isDraggingId === tank.id ? 'is-dragging' : '',
                                    wrongId === tank.id ? 'is-wrong' : '',
                                    keyboardSelected === tank.id ? 'is-keyboard-selected' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                draggable
                                tabIndex={0}
                                role="button"
                                aria-grabbed={isDraggingId === tank.id}
                                aria-label={`${tank.label}: ${tank.description}. Press Enter to select.`}
                                onDragStart={(e) => onDragStart(e, tank.id)}
                                onDragEnd={onDragEnd}
                                onTouchStart={(e) => onTouchStart(e, tank.id)}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                                onKeyDown={(e) => onTankKeyDown(e, tank.id)}
                            >
                                <span className="quiz-tank-emoji" aria-hidden="true">
                                    {tank.emoji}
                                </span>
                                <span className="quiz-tank-label">{tank.label}</span>
                                <span className="quiz-tank-desc">{tank.description}</span>
                            </div>
                        ))}
                    </div>

                    {/* Drop zone */}
                    <div
                        ref={dropZoneRef}
                        className={['quiz-drop-zone', isDropZoneOver ? 'is-over' : '']
                            .filter(Boolean)
                            .join(' ')}
                        role="button"
                        tabIndex={keyboardSelected ? 0 : -1}
                        aria-dropeffect="move"
                        aria-label="Drop the correct tank here"
                        onDragOver={onDragOverZone}
                        onDragLeave={onDragLeaveZone}
                        onDrop={onDropZone}
                        onKeyDown={onDropZoneKeyDown}
                    >
                        <span className="quiz-drop-zone-emoji" aria-hidden="true">☕</span>
                        <span className="quiz-drop-zone-label">
                            {isDropZoneOver ? 'Release to drop!' : 'Drop here'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
