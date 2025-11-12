import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, MessageSquare, FileText, Camera, Send, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Citizen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'नमस्ते! मैं ग्रामसाथी हूँ। मैं आपकी कैसे मदद कर सकता हूँ? / Hello! I am GramSathi. How can I help you?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gramsathi-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })).concat([{ role: 'user', content: inputMessage }]),
          language: 'en'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from GramSathi');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling GramSathi:', error);
      toast({
        title: "Error",
        description: "Failed to connect to GramSathi. Please try again.",
        variant: "destructive"
      });
    }
  };

  const quickActions = [
    { icon: FileText, label: 'Apply for Job', action: () => toast({ title: "Coming soon", description: "Job application feature" }) },
    { icon: Camera, label: 'Report Issue', action: () => toast({ title: "Coming soon", description: "Issue reporting feature" }) },
    { icon: MapPin, label: 'Find Schemes', action: () => toast({ title: "Coming soon", description: "Schemes directory" }) },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ग्रामसाथी / GramSathi</h1>
              <p className="text-xs text-muted-foreground">Your Rural Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, idx) => (
            <Card 
              key={idx}
              className="cursor-pointer hover:shadow-card transition-shadow"
              onClick={action.action}
            >
              <CardContent className="p-4 text-center">
                <action.icon className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col shadow-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Chat with GramSathi
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Camera className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Mic className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type your message... / अपना संदेश लिखें..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="bg-gradient-hero">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Section */}
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Available in:</strong> हिंदी, English, and 20+ Indian languages
              <br />
              <strong>Features:</strong> Job applications, issue reporting, scheme information, status tracking
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Citizen;
