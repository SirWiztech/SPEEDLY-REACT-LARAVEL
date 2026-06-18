import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './ChatWindow';

interface ChatBubbleProps {
    rideId: string;
    otherPartyName: string;
    currentRole: string;
}

const API = '/api';

async function chatJson(url: string) {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${API}${url}`, {
        headers: { Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    });
    return res.json();
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ rideId, otherPartyName, currentRole }) => {
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const lastCountRef = useRef(0);

    useEffect(() => {
        const check = async () => {
            try {
                const json = await chatJson(`/rides/${rideId}/chat`);
                const data = json?.data || json || [];
                const list = Array.isArray(data) ? data : [];
                if (list.length > lastCountRef.current) {
                    const incoming = list.slice(lastCountRef.current);
                    const fromOther = incoming.filter((m: any) => m.sender_role !== currentRole).length;
                    if (!open && fromOther > 0) setUnread(prev => prev + fromOther);
                    lastCountRef.current = list.length;
                }
            } catch {}
        };
        check();
        const timer = setInterval(check, 3000);
        return () => clearInterval(timer);
    }, [rideId, open, currentRole]);

    return (
        <>
            <button onClick={() => { setOpen(true); setUnread(0); }} style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
                width: 60, height: 60, borderRadius: 30,
                background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 24, boxShadow: '0 6px 24px rgba(255,94,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'ccPulse 2s infinite',
                transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
                <span style={{ lineHeight: 1 }}>💬</span>
                {unread > 0 && <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#ff3b30', color: '#fff', borderRadius: 12,
                    minWidth: 24, height: 24, fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px', boxShadow: '0 2px 6px rgba(255,59,48,0.4)',
                }}>{unread > 99 ? '99+' : unread}</span>}
            </button>
            {open && (
                <ChatWindow
                    rideId={rideId}
                    otherPartyName={otherPartyName}
                    currentRole={currentRole}
                    onClose={() => setOpen(false)}
                />
            )}
            <style>{`
                @keyframes ccPulse {
                    0%, 100% { box-shadow: 0 6px 24px rgba(255,94,0,0.35); }
                    50% { box-shadow: 0 6px 32px rgba(255,94,0,0.6); }
                }
            `}</style>
        </>
    );
};

export default ChatBubble;
