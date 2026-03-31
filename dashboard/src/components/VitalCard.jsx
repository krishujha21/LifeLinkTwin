/**
 * LifeLink Twin — VitalCard Component
 * Displays a single vital sign with value, unit, label, trend sparkline,
 * and animated status border (pulse on warning, strong pulse on critical).
 */

import { useEffect, useRef } from 'react';
import { COLORS, statusColor, vitalStatus } from '../utils/riskUtils';

/**
 * @param {string}  metricKey   - 'heartRate' | 'spo2' | 'temperature' | 'systolic' | 'diastolic'
 * @param {number}  value       - Current reading
 * @param {string}  label       - Display label (e.g. "Heart Rate")
 * @param {string}  unit        - e.g. "bpm", "%", "°C"
 * @param {string}  icon        - Emoji icon
 * @param {number[]} sparkdata  - Last N readings for the mini sparkline
 * @param {string}  status      - Override status ('normal' | 'warning' | 'critical')
 */
export default function VitalCard({
    metricKey,
    value,
    label,
    unit,
    icon,
    sparkdata = [],
    status: statusProp,
}) {
    const canvasRef  = useRef(null);
    const status     = statusProp ?? (value != null ? vitalStatus(metricKey, value) : 'normal');
    const color      = statusColor(status);
    const isNull     = value == null;

    // ── Sparkline canvas renderer ─────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || sparkdata.length < 2) return;

        const ctx    = canvas.getContext('2d');
        const W      = canvas.width;
        const H      = canvas.height;
        const data   = sparkdata.filter(v => v != null);
        if (data.length < 2) return;

        ctx.clearRect(0, 0, W, H);

        const minV = Math.min(...data);
        const maxV = Math.max(...data);
        const range = maxV - minV || 1;

        const xStep = (W - 4) / (data.length - 1);
        const yPos  = (v) => H - 4 - ((v - minV) / range) * (H - 8);

        // Gradient fill
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, `${color}44`);
        grad.addColorStop(1, `${color}00`);

        ctx.beginPath();
        ctx.moveTo(2, yPos(data[0]));
        data.forEach((v, i) => {
            if (i === 0) return;
            ctx.lineTo(2 + i * xStep, yPos(v));
        });
        ctx.lineTo(2 + (data.length - 1) * xStep, H);
        ctx.lineTo(2, H);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(2, yPos(data[0]));
        data.forEach((v, i) => {
            if (i === 0) return;
            ctx.lineTo(2 + i * xStep, yPos(v));
        });
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.lineJoin    = 'round';
        ctx.stroke();

        // Last point dot
        const lastX = 2 + (data.length - 1) * xStep;
        const lastY = yPos(data[data.length - 1]);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }, [sparkdata, color]);

    // ── Animation class via CSS keyframes (defined in styles.css / global) ────
    // We inject a style tag once — safe since it's idempotent
    useEffect(() => {
        if (document.getElementById('ll-vital-keyframes')) return;
        const style = document.createElement('style');
        style.id = 'll-vital-keyframes';
        style.textContent = `
            @keyframes ll-warning-pulse {
                0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
                50%      { box-shadow: 0 0 0 6px rgba(245,158,11,0.25); }
            }
            @keyframes ll-critical-pulse {
                0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); border-color: #ef4444; }
                50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0.3); border-color: #ff6b6b; }
            }
            @keyframes ll-heartbeat {
                0%,100% { transform: scale(1); }
                10%     { transform: scale(1.15); }
                20%     { transform: scale(1); }
                30%     { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }, []);

    const animationMap = {
        warning:  'll-warning-pulse 2s ease-in-out infinite',
        critical: 'll-critical-pulse 1s ease-in-out infinite',
        normal:   'none',
    };

    // ── Card styles ───────────────────────────────────────────────────────────
    const cardStyle = {
        background:   COLORS.card,
        border:       `1px solid ${color}`,
        borderRadius: '12px',
        padding:      '20px',
        fontFamily:   '"Inter", sans-serif',
        position:     'relative',
        overflow:     'hidden',
        animation:    animationMap[status],
        transition:   'border-color 0.4s ease',
        minWidth:     0,
    };

    const valueStyle = {
        fontSize:   isNull ? '28px' : '36px',
        fontWeight: 800,
        color:      isNull ? COLORS.muted : color,
        lineHeight:  1,
        letterSpacing: '-0.02em',
        animation:  metricKey === 'heartRate' && status !== 'normal'
            ? 'll-heartbeat 1s ease infinite'
            : 'none',
    };

    return (
        <div style={cardStyle}>
            {/* Top row — icon + label */}
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '12px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{icon}</span>
                    <span style={{ color: COLORS.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {label}
                    </span>
                </div>
                {/* Status badge */}
                <span style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: color,
                    background: `${color}18`, padding: '2px 8px', borderRadius: '10px',
                }}>
                    {status}
                </span>
            </div>

            {/* Value + unit */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '14px' }}>
                <span style={valueStyle}>{isNull ? '--' : value}</span>
                <span style={{ color: COLORS.muted, fontSize: '14px', fontWeight: 500 }}>{unit}</span>
            </div>

            {/* Sparkline canvas */}
            <canvas
                ref={canvasRef}
                width={200}
                height={40}
                style={{ width: '100%', height: '40px', display: 'block' }}
            />

            {/* Subtle glow overlay on critical */}
            {status === 'critical' && (
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: `radial-gradient(ellipse at 50% 100%, ${COLORS.critical}10 0%, transparent 70%)`,
                }} />
            )}
        </div>
    );
}
