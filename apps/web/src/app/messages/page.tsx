'use client';

import { useState } from 'react';
import { Card, Input, Button } from '@boulot/ui';

export default function MessagesPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi, I saw your proposal. Are you available for a quick call?', sender: 'sme' },
    { id: 2, text: 'Yes! Im free anytime tomorrow afternoon.', sender: 'me' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, sender: 'me' }]);
    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto h-[70vh] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      
      <Card className="flex-1 flex flex-col p-4 bg-gray-50 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[70%] ${msg.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type your message..."
            style={{ marginBottom: 0, flex: 1 }}
          />
          <Button type="submit">Send</Button>
        </form>
      </Card>
    </div>
  );
}
