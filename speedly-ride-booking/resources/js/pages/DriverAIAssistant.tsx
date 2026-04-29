import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClientSidebar from '../components/DriverSidebar';
import Preloader from '../components/Preloader';
import MobileNav from '../components/DriverMobileNav';
import { userAPI } from '../services/api';

export default function AIAssistant() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userName, setUserName] = useState('User');
  const [messages, setMessages] = useState([
    { type: 'ai', text: "Hello! I'm your Speedly AI Assistant. I can help you with booking rides, payments, safety tips, and more. What would you like to know?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatBodyRef = useRef(null);

  const topicsData = {
    'getting-started': {
      title: 'Getting Started',
      icon: 'fa-rocket',
      bgColor: '#fff5f0',
      color: '#ff5e00',
      items: [
        { title: 'Create an Account', description: 'Sign up and get started', icon: 'fa-user-plus', answer: 'To create an account:\n\n1. Download the Speedly app\n2. Tap "Sign Up"\n3. Enter your details\n4. Verify your phone number\n5. Start booking rides!' },
        { title: 'Complete Your Profile', description: 'Add your personal info', icon: 'fa-user-edit', answer: 'Complete your profile:\n\n1. Go to Settings\n2. Tap "Edit Profile"\n3. Add your name, email, phone\n4. Upload a profile picture\n5. Save changes' },
        { title: 'Set Up Payment', description: 'Add payment methods', icon: 'fa-credit-card', answer: 'Set up payment:\n\n1. Go to Wallet\n2. Tap "Payment Methods"\n3. Add card or bank details\n4. Set default method\n5. You\'re ready to pay!' }
      ]
    },
    'booking': {
      title: 'Booking',
      icon: 'fa-car',
      bgColor: '#e8f5e9',
      color: '#2e7d32',
      items: [
        { title: 'Book a Ride', description: 'How to book your first ride', icon: 'fa-car', answer: 'To book a ride:\n\n1. Go to your dashboard\n2. Tap "Book Ride"\n3. Set pickup & destination\n4. Choose vehicle type\n5. Confirm & pay\n\nNeed more help? I can show you detailed guides!' },
        { title: 'Cancel a Ride', description: 'How to cancel bookings', icon: 'fa-times', answer: 'To cancel a ride:\n\n1. Open active ride\n2. Tap "Cancel Ride"\n3. Select reason\n\n⚠️ Free within 2 minutes. After that, a small fee may apply.' },
        { title: 'Choose Vehicle Type', description: 'Select the right ride', icon: 'fa-car-side', answer: 'Vehicle types:\n\n🚗 Compact - Budget-friendly\n🚙 Comfort - Extra space\n🚐 XL - Large groups\n\nChoose based on your needs and budget!' }
      ]
    },
    'payments': {
      title: 'Payments',
      icon: 'fa-wallet',
      bgColor: '#e3f2fd',
      color: '#1565c0',
      items: [
        { title: 'Add Money to Wallet', description: 'Fund your wallet', icon: 'fa-plus', answer: 'To add funds to your wallet:\n\n1. Go to Wallet\n2. Tap "Add to Wallet"\n3. Enter amount\n4. Pay via KoraPay\n5. Funds credited instantly!\n\nMinimum: ₦100 | Maximum: ₦500,000' },
        { title: 'Withdraw Earnings', description: 'For drivers', icon: 'fa-money-bill', answer: 'As a driver, to withdraw earnings:\n\n1. Go to Wallet\n2. Tap "Withdraw"\n3. Enter amount (min ₦1,000)\n4. Select/add bank details\n5. Submit request\n\nProcessed within 24-48 hours!' },
        { title: 'View Transaction History', description: 'Check your payments', icon: 'fa-history', answer: 'View transactions:\n\n1. Go to Wallet\n2. Scroll to "Recent Transactions"\n3. Tap any transaction for details\n\nYou can also see all transactions in Ride History!' }
      ]
    },
    'safety': {
      title: 'Safety',
      icon: 'fa-shield-alt',
      bgColor: '#fce4ec',
      color: '#c62828',
      items: [
        { title: 'Safety Tips', description: 'Stay safe on rides', icon: 'fa-shield-alt', answer: 'Safety tips:\n\n✅ Verify driver details before ride\n✅ Share your trip with contacts\n✅ Rate drivers honestly\n✅ Report issues via Support\n\nFor emergencies, call 911 first!' },
        { title: 'Emergency Contacts', description: 'Who to contact', icon: 'fa-phone', answer: 'Emergency contacts:\n\n📞 Speedly Support: +234 800 000 0000\n📧 Email: speedlyentreprise01@gmail.com\n\nFor life-threatening emergencies, call 911 immediately!' },
        { title: 'Report an Issue', description: 'How to report problems', icon: 'fa-flag', answer: 'Report issues:\n\n1. Go to Support page\n2. Open a support ticket\n3. Describe the issue\n4. Attach screenshots if needed\n\nResponse time: within 24 hours' }
      ]
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchData = async () => {
    try {
      const profileRes = await userAPI.getProfile();
      const profile = profileRes.data?.user || profileRes.data?.profile || profileRes.data;
      
      if (profile) {
        setUserData({
          fullname: profile.full_name || profile.name || 'User',
          role: profile.role || 'client',
          email: profile.email,
          phone: profile.phone,
          logged_in: true
        });
        setUserName(profile.full_name || profile.name || 'User');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          fullname: parsedUser.name || 'User',
          role: 'client',
          logged_in: true
        });
        setUserName(parsedUser.name || 'User');
      }
    } finally {
      setLoading(false);
    }
  };

  const getAIResponse = (question) => {
    const q = question.toLowerCase();
    
    if (q.includes('book') || q.includes('ride')) {
      return 'To book a ride:\n\n1. Go to your dashboard\n2. Tap "Book Ride"\n3. Set pickup & destination\n4. Choose vehicle type\n5. Confirm & pay\n\nNeed more help? I can show you detailed guides!';
    }
    if (q.includes('wallet') || q.includes('add money') || q.includes('deposit') || q.includes('fund')) {
      return 'To add funds to your wallet:\n\n1. Go to Wallet\n2. Tap "Add to Wallet"\n3. Enter amount\n4. Pay via KoraPay\n5. Funds credited instantly!\n\nMinimum: ₦100 | Maximum: ₦500,000';
    }
    if (q.includes('cancel')) {
      return 'To cancel a ride:\n\n1. Open active ride\n2. Tap "Cancel Ride"\n3. Select reason\n\n⚠️ Free within 2 minutes. After that, a small fee may apply.';
    }
    if (q.includes('support') || q.includes('help') || q.includes('contact')) {
      return 'Need support? Here are your options:\n\n📱 Go to Support page in your dashboard\n💬 Open a support ticket\n📧 Email: speedlyentreprise01@gmail.com\n📞 Phone: +234 800 000 0000\n\nResponse time: within 24 hours';
    }
    if (q.includes('driver') && q.includes('withdraw')) {
      return 'As a driver, to withdraw earnings:\n\n1. Go to Wallet\n2. Tap "Withdraw"\n3. Enter amount (min ₦1,000)\n4. Select/add bank details\n5. Submit request\n\nProcessed within 24-48 hours!';
    }
    if (q.includes('safety') || q.includes('emergency')) {
      return 'Safety tips:\n\n✅ Verify driver details before ride\n✅ Share your trip with contacts\n✅ Rate drivers honestly\n✅ Report issues via Support\n\nFor emergencies, call 911 first!';
    }
    
    return "I'm here to help! Try asking about:\n• Booking rides\n• Wallet & payments\n• Driver earnings (for drivers)\n• Safety guidelines\n• Troubleshooting\n\nOr browse the topics on the left!";
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

  const showTopics = (category) => {
    setSelectedCategory(category);
  };

  const showAnswer = (answer) => {
    setMessages(prev => [...prev, { type: 'ai', text: answer }]);
  };

  const quickQuestions = [
    { text: 'How do I book a ride?', icon: 'fa-car' },
    { text: 'How do I add money?', icon: 'fa-plus' },
    { text: 'How do I cancel?', icon: 'fa-times' },
    { text: 'How do I contact support?', icon: 'fa-headset' }
  ];

  const numberStyle = { fontFamily: '"Outfit", sans-serif' };

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="dashboard-container">
      {/* MOBILE VIEW */}
      <div className="mobile-view">
        {/* Hero Header */}
        <div className="ai-hero">
          <div className="ai-title">
            <h1>
              <i className="fas fa-robot"></i>AI Assistant
            </h1>
            <p>Get help with Speedly</p>
          </div>
        </div>

        {/* Topics Grid Card */}
        <div className="ai-topics-card">
          <h2>Browse Topics</h2>
          <div className="ai-topics-grid">
            <div className="ai-topic-item" onClick={() => showTopics('getting-started')} style={{background: '#fff5f0'}}>
              <div className="ai-topic-icon" style={{background: '#ff5e00', color: 'white'}}>
                <i className="fas fa-rocket"></i>
              </div>
              <span>Getting Started</span>
            </div>
            <div className="ai-topic-item" onClick={() => showTopics('booking')} style={{background: '#e8f5e9'}}>
              <div className="ai-topic-icon" style={{background: '#2e7d32', color: 'white'}}>
                <i className="fas fa-car"></i>
              </div>
              <span>Booking</span>
            </div>
            <div className="ai-topic-item" onClick={() => showTopics('payments')} style={{background: '#e3f2fd'}}>
              <div className="ai-topic-icon" style={{background: '#1565c0', color: 'white'}}>
                <i className="fas fa-wallet"></i>
              </div>
              <span>Payments</span>
            </div>
            <div className="ai-topic-item" onClick={() => showTopics('safety')} style={{background: '#fce4ec'}}>
              <div className="ai-topic-icon" style={{background: '#c62828', color: 'white'}}>
                <i className="fas fa-shield-alt"></i>
              </div>
              <span>Safety</span>
            </div>
          </div>
        </div>

        {/* Selected Topic */}
        {selectedCategory && topicsData[selectedCategory] && (
          <div className="ai-detail-card">
            <h2>{topicsData[selectedCategory].title}</h2>
            <div className="ai-detail-list">
              {topicsData[selectedCategory].items.map((item, index) => (
                <div key={index} className="ai-detail-item" onClick={() => showAnswer(item.answer)}>
                  <i className={`fas ${item.icon}`} style={{background: topicsData[selectedCategory].bgColor, color: topicsData[selectedCategory].color}}></i>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Section */}
        <div className="ai-chat-card">
          <h2>Quick Chat</h2>
          <div className="ai-welcome-msg">{messages[0].text}</div>
          <div className="ai-quick-chips">
            {quickQuestions.map((q, index) => (
              <button key={index} className="ai-quick-chip" onClick={() => { setInputValue(q.text); sendMessage(); }}>
                {q.text}
              </button>
            ))}
          </div>
          <div className="ai-input-row">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
            />
            <button className="ai-send-btn" onClick={sendMessage}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

        <MobileNav />
      </div>

      {/* DESKTOP VIEW */}
      <div className="desktop-view">
        <ClientSidebar userName={userName} />

        <div className="desktop-main">
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px'}}>
            <div>
              <h1 style={{fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', color: '#111', marginBottom: '2px'}}>
                <i className="fas fa-robot" style={{color: '#ff5e00', marginRight: '12px'}}></i>AI Assistant
              </h1>
              <p style={{fontSize: '13px', color: '#9ca3af'}}>Get help and learn about Speedly features</p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div style={{background: 'white', border: '1px solid #f0f0f0', padding: '10px 18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
                <i className="fas fa-wallet" style={{color: '#ff5e00', marginRight: '8px'}}></i>
                <span style={{fontWeight: 600, ...numberStyle}}>₦12,450</span>
              </div>
              <button style={{width: '44px', height: '44px', background: 'white', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', color: '#666', fontSize: '18px', cursor: 'pointer'}}>
                <i className="fas fa-bell"></i>
              </button>
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: '24px', height: 'calc(100vh - 180px)'}}>
            <TopicsListCard />
            <TopicsDetailCard />
            <ChatCard />
          </div>
        </div>
      </div>
    </div>
  );

  function TopicsListCard() {
    return (
      <div className="cd-card">
        <h2>
          <i className="fas fa-tags" style={{color: '#ff5e00', marginRight: '10px'}}></i>Topics
        </h2>
        {Object.entries(topicsData).map(([key, topic]) => (
          <div key={key} onClick={() => showTopics(key)} style={{display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px', background: selectedCategory === key ? topic.bgColor : '#f8f8f8', borderRadius: '12px', cursor: 'pointer', border: selectedCategory === key ? `1px solid ${topic.color}` : '1px solid transparent'}}>
            <div style={{width: '40px', height: '40px', minWidth: '40px', background: topic.bgColor, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: topic.color, fontSize: '16px'}}>
              <i className={`fas ${topic.icon}`}></i>
            </div>
            <div>
              <h3 style={{fontSize: '14px', fontWeight: 600, color: '#111', margin: '0 0 4px 0'}}>{topic.title}</h3>
              <p style={{fontSize: '11px', color: '#666', margin: 0}}>{topic.items.length} articles</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function TopicsDetailCard() {
    return (
      <div className="cd-card">
        <h2>
          <i className="fas fa-list" style={{color: '#ff5e00', marginRight: '10px'}}></i>Selected Topic
        </h2>
        {selectedCategory && topicsData[selectedCategory] ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {topicsData[selectedCategory].items.map((item, index) => (
              <div key={index} onClick={() => showAnswer(item.answer)} style={{display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', background: '#f8f8f8', borderRadius: '12px', cursor: 'pointer'}}>
                <div style={{width: '40px', height: '40px', minWidth: '40px', background: topicsData[selectedCategory].bgColor, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: topicsData[selectedCategory].color, fontSize: '16px'}}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <div>
                  <h3 style={{fontSize: '14px', fontWeight: 600, color: '#111', margin: '0 0 4px 0'}}>{item.title}</h3>
                  <p style={{fontSize: '12px', color: '#666', margin: 0}}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '60px 20px', color: '#888'}}>
            <i className="fas fa-hand-pointer" style={{fontSize: '48px', marginBottom: '16px', color: '#ff5e00'}}></i>
            <p style={{fontSize: '14px'}}>Select a topic from the left to see detailed guides</p>
          </div>
        )}
      </div>
    );
  }

  function ChatCard() {
    return (
      <div className="cd-card" style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0', marginBottom: '16px'}}>
          <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px'}}>
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h3>Speedly AI</h3>
            <p style={{fontSize: '12px', color: '#16a34a', margin: 0}}>Online - Ready to help</p>
          </div>
        </div>
        <div ref={chatBodyRef} style={{flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0'}}>
          {messages.map((msg, index) => (
            <div key={index} style={{maxWidth: '85%', padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: '1.5', alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start', background: msg.type === 'user' ? 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)' : '#f8f8f8', color: msg.type === 'user' ? 'white' : '#333', whiteSpace: 'pre-wrap'}}>
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div style={{display: 'flex', gap: '4px', padding: '12px 16px', background: '#f8f8f8', borderRadius: '16px', width: 'fit-content'}}>
              <span style={{width: '8px', height: '8px', background: '#ff5e00', borderRadius: '50%'}}></span>
              <span style={{width: '8px', height: '8px', background: '#ff5e00', borderRadius: '50%'}}></span>
              <span style={{width: '8px', height: '8px', background: '#ff5e00', borderRadius: '50%'}}></span>
            </div>
          )}
        </div>
        <div style={{display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap'}}>
          {quickQuestions.map((q, index) => (
            <button key={index} onClick={() => { setInputValue(q.text); sendMessage(); }} style={{padding: '8px 14px', background: '#f8f8f8', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontFamily: '"Syne", sans-serif'}}>
              <i className={`fas ${q.icon}`} style={{fontSize: '10px', color: '#ff5e00'}}></i>
              {q.text.split(' ').pop()}
            </button>
          ))}
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <input type="text" placeholder="Type your question here..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} style={{flex: 1, padding: '14px 18px', border: '1px solid #e8e8e8', borderRadius: '12px', fontSize: '14px', fontFamily: '"Syne", sans-serif', outline: 'none'}} />
          <button onClick={sendMessage} style={{width: '48px', background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    );
  }
}