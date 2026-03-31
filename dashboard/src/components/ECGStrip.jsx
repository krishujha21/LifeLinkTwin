/**
 * LifeLink Twin — ECGStrip Component
 * Continuously scrolling ECG-style waveform rendered on a canvas.
 * Synthesizes a realistic PQRST waveform shape from the live heart rate.
 */

import { useEffect, useRef } from 'react';
import { COLORS, statusColor } from '../utils/riskUtils';

// One complete PQRST cycle — normalized X [0,1], Y [-0.2, 1.0]
const PQRST_TEMPLATE = [
    [0.00,  0.00],  // baseline start
    [0.10,  0.05],  // P wave start
    [0.15,  0.15],  // P wave peak
    [0.20,  0.05],  // P wave end
    [0.25,  0.00],  // PR segment
    [0.30, -0.10],  // Q
    [0.35,  1.00],  // R peak
    [0.40, -0.12],  // S
    [0.45,  0.00],  // ST segment
    [0.55,  0.10],  // T wave start
    [0.65,  0.20],  // T wave peak
    [0.75,  0.05],  // T wave end
    [0.85,  0.00],  // baseline
    [1.00,  0.00],  // cycle end
];

/**
 * @param {number} heartRate   - BPM (drives scroll speed)
 * @param {string} status      - 'normal' | 'warning' | 'critical'
 * @param {number} height      - Canvas height in px (default 70)
 */
export default function ECGStrip({ heartRate = 72, status = 'normal', height = 70 }) {
    const canvasRef  = useRef(null);
    const offsetRef  = useRef(0);     // horizontal scroll position
    const rafRef     = useRef(null);
    const hrRef      = useRef(heartRate);
    const statusRef  = useRef(status);

    // Keep refs fresh without restarting the animation loop
    useEffect(() => { hrRef.current = heartRate; }, [heartRate]);
    useEffect(() => { statusRef.current = status; }, [status]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // DPI scaling for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = canvas.offsetWidth  * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);

        const W = canvas.offsetWidth;
        const H = canvas.offsetHeight;

        // How many pixels one full PQRST cycle spans (based on BPM)
        // At 60 BPM → 1 cycle/sec. At 30px/sec scroll → 30px/cycle.
        // We scale so 60 BPM ~= 160px cycle width.
        const cycleWidth = () => {
            const bpm = Math.max(30, Math.min(200, hrRef.current || 72));
            return Math.round((60 / bpm) * 140); // 140 px at 60 BPM
        };

        // Scroll speed in px/frame — faster HR → faster scroll
        const scrollSpeed = () => {
            const bpm = Math.max(30, Math.min(200, hrRef.current || 72));
            return (bpm / 60) * 1.8; // ~1.8px/frame at 60 BPM
        };

        // Build waveform sample array for one cycle (interpolated)
        const buildCycle = (cw) => {
            const points = [];
            for (let px = 0; px < cw; px++) {
                const t = px / cw;
                // Find surrounding template points
                let p0 = PQRST_TEMPLATE[0], p1 = PQRST_TEMPLATE[1];
                for (let i = 0; i < PQRST_TEMPLATE.length - 1; i++) {
                    if (t >= PQRST_TEMPLATE[i][0] && t <= PQRST_TEMPLATE[i + 1][0]) {
                        p0 = PQRST_TEMPLATE[i];
                        p1 = PQRST_TEMPLATE[i + 1];
                        break;
                    }
                }
                const localT = p1[0] === p0[0] ? 0 : (t - p0[0]) / (p1[0] - p0[0]);
                // Smooth step
                const smooth = localT * localT * (3 - 2 * localT);
                points.push(p0[1] + (p1[1] - p0[1]) * smooth);
            }
            return points;
        };

        let prevCycleWidth = cycleWidth();
        let cyclePoints    = buildCycle(prevCycleWidth);

        // Draw grid lines (subtle)
        const drawGrid = () => {
            ctx.strokeStyle = `${COLORS.border}88`;
            ctx.lineWidth   = 0.5;
            // Vertical every 40px
            for (let x = 0; x < W; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H);
                ctx.stroke();
            }
            // Horizontal center line
            ctx.beginPath();
            ctx.moveTo(0, H * 0.6);
            ctx.lineTo(W, H * 0.6);
            ctx.stroke();
        };

        const render = () => {
            ctx.clearRect(0, 0, W, H);

            // Dark card background
            ctx.fillStyle = COLORS.card;
            ctx.fillRect(0, 0, W, H);

            drawGrid();

            const cw     = cycleWidth();
            const color  = statusColor(statusRef.current);
            const speed  = scrollSpeed();

            // Rebuild cycle lookup if HR changed significantly
            if (Math.abs(cw - prevCycleWidth) > 2) {
                cyclePoints = buildCycle(cw);
                prevCycleWidth = cw;
            }

            // Neon glow on critical
            if (statusRef.current === 'critical') {
                ctx.shadowColor = color;
                ctx.shadowBlur  = 8;
            } else if (statusRef.current === 'warning') {
                ctx.shadowColor = color;
                ctx.shadowBlur  = 4;
            } else {
                ctx.shadowBlur = 0;
            }

            // Draw waveform across the full canvas width
            ctx.beginPath();
            let started = false;
            const baseline = H * 0.6;
            const amplitude = H * 0.42;

            for (let px = 0; px < W; px++) {
                // Which sample index corresponds to this canvas x, accounting for scroll
                const rawIndex  = (Math.floor(offsetRef.current) + px) % cw;
                const sample    = cyclePoints[(rawIndex + cw) % cw] ?? 0;
                const y         = baseline - sample * amplitude;

                if (!started) { ctx.moveTo(px, y); started = true; }
                else          { ctx.lineTo(px, y); }
            }

            ctx.strokeStyle = color;
            ctx.lineWidth   = 2;
            ctx.lineJoin    = 'round';
            ctx.stroke();
            ctx.shadowBlur  = 0;

            // Leading scan-line dot (bright head)
            const headSample = cyclePoints[Math.floor(offsetRef.current) % cw] ?? 0;
            const headY      = baseline - headSample * amplitude;
            ctx.beginPath();
            ctx.arc(W - 1, headY, 3, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur  = statusRef.current !== 'normal' ? 10 : 4;
            ctx.fill();
            ctx.shadowBlur  = 0;

            // Advance scroll
            offsetRef.current = (offsetRef.current + speed) % cw;

            rafRef.current = requestAnimationFrame(render);
        };

        rafRef.current = requestAnimationFrame(render);

        // Handle resize
        const onResize = () => {
            canvas.width  = canvas.offsetWidth  * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', onResize);
        };
    }, []); // run once — hrRef/statusRef keep it fresh

    return (
        <div style={{
            background:   COLORS.card,
            border:       `1px solid ${COLORS.border}`,
            borderRadius: '12px',
            overflow:     'hidden',
            fontFamily:   '"Inter", sans-serif',
        }}>
            {/* Header */}
            <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '10px 16px 6px',
            }}>
                <span style={{ color: COLORS.muted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    ❤️ ECG Live Feed
                </span>
                <span style={{ color: statusColor(status), fontSize: '11px', fontWeight: 700 }}>
                    {heartRate ? `${heartRate} BPM` : '-- BPM'}
                </span>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                style={{
                    display: 'block',
                    width:   '100%',
                    height:  `${height}px`,
                }}
            />
        </div>
    );
}
