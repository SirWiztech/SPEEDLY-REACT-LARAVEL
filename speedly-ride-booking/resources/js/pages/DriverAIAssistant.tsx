import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DriverSidebarDesktop from '../components/navbars/DriverSidebarDesktop';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import { Bot, Rocket, Car, Wallet, ShieldAlert, Send } from 'lucide-react';
import '../../css/DriverAIAssistant.css';

interface TopicItem {
  title: string;
  description: string;
  icon: string;
  answer: string;
}

interface Topic {
  title: string;
  icon: string;
  bgColor: string;
  color: string;
  items: TopicItem[];
}

type TopicsData = Record<string, Topic>;

interface Message {
  type: 'user' | 'ai';
  text: string;
}

interface QuickQuestion {
  text: string;
  icon: string;
}

const topicsData: TopicsData = {
  'getting-started': {
    title: 'Getting Started',
    icon: 'Rocket',
    bgColor: '#fff5f0',
    color: '#ff4500',
    items: [
      { title: 'Create Driver Account', description: 'Sign up as a driver', icon: 'Rocket', answer: 'To create a driver account:\n\n1. Download Speedly Driver app\n2. Tap "Sign Up as Driver"\n3. Enter vehicle & license details\n4. Upload required documents\n5. Wait for verification (24-48hrs)' },
      { title: 'Complete Profile', description: 'Add driver details', icon: 'Car', answer: 'Complete your profile:\n\n1. Go to Settings > Profile\n2. Add vehicle registration\n3. Upload profile picture\n4. Verify phone number\n5. Save changes' },
      { title: 'Set Up Bank Details', description: 'Add payout method', icon: 'Wallet', answer: 'Set up payout:\n\n1. Go to Wallet\n2. Tap "Bank Details"\n3. Add account number & bank\n4. Verify with BVN\n5. Ready to receive payments!' }
    ]
  },
  'rides': {
    title: 'Ride Requests',
    icon: 'Car',
    bgColor: '#e8f5e9',
    color: '#ff4500',
    items: [
      { title: 'Accept a Ride', description: 'How to accept requests', icon: 'Car', answer: 'To accept a ride:\n\n1. Go to Dashboard\n2. View incoming requests\n3. Tap "Accept" on preferred ride\n4. Confirm pickup location\n5. Start trip when passenger is in' },
      { title: 'Cancel a Ride', description: 'How to cancel accepted rides', icon: 'Send', answer: 'To cancel a ride:\n\n1. Open active ride\n2. Tap "Cancel Ride"\n3. Select reason\n\n⚠️ Frequent cancellations may affect your rating' },
      { title: 'Navigate to Destination', description: 'Use in-app navigation', icon: 'Send', answer: 'Navigation guide:\n\n1. Tap "Start Trip"\n2. Use integrated map\n3. Follow turn-by-turn directions\n4. Confirm arrival\n5. Complete ride' }
    ]
  },
  'earnings': {
    title: 'Earnings',
    icon: 'Wallet',
    bgColor: '#e3f2fd',
    color: '#ff4500',
    items: [
      { title: 'Withdraw Earnings', description: 'Cash out your earnings', icon: 'Wallet', answer: 'To withdraw earnings:\n\n1. Go to Wallet\n2. Tap "Withdraw"\n3. Enter amount (min ₦1,000)\n4. Select verified bank\n5. Submit request\n\nProcessed within 24-48 hours!' },
      { title: 'View Trip History', description: 'Check past rides', icon: 'Car', answer: 'View trip history:\n\n1. Go to Ride History\n2. Filter by date/status\n3. Tap any ride for details\n4. Download receipts\n5. View earnings breakdown' },
      { title: 'Bonus Programs', description: 'Earn extra income', icon: 'Rocket', answer: 'Bonus opportunities:\n\n✅ Peak hour bonuses\n✅ Long trip incentives\n✅ Referral bonuses\n✅ Weekly performance rewards\n\nCheck Dashboard for active bonuses!' }
    ]
  },
  'safety': {
    title: 'Safety',
    icon: 'ShieldAlert',
    bgColor: '#fce4ec',
    color: '#ff4500',
    items: [
      { title: 'Safety Tips', description: 'Stay safe on trips', icon: 'ShieldAlert', answer: 'Safety tips:\n\n✅ Verify passenger details\n✅ Share trip with contacts\n✅ Keep emergency button handy\n✅ Report issues via Support\n\nFor emergencies, call 911 first!' },
      { title: 'Emergency Contacts', description: 'Who to contact', icon: 'Send', answer: 'Emergency contacts:\n\n📞 Speedly Driver Support: +234 800 000 0000\n📧 Email: speedlyentreprise01@gmail.com\n\nFor life-threatening emergencies, call 911 immediately!' },
      { title: 'Report an Issue', description: 'Report passenger issues', icon: 'Send', answer: 'Report issues:\n\n1. Go to Support page\n2. Open a support ticket\n3. Describe the issue\n4. Attach evidence if needed\n\nResponse time: within 24 hours' }
    ]
  }
};

