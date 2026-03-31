/**
 * LifeLink Twin — ChatPanel Component
 * Real-time chat between Attendant ↔ Doctor via Socket.io.
 * Used in both AttendantDashboard and DoctorDashboard.
 */

import { useEffect, useRef, useState } from 'react';
import { COLORS, formatTime } from '../utils/riskUtils';

/**
 * @param {array}    messages    - From useSocket().chatMessages
 * @param {function} onSend      - useSocket().sendChat(message, name)
 * @param {string}   senderName  - localStorage.getItem('ll_name')
 * @param {string}   role        - 'attendant' | 'doctor'
 * @param {boolean}  compact     - Reduced height for sidebar usage
 */
export default function ChatPanel({
    messages = [],
    onSend,
    senderName = 'User',
    role = 'attendant',
    compact = false,
}) {
    const [input, setInput]       = useState('');
    const bottomRef               = useRef(null);
    const inputRef                = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || !onSend) return;
        onSend(text, senderName);
        setInput('');
        inputRef.current?.focus();
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Role display config
    const roleConfig = {
        attendant: { color: COLORS.accent,  icon: '👨‍👩‍👧‍👦', label: 'Family' },
        doctor:    { color: COLORS.ai,      icon: '👨‍⚕️',       label: 'Doctor' },
        hospital:  { color: COLORS.normal,  icon: '🏥',        label: 'Hospital' },
    };

    const myConfig    = roleConfig[role]    || roleConfig.attendant;
    const otherConfig = role === 'doctor'
        ? roleConfig.attendant
        : roleConfig.doctor;

    // ── styles ────────────────────────────────────────────────────────────────
    const panelStyle = {
        display:        'flex',
        flexDirection:  'column',
        background:     COLORS.card,
        border:         `1px solid ${COLORS.border}`,
        borderRadius:   '12px',
        overflow:       'hidden',
        fontFamily:     '"Inter", sans-serif',
        height:         compact ? '280px' : '360px',
    };

    const headerStyle = {
        padding:        '12px 16px',
        borderBottom:   `1px solid ${COLORS.border}`,
        display:        'flex',
        alignItems:     'center',
        gap:            '8px',
        flexShrink:     0,
    };

    const feedStyle = {
        flex:       1,
        overflowY:  'auto',
        padding:    '12px 14px',
        display:    'flex',
        flexDirection: 'column',
        gap:        '8px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${COLORS.border} transparent`,
    };

    const inputRowStyle = {
        display:        'flex',
        gap:            '8px',
        padding:        '10px 12px',
        borderTop:      `1px solid ${COLORS.border}`,
        flexShrink:     0,
        background:     'rgba(10,15,30,0.6)',
    };

    const inputStyle = {
        flex:         1,
        background:   COLORS.bg,
        border:       `1px solid ${COLORS.border}`,
        borderRadius: '8px',
        padding:      '9px 12px',
        color:        COLORS.text,
        fontSize:     '13px',
        outline:      'none',
        fontFamily:   '"Inter", sans-serif',
        resize:       'none',
    };

    const sendBtnStyle = {
        background:   COLORS.accent,
        border:       'none',
        borderRadius: '8px',
        padding:      '0 16px',
        color:        '#fff',
        fontWeight:   700,
        fontSize:     '13px',
        cursor:       'pointer',
        flexShrink:   0,
        transition:   'opacity 0.2s',
        fontFamily:   '"Inter", sans-serif',
    };

    return (
        <div style={panelStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <span style={{ fontSize: '16px' }}>💬</span>
                <span style={{ color: COLORS.text, fontWeight: 600, fontSize: '13px' }}>
                    Live Chat
                </span>
                <span style={{
                    marginLeft: 'auto',
                    fontSize:   '11px',
                    color:      COLORS.muted,
                }}>
                    {myConfig.icon} {senderName} → {otherConfig.icon} {otherConfig.label}
                </span>
            </div>

            {/* Message feed */}
            <div style={feedStyle}>
                {messages.length === 0 && (
                    <div style={{
                        color:     COLORS.muted,
                        fontSize:  '12px',
                        textAlign: 'center',
                        marginTop: '20px',
                    }}>
                        No messages yet. Start the conversation.
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isSelf  = msg.self;
                    const conf    = isSelf ? myConfig : otherConfig;
                    return (
                        <div
                            key={i}
                            style={{
                                display:       'flex',
                                flexDirection: isSelf ? 'row-reverse' : 'row',
                                alignItems:    'flex-end',
                                gap:           '8px',
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                fontSize:     '18px',
                                flexShrink:   0,
                                lineHeight:   1,
                            }}>
                                {conf.icon}
                            </div>

                            {/* Bubble */}
                            <div style={{
                                maxWidth:      '75%',
                                background:    isSelf
                                    ? `linear-gradient(135deg, ${conf.color}33, ${conf.color}18)`
                                    : 'rgba(255,255,255,0.05)',
                                border:        `1px solid ${isSelf ? conf.color + '55' : COLORS.border}`,
                                borderRadius:  isSelf
                                    ? '12px 12px 4px 12px'
                                    : '12px 12px 12px 4px',
                                padding:       '8px 12px',
                            }}>
                                {/* Sender + time */}
                                <div style={{
                                    display:        'flex',
                                    justifyContent: 'space-between',
                                    gap:            '8px',
                                    marginBottom:   '4px',
                                }}>
                                    <span style={{ color: conf.color, fontSize: '10px', fontWeight: 700 }}>
                                        {isSelf ? 'You' : (msg.senderName || conf.label)}
                                    </span>
                                    <span style={{ color: COLORS.muted, fontSize: '10px' }}>
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                                {/* Text */}
                                <div style={{
                                    color:      COLORS.text,
                                    fontSize:   '13px',
                                    lineHeight: 1.5,
                                    wordBreak:  'break-word',
                                }}>
                                    {msg.message}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div style={inputRowStyle}>
                <textarea
                    ref={inputRef}
                    style={inputStyle}
                    rows={1}
                    placeholder="Type a message…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    onFocus={e => e.currentTarget.style.borderColor = COLORS.accent}
                    onBlur={e =>  e.currentTarget.style.borderColor = COLORS.border}
                />
                <button
                    style={sendBtnStyle}
                    onClick={handleSend}
                    disabled={!input.trim()}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseOut={e  => e.currentTarget.style.opacity = '1'}
                >
                    Send ↑
                </button>
            </div>
        </div>
    );
}
