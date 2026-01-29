/**
 * LifeLink Twin - Heart Rate Card Component
 * 
 * Displays real-time heart rate with animated Chart.js line graph.
 * Includes pulse animation and status-based styling.
 */

import { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { useLanguage } from '../i18n';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function HeartRateCard({ value, history, status }) {
    const cardRef = useRef(null);
    const { t } = useLanguage();

    // Determine card glow based on status
    const getCardClass = () => {
        if (value == null) return '';
        if (value > 130) return 'glow-critical';
        if (value > 120) return 'glow-warning';
        return '';
    };

    // Chart configuration
    const chartData = {
        labels: history?.timestamps?.slice(-30) || [],
        datasets: [
            {
                label: 'Heart Rate',
                data: history?.heartRate?.slice(-30) || [],
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
            }
        },
        scales: {
            x: {
                display: false,
            },
            y: {
                min: 40,
                max: 160,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#8b949e',
                    font: { size: 10 }
                }
            }
        },
        animation: {
            duration: 300
        }
    };

    return (
        <div className={`card vital-card ${getCardClass()}`} ref={cardRef}>
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon pulse-animation">❤️</span>
                        <span className="vital-title">{t('heartRate')}</span>
                    </div>
                    <span className="badge bg-dark">{t('bpm').toUpperCase()}</span>
                </div>

                {/* Value */}
                <div className="vital-value-container">
                    <span className="vital-value heart-rate-value">{value || '--'}</span>
                    <span className="vital-unit">{t('bpm').toUpperCase()}</span>
                </div>

                {/* Status indicator */}
                <div className="vital-status mt-2">
                    {value == null && <span className="text-muted">⏳ {t('waiting')}...</span>}
                    {value != null && value > 130 && <span className="text-danger">⚠️ Tachycardia</span>}
                    {value != null && value > 120 && value <= 130 && <span className="text-warning">⚡ Elevated</span>}
                    {value != null && value <= 120 && value >= 60 && <span className="text-success">✓ {t('normal')}</span>}
                    {value != null && value < 60 && value > 0 && <span className="text-info">↓ Low</span>}
                </div>

                {/* Chart */}
                <div className="chart-container mt-3" style={{ height: '120px' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}

export default HeartRateCard;