const quickQuestions: QuickQuestion[] = [
  { text: 'How do I accept rides?', icon: 'Car' },
  { text: 'How do I withdraw?', icon: 'Wallet' },
  { text: 'How do I cancel?', icon: 'Send' },
  { text: 'Safety contacts?', icon: 'ShieldAlert' }
];

export default function DriverAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'ai', text: "Hello! I'm your Speedly Driver AI Assistant. I can help you with ride requests, earnings, safety, and more. What would you like to know?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const loading = usePreloader(1000);

  const { data: userData } = useQuery({
    queryKey: ['driverProfile'],
    queryFn: () => fetch('/api/driver/profile').then(res => res.json()),
  });

  const userName = userData?.full_name?.split(' ')[0] || userData?.name?.split(' ')[0] || 'Driver';

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('accept') || q.includes('ride request')) {
      return 'To accept a ride:\n\n1. Go to Dashboard\n2. View incoming requests\n3. Tap "Accept" on preferred ride\n4. Confirm pickup location\n5. Start trip when passenger is in';
    }
    if (q.includes('withdraw') || q.includes('earnings') || q.includes('cash out')) {
      return 'To withdraw earnings:\n\n1. Go to Wallet\n2. Tap "Withdraw"\n3. Enter amount (min ₦1,000)\n4. Select verified bank\n5. Submit request\n\nProcessed within 24-48 hours!';
    }
    if (q.includes('cancel')) {
      return 'To cancel a ride:\n\n1. Open active ride\n2. Tap "Cancel Ride"\n3. Select reason\n\n⚠️ Frequent cancellations may affect your rating';
    }
    if (q.includes('support') || q.includes('help') || q.includes('contact')) {
      return 'Need support? Here are your options:\n\n📱 Go to Support page in dashboard\n💬 Open a support ticket\n📧 Email: speedlyentreprise01@gmail.com\n📞 Phone: +234 800 000 0000\n\nResponse time: within 24 hours';
    }
    if (q.includes('safety') || q.includes('emergency')) {
      return 'Safety tips:\n\n✅ Verify passenger details\n✅ Share trip with contacts\n✅ Keep emergency button handy\n✅ Report issues via Support\n\nFor emergencies, call 911 first!';
    }
    
    return "I'm here to help! Try asking about:\n• Accepting rides\n• Withdrawing earnings\n• Cancelling rides\n• Safety guidelines\n• Trip navigation\n\nOr browse the topics on the left!";
  };

  const sendMessage = () => {
    const message = inputValue.trim();
    if (!message) return;
    
    setMessages(prev => [...prev, { type: 'user', text: message }]);
    setInputValue('');
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const response = getAIResponse(message);
      setMessages(prev => [...prev, { type: 'ai', text: response }]);
    }, 1500);
  };

  const showTopics = (category: string) => setSelectedCategory(category);
  const showAnswer = (answer: string) => setMessages(prev => [...prev, { type: 'ai', text: answer }]);

  if (loading) return isMobile ? <MobilePreloader /> : <DesktopPreloader />;

  const renderIcon = (iconName: string, className: string) => {
    const icons: Record<string, React.ReactElement> = {
      'Rocket': <Rocket className={className} />,
      'Car': <Car className={className} />,
      'Wallet': <Wallet className={className} />,
      'ShieldAlert': <ShieldAlert className={className} />,
      'Send': <Send className={className} />,
      'Bot': <Bot className={className} />
    };
    return icons[iconName] || <Bot className={className} />;
  };

  return (
    <>
      {isMobile ? (
        <div className="mobile-container">
          <div className="mobile-header">
            <h1><Robot className="ai-header-icon" /> AI Assistant</h1>
          </div>
          <div className="ai-chat-card">
            <div className="ai-chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`ai-message ${msg.type === 'user' ? 'user-message' : ''}`}>
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="ai-typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>
            <div className="ai-quick-questions">
              {quickQuestions.map((q, index) => (
                <button key={index} onClick={() => { setInputValue(q.text); sendMessage(); }} className="ai-quick-question-btn">
                  {renderIcon(q.icon, 'icon-xs')}
                  <span>{q.text.split(' ').pop()}</span>
                </button>
              ))}
            </div>
            <div className="ai-chat-input">
              <input type="text" placeholder="Type your question..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage} className="ai-send-btn"><Send className="icon-sm" /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          <DriverSidebarDesktop userName={userName} />
          <div className="desktop-main">
            <div className="ai-desktop-header">
              <div>
                <h1><Robot className="ai-header-icon" /> AI Assistant</h1>
                <p>Get help with driver features and guidelines</p>
              </div>
            </div>
            <div className="ai-desktop-grid">
              <TopicsListCard />
              <TopicsDetailCard />
              <ChatCard />
            </div>
          </div>
        </div>
      )}
    </>
  );

  function TopicsListCard() {
    return (
      <div className="cd-card">
        <h2 className="ai-card-title"><Send className="ai-card-icon" /> Topics</h2>
        <div className="ai-topics-list">
          {Object.entries(topicsData).map(([key, topic]) => (
            <div key={key} onClick={() => showTopics(key)} className={`ai-topic-list-item ${selectedCategory === key ? 'selected' : ''}`}>
              <div className="ai-topic-list-icon" style={{ background: topic.bgColor, color: topic.color }}>
                {renderIcon(topic.icon, 'icon-sm')}
              </div>
              <div>
                <h3>{topic.title}</h3>
                <p>{topic.items.length} articles</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function TopicsDetailCard() {
    return (
      <div className="cd-card">
        <h2 className="ai-card-title"><Car className="ai-card-icon" /> Selected Topic</h2>
        {selectedCategory && topicsData[selectedCategory] ? (
          <div className="ai-detail-list">
            {topicsData[selectedCategory].items.map((item, index) => (
              <div key={index} onClick={() => showAnswer(item.answer)} className="ai-detail-item">
                <div className="ai-detail-icon" style={{ background: topicsData[selectedCategory].bgColor, color: topicsData[selectedCategory].color }}>
                  {renderIcon(item.icon, 'icon-sm')}
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ai-empty-state">
            {renderIcon('Car', 'ai-empty-icon')}
            <p>Select a topic to view guides</p>
          </div>
        )}
      </div>
    );
  }

  function ChatCard() {
    return (
      <div className="cd-card ai-chat-card">
        <div className="ai-chat-header">
          <div className="ai-chat-avatar">{renderIcon('Robot', 'icon-md')}</div>
          <div>
            <h3>Speedly AI</h3>
            <p>Online - Ready to help</p>
          </div>
        </div>
        <div ref={chatBodyRef} className="ai-chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`ai-message ${msg.type === 'user' ? 'user-message' : ''}`}>
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="ai-typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>
        <div className="ai-quick-questions">
          {quickQuestions.map((q, index) => (
            <button key={index} onClick={() => { setInputValue(q.text); sendMessage(); }} className="ai-quick-question-btn">
              {renderIcon(q.icon, 'icon-xs')}
              <span>{q.text.split(' ').pop()}</span>
            </button>
          ))}
        </div>
        <div className="ai-chat-input">
          <input type="text" placeholder="Type your question..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
          <button onClick={sendMessage} className="ai-send-btn"><Send className="icon-sm" /></button>
        </div>
      </div>
    );
  }
}
