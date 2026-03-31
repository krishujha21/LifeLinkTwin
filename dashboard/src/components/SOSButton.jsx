/**
 * LifeLink Twin — SOSButton Component
 * Full-width emergency SOS button for the Attendant dashboard.
 * Breathing animation at rest, exploding pulse animation on press.
 * Requires a 3-second hold to confirm (prevents accidental triggers).
 */

import { useEffect, useRef, useState } from 'react';
import { COLORS } from '../utils/riskUtils';

// Inject keyframes once
function injectKeyframes() {
    if (document.getElementById('ll-sos-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'll-sos-keyframes';
    style.textContent = `
        @keyframes ll-sos-breathe {
            0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4), 0 0 20px rgba(239,68,68,0.2); transform: scale(1); }
            50%      { box-shadow: 0 0 0 16px rgba(239,68,68,0), 0 0 40px rgba(239,68,68,0.4); transform: scale(1.02); }
        }
        @keyframes ll-sos-confirmed {
            0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.9); }
            100% { box-shadow: 0 0 0 60px rgba(239,68,68,0); }
        }
        @keyframes ll-sos-sent-pulse {
            0%,100% { opacity: 1; }
            50%     { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
}

const HOLD_DURATION = 3000; // ms to hold before SOS fires

/**
 * @param {function} onSOS       - Called with no args when SOS confirmed
 * @param {boolean}  disabled    - Disable after sent (prevent spam)
 */
export default function SOSButton({ onSOS, disabled = false }) {
    const [holding, setHolding]     = useState(false);
    const [progress, setProgress]   = useState(0);   // 0–100%
    const [sent, setSent]           = useState(false);
    const [cooldown, setCooldown]   = useState(0);   // seconds remaining

    const intervalRef   = useRef(null);
    const startTimeRef  = useRef(null);
    const cooldownRef   = useRef(null);

    useEffect(() => {
        injectKeyframes();
        return () => {
            clearInterval(intervalRef.current);
            clearInterval(cooldownRef.current);
        };
    }, []);

    const startHold = (e) => {
        e.preventDefault();
        if (disabled || sent || cooldown > 0) return;
        setHolding(true);
        startTimeRef.current = Date.now();

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const pct     = Math.min((elapsed / HOLD_DURATION) * 100, 100);
            setProgress(pct);

            if (elapsed >= HOLD_DURATION) {
                clearInterval(intervalRef.current);
                firesSOS();
            }
        }, 50);
    };

    const cancelHold = () => {
        if (sent) return;
        setHolding(false);
        setProgress(0);
        clearInterval(intervalRef.current);
    };

    const firesSOS = () => {
        setSent(true);
        setHolding(false);
        setProgress(100);
        if (onSOS) onSOS();

        // 30-second cooldown
        let remaining = 30;
        setCooldown(remaining);
        cooldownRef.current = setInterval(() => {
            remaining -= 1;
            setCooldown(remaining);
            if (remaining <= 0) {
                clearInterval(cooldownRef.current);
                setSent(false);
                setProgress(0);
                setCooldown(0);
            }
        }, 1000);
    };

    // ── styles ────────────────────────────────────────────────────────────────
    const isActive   = !disabled && !sent && cooldown === 0;
    const btnColor   = sent ? '#7f1d1d' : COLORS.critical;
    const textColor  = sent ? '#fca5a5' : '#ffffff';

    const outerStyle = {
        position:     'relative',
        borderRadius: '14px',
        overflow:     'hidden',
        userSelect:   'none',
        WebkitUserSelect: 'none',
        touchAction:  'none',
    };

    const btnStyle = {
        width:          '100%',
        padding:        '22px 20px',
        border:         `2px solid ${sent ? '#7f1d1d' : COLORS.critical}`,
        borderRadius:   '14px',
        background:     sent
            ? 'rgba(127,29,29,0.3)'
            : holding
            ? `rgba(239,68,68,0.25)`
            : 'rgba(239,68,68,0.12)',
        cursor:         isActive ? 'pointer' : 'not-allowed',
        fontFamily:     '"Inter", sans-serif',
        transition:     'background 0.2s ease, border-color 0.2s ease',
        animation:      isActive && !holding
            ? 'll-sos-breathe 2.5s ease-in-out infinite'
            : sent
            ? 'll-sos-sent-pulse 1.5s ease-in-out infinite'
            : 'none',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            '6px',
        position:       'relative',
        overflow:       'hidden',
    };

    // Progress fill bar at bottom of button
    const progressBarStyle = {
        position:     'absolute',
        bottom:       0,
        left:         0,
        height:       '4px',
        width:        `${progress}%`,
        background:   COLORS.critical,
        boxShadow:    `0 0 8px ${COLORS.critical}`,
        transition:   'width 0.05s linear',
        borderRadius: '0 2px 0 0',
    };

    return (
        <div style={outerStyle}>
            <div
                style={btnStyle}
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                onTouchCancel={cancelHold}
            >
                {/* Progress bar */}
                {holding && <div style={progressBarStyle} />}

                {/* Icon */}
                <div style={{
                    fontSize:   '40px',
                    lineHeight: 1,
                    animation:  holding ? 'none' : 'inherit',
                }}>
                    {sent ? '✅' : '🆘'}
                </div>

                {/* Label */}
                <div style={{
                    color:       textColor,
                    fontSize:    '20px',
                    fontWeight:  900,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                }}>
                    {sent
                        ? 'SOS SENT'
                        : holding
                        ? `Hold… ${Math.round((progress / 100) * 3)}s`
                        : 'SOS Emergency'}
                </div>

                {/* Subtext */}
                <div style={{
                    color:     sent ? '#fca5a5' : 'rgba(255,255,255,0.6)',
                    fontSize:  '12px',
                    fontWeight: 500,
                }}>
                    {cooldown > 0
                        ? `Cooldown: ${cooldown}s before resending`
                        : sent
                        ? 'Doctor has been alerted'
                        : holding
                        ? `Sending in ${(3 - Math.round((progress / 100) * 3))}s…`
                        : 'Hold 3 seconds to send emergency alert'}
                </div>

                {/* Hold progress ring overlay (visual feedback) */}
                {holding && (
                    <svg
                        style={{ position: 'absolute', top: '12px', right: '16px', opacity: 0.7 }}
                        width="32" height="32" viewBox="0 0 32 32"
                    >
                        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                        <circle
                            cx="16" cy="16" r="13"
                            fill="none"
                            stroke={COLORS.critical}
                            strokeWidth="3"
                            strokeDasharray={`${(progress / 100) * 81.7} 81.7`}
                            strokeDashoffset="20.4"
                            strokeLinecap="round"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                        />
                    </svg>
                )}
            </div>
        </div>
    );
}
