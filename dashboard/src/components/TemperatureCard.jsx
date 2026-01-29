/**
 * LifeLink Twin - Temperature Card Component
 * 
 * Displays body temperature with numeric value
 * and color-coded indicator bar.
 */

import { useLanguage } from '../i18n';

function TemperatureCard({ value, status }) {
    const { t } = useLanguage();

    // Calculate position on temperature bar (35-40°C range)
    const tempPosition = value != null ? Math.max(0, Math.min(100, ((value - 35) / 5) * 100)) : 50;

    const getCardClass = () => {
        if (value == null) return '';
        if (value > 39) return 'glow-critical';
        if (value > 38.5) return 'glow-warning';
        return '';
    };

    const getStatusInfo = () => {
        if (value == null) return { text: `${t('waiting')}...`, class: 'text-muted', icon: '⏳' };
        if (value > 39) return { text: 'High Fever - Critical', class: 'text-danger', icon: '🔥' };
        if (value > 38.5) return { text: 'Fever', class: 'text-warning', icon: '⚠️' };
        if (value < 35.5) return { text: 'Hypothermia', class: 'text-info', icon: '❄️' };
        return { text: t('normal'), class: 'text-success', icon: '✓' };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`card vital-card ${getCardClass()}`}>
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🌡️</span>
                        <span className="vital-title">{t('temperature')}</span>
                    </div>
                    <span className="badge bg-dark">Body</span>
                </div>

                {/* Value Display */}
                <div className="vital-value-container text-center my-4">
                    <span className="vital-value temp-value">{value?.toFixed(1) || '--'}</span>
                    <span className="vital-unit">{t('celsius')}</span>
                </div>

                {/* Status */}
                <div className={`text-center mb-3 ${statusInfo.class}`}>
                    <span>{statusInfo.icon} {statusInfo.text}</span>
                </div>

                {/* Temperature Bar */}
                <div className="temp-indicator mt-3">
                    <div className="temp-bar">
                        <div
                            className="temp-marker"
                            style={{ left: `${tempPosition}%` }}
                        />
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                        <small className="text-info">35°C</small>
                        <small className="text-success">37°C</small>
                        <small className="text-danger">40°C</small>
                    </div>
                </div>

                {/* Normal Range */}
                <div className="text-center mt-3">
                    <small className="text-muted">Normal: 36.1°C - 37.2°C</small>
                </div>
            </div>
        </div>
    );
}

export default TemperatureCard;
