import React, { useState, useEffect, useRef } from 'react';

interface Props {
    rideId: string;
    otherPartyName: string;
    currentRole: string;
    onClose: () => void;
}

const API = '/api';

async function chatFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API}${url}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
            ...(options.headers as Record<string, string> || {}),
        },
    });
    return res.json();
}

function formatTime(iso: string) {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
}

const ChatWindow: React.FC<Props> = ({ rideId, otherPartyName, currentRole, onClose }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [minimized, setMinimized] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollDown = () => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const loadMessages = async () => {
        try {
            const json = await chatFetch(`/rides/${rideId}/chat`);
            const data = json?.data || json;
            const arr = Array.isArray(data) ? data : [];
            setMessages(prev => {
                const serverIds = new Set(arr.map((m: any) => m.id));
                const optimistic = prev.filter(m => String(m.id).startsWith('opt_'));
                return [...arr, ...optimistic.filter(m => !serverIds.has(m.id))];
            });
        } catch {}
    };

    // Polling-based message fetching (no WebSocket — compatible with Render free plan)
    useEffect(() => {
        const timer = setInterval(loadMessages, 3000);
        return () => clearInterval(timer);
    }, [rideId]);

    useEffect(() => { loadMessages().then(() => setLoading(false)); }, [rideId]);

    useEffect(() => { scrollDown(); }, [messages.length]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text) return;
        setInput('');
        const optId = 'opt_' + Math.random().toString(36).slice(2, 10);
        setMessages(prev => [...prev, {
            id: optId,
            ride_id: rideId,
            sender_role: currentRole,
            message: text,
            created_at: new Date().toISOString(),
        }]);
        scrollDown();
        try {
            const json = await chatFetch(`/rides/${rideId}/chat`, {
                method: 'POST',
                body: JSON.stringify({ message: text }),
            });
            const msg = json?.data || json;
            if (msg?.id) {
                setMessages(prev => prev.map(m => m.id === optId ? { ...msg, sender_role: currentRole } : m));
            }
        } catch {}
    };

    if (minimized) return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
            <button onClick={() => setMinimized(false)} style={{
                width: 56, height: 56, borderRadius: 28,
                background: 'linear-gradient(135deg, #ff5e00, #ff8c3a)',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: 22,
                boxShadow: '0 6px 24px rgba(255,94,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >💬</button>
        </div>
    );

    const otherInitial = (otherPartyName || 'User').charAt(0).toUpperCase();
    const otherColor = currentRole === 'client' ? ['#4CAF50', '#2E7D32'] : ['#FF9800', '#E65100'];

    return (
        <div className="cc-chat-window" style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            width: 'min(380px, calc(100vw - 24px))',
            maxWidth: 380,
            height: 'min(520px, calc(100vh - 120px))',
            background: '#fff', borderRadius: 20,
            boxShadow: '0 12px 48px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column',
            overflow: 'hidden', border: '1px solid #eee',
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: '#fff', padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 20,
                        background: `linear-gradient(135deg, ${otherColor[0]}, ${otherColor[1]})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 16, color: '#fff',
                    }}>
                        {otherInitial}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{otherPartyName}</div>
                        <div style={{ fontSize: 10, opacity: 0.7, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: 3,
                                background: '#4CAF50',
                                display: 'inline-block',
                            }}></span>
                            Online
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setMinimized(true)} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                        borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
                        fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>─</button>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                        borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
                        fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '16px 14px',
                background: 'linear-gradient(180deg, #f8f9fb 0%, #f0f2f5 100%)',
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 16, margin: '0 auto 12px',
                            background: 'linear-gradient(135deg, #ff5e00, #ff8c3a)',
                            animation: 'chatSpin 1s linear infinite',
                        }}></div>
                        <div style={{ color: '#aaa', fontSize: 12 }}>Loading messages...</div>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                        <div style={{ fontWeight: 600, color: '#333', fontSize: 14, marginBottom: 4 }}>Start the conversation</div>
                        <div style={{ color: '#999', fontSize: 12 }}>Send a message to {otherPartyName}</div>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMine = msg.sender_role === currentRole;
                        const showAvatar = i === 0 || messages[i - 1]?.sender_role !== msg.sender_role;
                        const time = msg.created_at ? formatTime(msg.created_at) : '';

                        return (
                            <div key={msg.id || i} style={{
                                display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row',
                                alignItems: 'flex-end', marginBottom: showAvatar ? 10 : 2,
                                gap: 8,
                            }}>
                                {showAvatar && !isMine && (
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 14,
                                        background: `linear-gradient(135deg, ${otherColor[0]}, ${otherColor[1]})`,
                                        color: '#fff', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 11, fontWeight: 700,
                                        flexShrink: 0,
                                    }}>
                                        {otherInitial}
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: '75%',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: isMine ? 'flex-end' : 'flex-start',
                                }}>
                                    {showAvatar && (
                                        <span style={{ fontSize: 9, color: '#999', marginBottom: 2, padding: '0 4px' }}>
                                            {isMine ? 'You' : (otherPartyName || 'Other').split(' ')[0]} · {time}
                                        </span>
                                    )}
                                    <div style={{
                                        padding: '10px 14px', borderRadius: showAvatar
                                            ? (isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px')
                                            : (isMine ? '16px 4px 4px 16px' : '4px 16px 16px 4px'),
                                        background: isMine
                                            ? 'linear-gradient(135deg, #ff5e00, #ff7a2e)'
                                            : '#fff',
                                        color: isMine ? '#fff' : '#333',
                                        fontSize: 13, lineHeight: 1.45,
                                        wordBreak: 'break-word',
                                        boxShadow: isMine
                                            ? '0 2px 8px rgba(255,94,0,0.25)'
                                            : '0 1px 4px rgba(0,0,0,0.06)',
                                    }}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '10px 14px', borderTop: '1px solid #eee',
                background: '#fff', display: 'flex', gap: 8, alignItems: 'center',
            }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={`Message ${otherPartyName.split(' ')[0]}...`}
                    style={{
                        flex: 1, padding: '10px 16px', borderRadius: 24,
                        border: '1px solid #e0e0e0', outline: 'none', fontSize: 13,
                        background: '#f8f9fb', transition: 'border 0.2s',
                    }}
                    onFocus={e => (e.target.style.border = '1px solid #ff5e00')}
                    onBlur={e => (e.target.style.border = '1px solid #e0e0e0')}
                />
                <button onClick={sendMessage} style={{
                    background: 'linear-gradient(135deg, #ff5e00, #ff8c3a)',
                    color: '#fff', border: 'none', borderRadius: 24,
                    padding: '10px 18px', cursor: 'pointer', fontWeight: 600,
                    fontSize: 13, boxShadow: '0 2px 8px rgba(255,94,0,0.3)',
                    transition: 'transform 0.15s',
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >Send</button>
            </div>

            <style>{`
                @keyframes chatSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .cc-chat-window {
                    right: 12px !important;
                }
                @media (max-width: 480px) {
                    .cc-chat-window {
                        right: 8px !important;
                        left: 8px !important;
                        bottom: 80px !important;
                        width: auto !important;
                        max-width: none !important;
                        border-radius: 16px !important;
                        max-height: calc(100vh - 130px) !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ChatWindow;
