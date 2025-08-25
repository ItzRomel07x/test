import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, User } from "lucide-react";
import { ChatMessage } from "@shared/schema";

interface Message extends ChatMessage {
  timestamp: Date;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Load saved chat data on component mount
  useEffect(() => {
    const loadSavedChatData = async () => {
      try {
        const savedUsername = localStorage.getItem('chat_username');
        const savedSessionId = localStorage.getItem('chat_session_id');

        console.log('Loading saved chat data:', { savedUsername, savedSessionId });

        if (savedUsername && savedSessionId) {
          // Verify session still exists on server
          const sessionResponse = await fetch(`/api/chat/sessions/${savedSessionId}/messages`);

          if (sessionResponse.ok) {
            // Session exists, restore the chat
            setUsername(savedUsername);
            setSessionId(savedSessionId);
            setShowNamePrompt(false);

            // Load existing messages
            const existingMessages = await sessionResponse.json();
            console.log('Loaded existing messages from saved session:', existingMessages);
            setMessages(existingMessages.map((msg: ChatMessage) => ({
              ...msg,
              timestamp: new Date(msg.createdAt)
            })));

            // Connect WebSocket
            connectWebSocket(savedSessionId);
          } else {
            // Session doesn't exist anymore, clear saved data
            console.log('Saved session no longer exists, clearing data');
            localStorage.removeItem('chat_username');
            localStorage.removeItem('chat_session_id');
          }
        }
      } catch (error) {
        console.error('Error loading saved chat data:', error);
        localStorage.removeItem('chat_username');
        localStorage.removeItem('chat_session_id');
      }

      setIsLoading(false);
    };

    loadSavedChatData();
  }, []);

  const connectWebSocket = (sessionToJoin: string) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log('Connecting WebSocket for session:', sessionToJoin);
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('User WebSocket connected, joining session:', sessionToJoin);
      setIsConnected(true);

      // Join the session immediately
      socketRef.current?.send(JSON.stringify({
        type: 'join_session',
        sessionId: sessionToJoin
      }));
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('User chat received WebSocket message:', data);

        if (data.type === 'new_message') {
          const message = data.payload;
          console.log('Processing new message for session:', message.sessionId, 'current session:', sessionToJoin);

          // Add message if it belongs to this session
          if (message.sessionId === sessionToJoin) {
            console.log('Adding message to chat:', message);
            setMessages(prev => {
              // Check if message already exists
              const exists = prev.some(msg => 
                msg.id === message.id || 
                (msg.message === message.message && 
                 msg.username === message.username && 
                 Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 2000)
              );

              if (!exists) {
                return [...prev, {
                  ...message,
                  timestamp: new Date(message.createdAt)
                }];
              }
              return prev;
            });
          }
        }

        if (data.type === 'session_joined') {
          console.log('Successfully joined session:', data.sessionId);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socketRef.current.onclose = () => {
      console.log('User WebSocket disconnected');
      setIsConnected(false);

      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (sessionToJoin) {
          console.log('Attempting to reconnect WebSocket');
          connectWebSocket(sessionToJoin);
        }
      }, 3000);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const handleStartChat = async () => {
    if (!username.trim()) return;

    const newSessionId = generateSessionId();
    console.log('Creating new chat session:', newSessionId);

    try {
      // Create chat session
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newSessionId,
          username: username.trim(),
          isActive: true
        }),
      });

      if (response.ok) {
        console.log('Chat session created successfully');
        setSessionId(newSessionId);
        setShowNamePrompt(false);

        // Save to localStorage
        localStorage.setItem('chat_username', username.trim());
        localStorage.setItem('chat_session_id', newSessionId);
        console.log('Saved chat data to localStorage');

        // Load existing messages
        try {
          const messagesResponse = await fetch(`/api/chat/sessions/${newSessionId}/messages`);
          if (messagesResponse.ok) {
            const existingMessages = await messagesResponse.json();
            console.log('Loaded existing messages:', existingMessages);
            setMessages(existingMessages.map((msg: ChatMessage) => ({
              ...msg,
              timestamp: new Date(msg.createdAt)
            })));
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        }

        // Connect WebSocket after everything is set up
        connectWebSocket(newSessionId);
      } else {
        console.error('Failed to create chat session');
      }
    } catch (error) {
      console.error('Error starting chat session:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId) {
      console.log('Cannot send message: missing message or session');
      return;
    }

    const messageData = {
      sessionId,
      username,
      message: newMessage.trim(),
      isAdmin: false,
      userId: null
    };

    console.log('Sending user message:', messageData);

    // Send via WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat_message',
        payload: messageData
      }));
    } else {
      // Fallback: send via HTTP API
      try {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });
      } catch (error) {
        console.error('Error sending message via API:', error);
      }
    }

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showNamePrompt) {
        handleStartChat();
      } else {
        sendMessage();
      }
    }
  };

  const resetChat = () => {
    console.log('Resetting chat');
    setMessages([]);
    setUsername("");
    setSessionId("");
    setShowNamePrompt(true);
    setIsConnected(false);

    // Clear localStorage
    localStorage.removeItem('chat_username');
    localStorage.removeItem('chat_session_id');
    console.log('Cleared chat data from localStorage');

    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full btn-glow shadow-2xl z-40"
          size="icon"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] max-w-80 h-[calc(100vh-8rem)] max-h-96 sm:w-80 sm:h-96 bg-black/95 border-red-500/30 backdrop-blur-lg z-40">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-red-500/30">
            <CardTitle className="text-red-500 text-lg">
              {showNamePrompt ? "Live Support" : `Chat - ${username}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              {!showNamePrompt && (
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-80 flex flex-col">
            {isLoading ? (
              // Loading Screen
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm">Loading chat...</p>
              </div>
            ) : showNamePrompt ? (
              // Name Input Screen
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <User className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Welcome to Support</h3>
                <p className="text-gray-400 text-sm mb-6">Please enter your name to start chatting with our support team</p>

                <div className="w-full space-y-4">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your name..."
                    className="bg-gray-900/50 border-red-500/30 text-white placeholder-gray-500"
                    autoFocus
                  />
                  <Button 
                    onClick={handleStartChat}
                    disabled={!username.trim()}
                    className="w-full btn-glow"
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            ) : (
              // Chat Interface
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-8">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Start a conversation...</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            message.isAdmin
                              ? 'bg-red-500/20 text-white border border-red-500/30'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          {message.isAdmin && (
                            <div className="text-red-400 text-xs font-medium mb-1">Support</div>
                          )}
                          <div>{message.message}</div>
                          <div className={`text-xs mt-1 opacity-60 ${message.isAdmin ? 'text-red-300' : 'text-gray-300'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-red-500/30">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-900/50 border-red-500/30 text-white placeholder-gray-500"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="btn-glow px-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {!isConnected && !showNamePrompt && (
                    <div className="text-xs text-red-400 mt-2 text-center">
                      Reconnecting...
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2 text-center">
                    <button onClick={resetChat} className="hover:text-red-400 transition-colors">
                      Start New Chat
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}