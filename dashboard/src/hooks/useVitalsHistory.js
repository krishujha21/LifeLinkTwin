/**
 * LifeLink Twin — useVitalsHistory hook
 * Maintains a rolling window of vital readings for sparkline charts.
 * Keeps the last MAX_POINTS readings in memory per metric.
 */

import { useState, useCallback, useRef } from 'react';

const MAX_POINTS = 30; // ~30 seconds of data at 1Hz

/**
 * @returns {object} history state + push function
 *
 * history shape:
 * {
 *   timestamps:   string[],   // HH:MM:SS
 *   heartRate:    number[],
 *   spo2:         number[],
 *   temperature:  number[],
 *   systolic:     number[],
 *   diastolic:    number[],
 * }
 */
export default function useVitalsHistory() {
    const [history, setHistory] = useState({
        timestamps:  [],
        heartRate:   [],
        spo2:        [],
        temperature: [],
        systolic:    [],
        diastolic:   [],
    });

    // Track last pushed timestamp to avoid duplicate entries on re-render
    const lastTimestampRef = useRef(null);

    /**
     * Push a new vitals reading into the rolling window.
     * @param {object} vitals  - { heartRate, spo2, temperature, bloodPressure }
     * @param {string} ts      - ISO timestamp string (optional, defaults to now)
     */
    const pushVitals = useCallback((vitals, ts) => {
        if (!vitals) return;

        const timestamp = ts || new Date().toISOString();

        // Skip if same timestamp as last push (prevents double-counting)
        if (timestamp === lastTimestampRef.current) return;
        lastTimestampRef.current = timestamp;

        const label = new Date(timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });

        setHistory(prev => {
            const next = {
                timestamps:  [...prev.timestamps,  label],
                heartRate:   [...prev.heartRate,   vitals.heartRate   ?? null],
                spo2:        [...prev.spo2,         vitals.spo2        ?? null],
                temperature: [...prev.temperature,  vitals.temperature ?? null],
                systolic:    [...prev.systolic,     vitals.bloodPressure?.systolic  ?? null],
                diastolic:   [...prev.diastolic,    vitals.bloodPressure?.diastolic ?? null],
            };

            // Trim to MAX_POINTS
            if (next.timestamps.length > MAX_POINTS) {
                const trim = (arr) => arr.slice(arr.length - MAX_POINTS);
                return {
                    timestamps:  trim(next.timestamps),
                    heartRate:   trim(next.heartRate),
                    spo2:        trim(next.spo2),
                    temperature: trim(next.temperature),
                    systolic:    trim(next.systolic),
                    diastolic:   trim(next.diastolic),
                };
            }

            return next;
        });
    }, []);

    /**
     * Reset history (e.g. when switching selected patient).
     */
    const clearHistory = useCallback(() => {
        lastTimestampRef.current = null;
        setHistory({
            timestamps:  [],
            heartRate:   [],
            spo2:        [],
            temperature: [],
            systolic:    [],
            diastolic:   [],
        });
    }, []);

    /**
     * Get the latest value for a metric (last in array).
     * @param {'heartRate'|'spo2'|'temperature'|'systolic'|'diastolic'} metric
     */
    const latest = useCallback((metric) => {
        const arr = history[metric];
        return arr.length ? arr[arr.length - 1] : null;
    }, [history]);

    /**
     * Returns simple min/max/avg stats for a metric over the current window.
     */
    const stats = useCallback((metric) => {
        const arr = history[metric].filter(v => v != null);
        if (!arr.length) return { min: null, max: null, avg: null };
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
        return { min, max, avg };
    }, [history]);

    return { history, pushVitals, clearHistory, latest, stats };
}
