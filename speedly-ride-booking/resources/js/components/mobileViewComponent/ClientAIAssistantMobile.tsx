import { useState } from 'react';
import { Head } from '@inertiajs/react';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import '../../../css/ClientAIAssistant.css';

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export default function ClientAIAssistantMobile() {
    const loading = usePreloader(1500);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', type: 'ai', content: 'Hello! How can I help you today?', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: 'I understand you said: ' + input + '. Let me help you with that.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    if (loading) {
        return <MobilePreloader />;
    }

    return (
        <>
            <Head title="AI Assistant - Mobile" />
            <div className="client-ai-assistant">
                <div className="ai-chat-container">
                    <div className="ai-chat-header">
                        <div className="ai-avatar">🤖</div>
                        <div className="header-info">
                            <h2>AI Assistant</h2>
                            <p>Ask me anything about your rides</p>
                        </div>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.type}`}>
                                <div className="avatar">
                                    {msg.type === 'user' ? 'U' : '🤖'}
                                </div>
                                <div className="message-content">
                                    <p>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="quick-actions">
                        <button className="quick-action-btn">Book a ride</button>
                        <button className="quick-action-btn">Check fare</button>
                        <button className="quick-action-btn">Ride history</button>
                    </div>

                    <div className="ai-chat-input">
                        <input 
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>

                <div className="mobile-nav-container">
                    <ClientNavmobile />
                </div>
            </div>
        </>
    );
}
