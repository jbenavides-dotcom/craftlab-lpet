import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Lock, CircleDashed, FlaskConical, Star } from 'lucide-react';
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
    Icon: React.ElementType;
    iconColor: string;
    iconGradient: string;
}

const TANKS: Tank[] = [
    {
        id: 'closed',
        label: 'Closed Tank',
        description: 'Sealed — no oxygen exchange',
        isCorrect: true,
        Icon: Lock,
        iconColor: '#9d174d',
        iconGradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
    },
    {
        id: 'open',
        label: 'Open Tank',
        description: 'Exposed — oxygen flows freely',
        isCorrect: false,
        Icon: CircleDashed,
        iconColor: '#1D4ED8',
        iconGradient: 'linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)',
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
            colors: ['#c1004a', '#1D4ED8', '#10B981', '#ffffff'],
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
        ghost.className = 'qz-tank-ghost';
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
        if (tank) createGhost(tank.label, touch.clientX, touch.clientY);
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
        <div className="qz-container">
            {success ? (
                <div className="qz-success-wrap">
                    <div className="qz-success-check">
                        <CheckCircle size={48} color="#ffffff" />
                    </div>
                    <h1 className="qz-success-title">Congratulations!</h1>
                    <p className="qz-success-text">You're now a certified CraftLab Creator.</p>
                    <div className="qz-success-badge">
                        <Star size={14} color="#c1004a" />
                        <span>CraftLab access unlocked</span>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header compacto */}
                    <div className="qz-header">
                        <h1 className="qz-title">Final Check</h1>
                        <p className="qz-subtitle">One last question before unlock</p>
                    </div>

                    {/* Quiz card */}
                    <div className="qz-card fade-in">
                        <p className="qz-question">
                            Which tank produces anaerobic fermentation?
                        </p>
                        <p className="qz-hint">Drag the correct tank into the cup</p>

                        {keyboardSelected && (
                            <p className="qz-keyboard-hint" role="status">
                                <strong>{TANKS.find((t) => t.id === keyboardSelected)?.label}</strong> selected.
                                Press Enter on the cup to drop it.
                            </p>
                        )}

                        {/* Draggable tanks */}
                        <div className="qz-tanks-row" role="group" aria-label="Fermentation tanks">
                            {TANKS.map((tank) => (
                                <div
                                    key={tank.id}
                                    className={[
                                        'qz-tank',
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
                                    <div
                                        className="qz-tank-icon"
                                        style={{ background: tank.iconGradient }}
                                        aria-hidden="true"
                                    >
                                        <tank.Icon size={28} color={tank.iconColor} />
                                    </div>
                                    <span className="qz-tank-label">{tank.label}</span>
                                    <span className="qz-tank-desc">{tank.description}</span>
                                </div>
                            ))}
                        </div>

                        {/* Drop zone */}
                        <div
                            ref={dropZoneRef}
                            className={['qz-dropzone', isDropZoneOver ? 'is-over' : '']
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
                            <div className="qz-dropzone-icon" aria-hidden="true">
                                <FlaskConical size={28} color="#047857" />
                            </div>
                            <span className="qz-dropzone-label">
                                {isDropZoneOver ? 'Release to drop!' : 'Drop here'}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
