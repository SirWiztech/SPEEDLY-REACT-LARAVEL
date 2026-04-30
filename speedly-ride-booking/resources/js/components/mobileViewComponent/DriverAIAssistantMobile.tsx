import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';

interface Message {
    type: 'ai' | 'user';
    text: string;
}

interface TopicItem {
    title: string;
    description: string;
    icon: string;
    answer: string;
    bgColor: string;
    color: string;
}

interface TopicData {
    title: string;
    icon: string;
    bgColor: string;
    color: string;
    items: TopicItem[];
}

export default function DriverAIAssistantMobile() {
    const { props } = usePage();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('User');
    const [messages, setMessages] = useState<Message[]>([
        { type: 'ai', text: "Hello! I'm your Speedly AI Assistant. I can help you with booking rides, payments, safety tips, and more. What would you like to know?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    const chatBodyRef = useRef<HTMLDivElement>(null);

    const topicsData: Record<string, TopicData> = {
        'getting-started': {
            title: 'Getting Started',
            icon: 'fa-rocket',
            bgColor: '#fff5f0',
            color: '#ff5e00',
            items: [
                { title: 'Create an Account', description: 'Sign up and get started', icon: 'fa-user-plus', answer: 'To create an account:\n\n1. Download the Speedly app\n2. Tap "Sign Up"\n3. Enter your details\n4. Verify your phone number\n5. Start booking rides!', bgColor: '#fff5f0', color: '#ff5e00' },
                { title: 'Complete Your Profile', description: 'Add your personal info', icon: 'fa-user-edit', answer: 'Complete your profile:\n\n1. Go to Settings\n2. Tap "Edit Profile"\n3. Add your name, email, phone\n4. Upload a profile picture\n5. Save changes', bgColor: '#fff5f0', color: '#ff5e00' },
                { title: 'Set Up Payment', description: 'Add payment methods', icon: 'fa-credit-card', answer: 'Set up payment:\n\n1. Go to Wallet\n2. Tap "Payment Methods"\n3. Add card or bank details\n4. Set default method\n5. You\'re ready to pay!', bgColor: '#fff5f0', color: '#ff5e00' }
            ]
        }
    };

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

    return (
        <div className="mobile-container">
            <div className="desktop-sidebar-container">
                <DriverSidebarDesktop />
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
                <DriverNavMobile />
            </div>
        </div>
    );
}
