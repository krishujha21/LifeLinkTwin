/**
 * LifeLink Twin — AIAssessmentPanel Component
 * Displays the Groq AI clinical assessment with a typewriter effect.
 * New text triggers a fresh typewriter animation on each update.
 */

import { useEffect, useRef, useState } from 'react';
import { COLORS, formatTime } from '../utils/riskUtils';

// Inject keyframes once
function injectKeyframes() {
    if (document.getElementById('ll-ai-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'll-ai-keyframes';
    style.textContent = `
        @keyframes ll-ai-blink {
            0%,100% { opacity: 1; }
            50%     { opacity: 0; }
        }
        @keyframes ll-ai-slide-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ll-ai-shimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
        }
    `;
    document.head.appendChild(style);
}

const TYPEWRITER_SPEED = 22; // ms per character

/**
 * @param {string}  assessment  - AI text from Groq (triggers typewriter on change)
 * @param {string}  status      - 'normal' | 'warning' | 'critical' (colors the panel)
 * @param {string}  timestamp   - ISO timestamp of last AI update
 * @param {boolean} compact     - Reduced padding for doctor sidebar
 */
export default function AIAssessmentPanel({
    assessment = '',
    status = 'normal',
    timestamp,
    compact = false,
}) {
    const [displayed, setDisplayed]   = useState('');
    const [typing, setTyping]         = useState(false);
    const [updateCount, setUpdateCount] = useState(0);
    const timerRef  = useRef(null);
    const indexRef  = useRef(0);

    useEffect(() => {
        injectKeyframes();
    }, []);

    // Trigger typewriter when assessment text changes
    useEffect(() => {
        if (!assessment) return;

        // Cancel existing typewriter
        clearInterval(timerRef.current);
        indexRef.current = 0;
        setDisplayed('');
        setTyping(true);
        setUpdateCount(prev => prev + 1);

        timerRef.current = setInterval(() => {
            indexRef.current += 1;
            setDisplayed(assessment.slice(0, indexRef.current));

            if (indexRef.current >= assessment.length) {
                clearInterval(timerRef.current);
                setTyping(false);
            }
        }, TYPEWRITER_SPEED);

        return () => clearInterval(timerRef.current);
    }, [assessment]);

    // ── styles ────────────────────────────────────────────────────────────────
    const accentColor = COLORS.ai; // Purple for AI

    const panelStyle = {
        background:   COLORS.card,
        border:       `1px solid ${accentColor}55`,
        borderRadius: '12px',
        padding:      compact ? '14px 16px' : '20px',
        fontFamily:   '"Inter", sans-serif',
        position:     'relative',
        overflow:     'hidden',
        animation:    'll-ai-slide-in 0.4s ease',
    };

    // Subtle purple gradient overlay in top-left corner
    const glowStyle = {
        position:     'absolute',
        top:          0,
        left:         0,
        width:        '160px',
        height:       '60px',
        background:   `radial-gradient(ellipse at 0% 0%, ${accentColor}18 0%, transparent 70%)`,
        pointerEvents: 'none',
    };

    const headerStyle = {
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   '12px',
    };

    const titleStyle = {
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        color:       accentColor,
        fontWeight:  700,
        fontSize:    compact ? '12px' : '13px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    };

    // Animated "AI" badge
    const badgeStyle = {
        padding:      '2px 8px',
        borderRadius: '20px',
        fontSize:     '10px',
        fontWeight:   800,
        letterSpacing: '0.06em',
        background:   `linear-gradient(90deg, ${accentColor}33, ${accentColor}66, ${accentColor}33)`,
        backgroundSize: '200% auto',
        color:        accentColor,
        border:       `1px solid ${accentColor}55`,
        animation:    'll-ai-shimmer 2.5s linear infinite',
    };

    const textStyle = {
        color:       COLORS.text,
        fontSize:    compact ? '13px' : '14px',
        lineHeight:  1.65,
        minHeight:   compact ? '52px' : '64px',
        whiteSpace:  'pre-wrap',
        wordBreak:   'break-word',
    };

    // Blinking cursor
    const cursorStyle = {
        display:        'inline-block',
        width:          '2px',
        height:         '14px',
        background:     accentColor,
        marginLeft:     '2px',
        verticalAlign:  'text-bottom',
        animation:      'll-ai-blink 0.7s step-end infinite',
    };

    const footerStyle = {
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginTop:      '12px',
        paddingTop:     '10px',
        borderTop:      `1px solid ${COLORS.border}`,
    };

    return (
        <div style={panelStyle}>
            {/* Purple glow overlay */}
            <div style={glowStyle} />

            {/* Header */}
            <div style={headerStyle}>
                <div style={titleStyle}>
                    <span style={{ fontSize: '16px' }}>🤖</span>
                    AI Clinical Assessment
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={badgeStyle}>GROQ AI</div>
                    {typing && (
                        <span style={{ color: accentColor, fontSize: '10px', fontWeight: 600 }}>
                            Analyzing…
                        </span>
                    )}
                </div>
            </div>

            {/* Assessment text with typewriter */}
            <div style={textStyle}>
                {displayed || (
                    <span style={{ color: COLORS.muted, fontStyle: 'italic' }}>
                        {assessment
                            ? 'Generating assessment…'
                            : 'Awaiting vitals data. AI assessment will appear when status is warning or critical.'}
                    </span>
                )}
                {typing && <span style={cursorStyle} />}
            </div>

            {/* Footer — timestamp + update count */}
            <div style={footerStyle}>
                <span style={{ color: COLORS.muted, fontSize: '11px' }}>
                    {timestamp ? `Last updated: ${formatTime(timestamp)}` : 'No update yet'}
                </span>
                {updateCount > 0 && (
                    <span style={{
                        color:        accentColor,
                        fontSize:     '11px',
                        fontWeight:   600,
                        background:   `${accentColor}15`,
                        padding:      '2px 8px',
                        borderRadius: '10px',
                    }}>
                        {updateCount} {updateCount === 1 ? 'assessment' : 'assessments'}
                    </span>
                )}
            </div>
        </div>
    );
}
