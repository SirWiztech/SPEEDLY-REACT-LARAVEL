import { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavMobile';

interface Message {
    type: 'ai' | 'user';
    text: string;
}

export default function ClientAIAssistant() {
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        { type: 'ai', text: "Hello! I'm your Speedly AI Assistant. I can help you with booking rides, payments, safety tips, and more. What would you like to know?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (question: string) => {
        if (!question.trim()) return;

        setMessages(prev => [...prev, { type: 'user', text: question }]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            setMessages(prev => [...prev, { type: 'ai', text: 'Thanks for your question! This feature is coming soon.' }]);
            setIsTyping(false);
        }, 1000);
    };

    if (loading) {
        return <div className="preloader">Loading...</div>;
    }

    return (
        <div className="mobile-container">
            <div className="desktop-sidebar-container">
                <ClientSidebarDesktop />
            </div>

            <div className="main-content">
                <div className="mobile-header">
                    <h1>AI Assistant</h1>
                </div>

                <div className="chat-container">
                    <div className="chat-body" ref={chatBodyRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                <div className="message-content">{msg.text}</div>
                            </div>
                        ))}
                        {isTyping && <div className="typing-indicator">AI is typing...</div>}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                            placeholder="Ask me anything..."
                        />
                        <button onClick={() => handleSend(inputValue)}>Send</button>
                    </div>
                </div>
            </div>

            <div className="mobile-nav-container">
                <ClientNavmobile />
            </div>
        </div>
    );
}
