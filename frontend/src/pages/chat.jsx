import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState('reality_checker');
  
  const messagesEndRef = useRef(null);

  // Instant scroll (no 'smooth' behavior) to prevent screen shaking during streaming
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 🚨 CHANGED: Now using the environment variable
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/history`);
        const data = await response.json();
        
        if (data.length > 0) {
          setMessages(data);
        } else {
          setMessages([{ role: 'bot', content: 'Hello! I am your AI assistant. How can I help you today?' }]);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      // 🚨 CHANGED: Now using the environment variable
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, personality: personality }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      setMessages((prev) => [...prev, { role: 'bot', content: '' }]);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastIndex = updatedMessages.length - 1;
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content: updatedMessages[lastIndex].content + chunk
          };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Sorry, my connection was interrupted.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-slate-950 text-slate-200 relative rounded-tl-2xl">
      
      <header className="shrink-0 min-h-[76px] bg-slate-900/90 backdrop-blur-md px-6 flex justify-between items-center border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
          <h1 className="text-xl font-semibold tracking-wide text-slate-100">
            AI <span className="text-indigo-400">Reality Checker</span>
          </h1>
        </div>
        
        <select 
          value={personality} 
          onChange={(e) => setPersonality(e.target.value)}
          className="bg-slate-800 text-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-700 shadow-sm cursor-pointer hover:bg-slate-700 transition-colors"
        >
          <option value="reality_checker">Standard (Reality Checker)</option>
          <option value="sarcastic_dev">Sarcastic Developer</option>
          <option value="pirate">Salty Pirate</option>
        </select>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-none shadow-indigo-500/20' 
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700'
              }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl rounded-bl-none flex space-x-2 items-center shadow-sm">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      <footer className="shrink-0 p-4 md:p-6 bg-slate-950">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 items-center bg-slate-800/80 backdrop-blur-md p-2 rounded-full border border-slate-700 shadow-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your situation here..."
            className="flex-1 bg-transparent text-slate-100 px-6 py-3 focus:outline-none placeholder-slate-400"
            disabled={isLoading && messages[messages.length - 1]?.role === 'user'}
          />
          <button
            type="submit"
            disabled={(isLoading && messages[messages.length - 1]?.role === 'user') || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 active:scale-95"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}