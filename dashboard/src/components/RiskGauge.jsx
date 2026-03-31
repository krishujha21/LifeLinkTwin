/**
 * LifeLink Twin — RiskGauge Component
 * Circular SVG arc gauge showing risk score 0–100.
 * Smooth animated arc transition, color shifts with risk level.
 */

import { useEffect, useRef, useState } from 'react';
import { COLORS, describeArc, riskLabel, riskScoreToStatus, statusColor } from '../utils/riskUtils';

// Inject keyframes once
function injectKeyframes() {
    if (document.getElementById('ll-gauge-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'll-gauge-keyframes';
    style.textContent = `
        @keyframes ll-gauge-appear {
            from { stroke-dashoffset: 300; opacity: 0; }
            to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        @keyframes ll-risk-glow-critical {
            0%,100% { filter: drop-shadow(0 0 4px #ef444466); }
            50%     { filter: drop-shadow(0 0 12px #ef4444aa); }
        }
        @keyframes ll-risk-glow-warning {
            0%,100% { filter: drop-shadow(0 0 3px #f59e0b44); }
            50%     { filter: drop-shadow(0 0 8px #f59e0b88); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * @param {number}  score        - 0–100 risk score
 * @param {number}  size         - SVG size in px (default 200)
 * @param {boolean} compact      - Smaller label text for sidebar usage
 */
export default function RiskGauge({ score = 0, size = 200, compact = false }) {
    const [displayScore, setDisplayScore] = useState(0);
    const prevScore = useRef(0);
    const rafRef    = useRef(null);

    useEffect(() => {
        injectKeyframes();
    }, []);

    // Smooth animated count-up/down toward target score
    useEffect(() => {
        const start    = prevScore.current;
        const end      = Math.min(100, Math.max(0, score));
        const duration = 800; // ms
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = Math.round(start + (end - start) * eased);
            setDisplayScore(current);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                prevScore.current = end;
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [score]);

    const status = riskScoreToStatus(displayScore);
    const color  = statusColor(status);
    const label  = riskLabel(displayScore);

    // SVG geometry
    const cx        = size / 2;
    const cy        = size / 2;
    const r         = size * 0.38;
    const startDeg  = 135;
    const totalDeg  = 270;
    const strokeW   = size * 0.065;

    // Background track arc (full 270°)
    const trackPath = describeArc(100, r, cx, cy, startDeg, totalDeg);
    // Value arc
    const valuePath = describeArc(displayScore, r, cx, cy, startDeg, totalDeg);

    // Glow animation for non-normal status
    const glowAnim = status === 'critical'
        ? 'll-risk-glow-critical 1.5s ease-in-out infinite'
        : status === 'warning'
        ? 'll-risk-glow-warning 2s ease-in-out infinite'
        : 'none';

    // Score color zones: tick marks at 25 and 61
    const zone1Path = describeArc(25,  r * 0.88, cx, cy, startDeg, totalDeg); // safe→warning line
    const zone2Path = describeArc(61,  r * 0.88, cx, cy, startDeg, totalDeg); // warning→critical line

    return (
        <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            fontFamily:     '"Inter", sans-serif',
            background:     COLORS.card,
            border:         `1px solid ${color}55`,
            borderRadius:   '12px',
            padding:        compact ? '16px' : '24px',
            transition:     'border-color 0.4s ease',
        }}>
            <div style={{
                color:      COLORS.muted,
                fontSize:   compact ? '11px' : '12px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '8px',
            }}>
                Risk Score
            </div>

            {/* SVG Gauge */}
            <svg
                width={size}
                height={size * 0.72}
                viewBox={`0 0 ${size} ${size}`}
                style={{
                    overflow: 'visible',
                    animation: glowAnim,
                }}
            >
                {/* Background track */}
                <path
                    d={trackPath}
                    fill="none"
                    stroke={COLORS.border}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                />

                {/* Colored value arc */}
                {displayScore > 0 && (
                    <path
                        d={valuePath}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeW}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke 0.4s ease',
                            filter:     status !== 'normal' ? `drop-shadow(0 0 4px ${color}88)` : 'none',
                        }}
                    />
                )}

                {/* Zone divider tick — warning at 25 */}
                <circle
                    cx={cx + (r * 0.88) * Math.cos((startDeg + totalDeg * 0.25) * Math.PI / 180)}
                    cy={cy + (r * 0.88) * Math.sin((startDeg + totalDeg * 0.25) * Math.PI / 180)}
                    r={strokeW * 0.35}
                    fill={COLORS.warning}
                    opacity={0.7}
                />
                {/* Zone divider tick — critical at 61 */}
                <circle
                    cx={cx + (r * 0.88) * Math.cos((startDeg + totalDeg * 0.61) * Math.PI / 180)}
                    cy={cy + (r * 0.88) * Math.sin((startDeg + totalDeg * 0.61) * Math.PI / 180)}
                    r={strokeW * 0.35}
                    fill={COLORS.critical}
                    opacity={0.7}
                />

                {/* Center score text */}
                <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={color}
                    fontSize={size * 0.22}
                    fontWeight={800}
                    fontFamily='"Inter", sans-serif'
                    style={{ transition: 'fill 0.4s ease' }}
                >
                    {displayScore}
                </text>
                <text
                    x={cx}
                    y={cy + size * 0.12}
                    textAnchor="middle"
                    fill={COLORS.muted}
                    fontSize={size * 0.07}
                    fontFamily='"Inter", sans-serif'
                >
                    / 100
                </text>
            </svg>

            {/* Risk label */}
            <div style={{
                color:       color,
                fontWeight:  700,
                fontSize:    compact ? '13px' : '15px',
                marginTop:   '4px',
                letterSpacing: '0.02em',
                transition:  'color 0.4s ease',
            }}>
                {label}
            </div>

            {/* Zone legend */}
            {!compact && (
                <div style={{
                    display:       'flex',
                    gap:           '12px',
                    marginTop:     '12px',
                    fontSize:      '10px',
                    color:         COLORS.muted,
                }}>
                    <span style={{ color: COLORS.normal }}>● 0–24 Safe</span>
                    <span style={{ color: COLORS.warning }}>● 25–60 Moderate</span>
                    <span style={{ color: COLORS.critical }}>● 61+ High</span>
                </div>
            )}
        </div>
    );
}
