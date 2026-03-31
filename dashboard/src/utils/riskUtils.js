/**
 * LifeLink Twin — Risk Utilities
 * Shared helpers across Attendant, Doctor, Hospital dashboards.
 */

// ─── Design tokens (must match master design system) ─────────────────────────
export const COLORS = {
    bg:       '#0a0f1e',
    card:     '#0d1424',
    border:   '#1e2d45',
    text:     '#f0f4ff',
    muted:    '#6b7fa3',
    normal:   '#22c55e',
    warning:  '#f59e0b',
    critical: '#ef4444',
    accent:   '#3b82f6',
    ai:       '#a855f7',
};

// ─── Status helpers ───────────────────────────────────────────────────────────

/**
 * Returns the hex color for a given status string.
 * @param {'normal'|'warning'|'critical'} status
 */
export function statusColor(status) {
    switch (status) {
        case 'critical': return COLORS.critical;
        case 'warning':  return COLORS.warning;
        default:         return COLORS.normal;
    }
}

/**
 * Returns a human-readable label for a status.
 */
export function statusLabel(status) {
    switch (status) {
        case 'critical': return '🔴 Critical';
        case 'warning':  return '🟡 Warning';
        default:         return '🟢 Normal';
    }
}

/**
 * Returns a subtle background tint for cards based on status.
 */
export function statusBg(status) {
    switch (status) {
        case 'critical': return 'rgba(239,68,68,0.08)';
        case 'warning':  return 'rgba(245,158,11,0.08)';
        default:         return 'transparent';
    }
}

// ─── Risk score helpers ───────────────────────────────────────────────────────

/**
 * Compute rule-based risk score from vitals (0–100).
 * Used as a fallback when server hasn't sent riskScore yet.
 */
export function computeRiskScore(vitals = {}) {
    let score = 0;
    const { heartRate, spo2, temperature } = vitals;

    if (heartRate > 130) score += 40;
    else if (heartRate > 120) score += 25;
    else if (heartRate < 50) score += 40;

    if (spo2 < 90) score += 40;
    else if (spo2 < 94) score += 25;

    if (temperature > 39) score += 20;
    else if (temperature > 38.5) score += 10;
    else if (temperature < 35) score += 20;

    return Math.min(100, score);
}

/**
 * Derive status string from a numeric risk score.
 */
export function riskScoreToStatus(score) {
    if (score >= 61) return 'critical';
    if (score >= 25) return 'warning';
    return 'normal';
}

/**
 * Returns a textual risk label.
 */
export function riskLabel(score) {
    if (score >= 61) return 'High Risk';
    if (score >= 25) return 'Moderate Risk';
    return 'Low Risk';
}

// ─── SVG arc gauge helper ─────────────────────────────────────────────────────

/**
 * Returns SVG arc path data for a circular gauge.
 * @param {number} value     0–100
 * @param {number} r         radius in px
 * @param {number} cx        center x
 * @param {number} cy        center y
 * @param {number} startDeg  arc start angle in degrees (e.g. 135)
 * @param {number} totalDeg  total arc sweep in degrees (e.g. 270)
 */
export function describeArc(value, r, cx, cy, startDeg = 135, totalDeg = 270) {
    const clampedValue = Math.min(100, Math.max(0, value));
    const endDeg = startDeg + (totalDeg * clampedValue) / 100;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const startX = cx + r * Math.cos(toRad(startDeg));
    const startY = cy + r * Math.sin(toRad(startDeg));
    const endX   = cx + r * Math.cos(toRad(endDeg));
    const endY   = cy + r * Math.sin(toRad(endDeg));

    const largeArc = endDeg - startDeg > 180 ? 1 : 0;

    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`;
}

// ─── Vital thresholds ─────────────────────────────────────────────────────────

export const VITAL_RANGES = {
    heartRate:   { low: 50,   high: 120, unit: 'bpm',  label: 'Heart Rate' },
    spo2:        { low: 94,   high: 100, unit: '%',    label: 'SpO₂' },
    temperature: { low: 35,   high: 38.5, unit: '°C', label: 'Temperature' },
    systolic:    { low: 90,   high: 140, unit: 'mmHg', label: 'Systolic BP' },
    diastolic:   { low: 60,   high: 90,  unit: 'mmHg', label: 'Diastolic BP' },
};

/**
 * Returns 'normal' | 'warning' | 'critical' for a specific vital reading.
 */
export function vitalStatus(key, value) {
    const range = VITAL_RANGES[key];
    if (!range || value == null) return 'normal';
    if (key === 'spo2') {
        if (value < 90) return 'critical';
        if (value < range.low) return 'warning';
        return 'normal';
    }
    if (value < range.low || value > range.high) {
        const deviation = Math.abs(
            value < range.low ? range.low - value : value - range.high
        );
        return deviation > (range.high - range.low) * 0.2 ? 'critical' : 'warning';
    }
    return 'normal';
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

export function formatTime(isoString) {
    if (!isoString) return '--';
    try {
        return new Date(isoString).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    } catch { return '--'; }
}

export function formatDateTime(isoString) {
    if (!isoString) return '--';
    try {
        return new Date(isoString).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    } catch { return '--'; }
}
