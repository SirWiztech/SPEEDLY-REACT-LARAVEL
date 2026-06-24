import React, { useState, useEffect, useRef, useCallback } from 'react';
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

    // Draggable bubble state
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const dragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const posStart = useRef({ x: 0, y: 0 });
    const bubbleRef = useRef<HTMLButtonElement>(null);
    const posInitialized = useRef(false);

    const clampPosition = useCallback((x: number, y: number) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const size = 60;
        const bottomNavHeight = 80;
        return {
            x: Math.max(8, Math.min(x, w - size - 8)),
            y: Math.max(8, Math.min(y, h - size - bottomNavHeight - 8)),
        };
    }, []);

    // Set initial position on first render
    if (!posInitialized.current && typeof window !== 'undefined') {
        const p = clampPosition(window.innerWidth - 60 - 24, window.innerHeight - 60 - 24);
        posInitialized.current = true;
        // Don't set state during render, use a ref instead
        pos.x = p.x;
        pos.y = p.y;
    }

    useEffect(() => {
        if (!posInitialized.current) {
            const p = clampPosition(window.innerWidth - 60 - 24, window.innerHeight - 60 - 24);
            setPos(p);
            posInitialized.current = true;
        }
    }, [clampPosition]);

    const onPointerDown = (e: React.PointerEvent) => {
        // Only start drag from the bubble, not if chat window is open
        if (open) return;
        dragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        posStart.current = { x: pos.x, y: pos.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragging.current || open) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPos(clampPosition(posStart.current.x + dx, posStart.current.y + dy));
    };

    const onPointerUp = (_e: React.PointerEvent) => {
        if (!dragging.current) return;
        dragging.current = false;
    };

    // Unread counter
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

    const handleOpen = () => {
        if (dragging.current) return;
        setOpen(true);
        setUnread(0);
    };

    return (
        <>
            <button
                ref={bubbleRef}
                onClick={handleOpen}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{
                    position: 'fixed',
                    left: pos.x,
                    top: pos.y,
                    zIndex: 9998,
                    width: 60, height: 60, borderRadius: 30,
                    background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                    color: '#fff', border: 'none', cursor: dragging.current ? 'grabbing' : 'grab',
                    fontSize: 24, boxShadow: '0 6px 24px rgba(255,94,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'ccPulse 2s infinite',
                    transition: open || dragging.current ? 'none' : 'transform 0.2s',
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                }}
                onMouseEnter={e => { if (!dragging.current) e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { if (!dragging.current) e.currentTarget.style.transform = 'scale(1)'; }}
            >
                <span style={{ lineHeight: 1 }}>💬</span>
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        background: '#ff3b30', color: '#fff', borderRadius: 12,
                        minWidth: 24, height: 24, fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px', boxShadow: '0 2px 6px rgba(255,59,48,0.4)',
                    }}>
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
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
