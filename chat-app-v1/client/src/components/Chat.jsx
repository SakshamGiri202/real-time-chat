import { useEffect, useState, useRef } from "react";

// Mock Socket.IO for demo purposes since we can't connect to localhost
const createMockSocket = () => {
    const listeners = {};
    let isConnected = true;

    return {
        on: (event, callback) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(callback);
        },
        emit: (event, data) => {
            if (event === "message" && isConnected) {
                // Simulate receiving the message back (echo)
                setTimeout(() => {
                    if (listeners.message) {
                        listeners.message.forEach(callback => callback(data));
                    }
                }, 100);
            }
        },
        off: (event) => {
            delete listeners[event];
        },
        disconnect: () => {
            isConnected = false;
        }
    };
};

function Chat() {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Create socket connection once
        socketRef.current = createMockSocket();
        const socket = socketRef.current;

        // Listen for incoming messages
        socket.on("message", (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        // Add a welcome message
        setTimeout(() => {
            const welcomeMessage = {
                text: "Welcome to the chat! This is a demo with mock socket connection.",
                timestamp: new Date().toISOString(),
                isSystem: true
            };
            setMessages([welcomeMessage]);
        }, 500);

        return () => {
            socket.off('message');
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = () => {
        if (messageInput.trim() !== "" && socketRef.current) {
            const message = {
                text: messageInput,
                timestamp: new Date().toISOString(),
                isSystem: false
            };

            // Emit message through existing socket connection
            socketRef.current.emit("message", message);
            setMessageInput("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="flex justify-center items-center w-full h-screen bg-gradient-to-b from-blue-300 to-blue-200">
            <div className="bg-white rounded-lg w-96 h-96 p-4 shadow-lg">
                <div className="flex flex-col h-full">
                    <div className="flex-1 p-3 overflow-y-auto bg-gray-50 rounded-md mb-3">
                        {messages.map((msg, index) => (
                            <div key={index} className="mb-3">
                                <div className={`inline-block p-2 rounded-lg max-w-xs break-words ${msg.isSystem
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-blue-500 text-white ml-auto'
                                    }`}>
                                    {msg.text}
                                </div>
                                <div className="text-gray-400 text-xs mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
                            placeholder="Type your message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                            onClick={sendMessage}
                            disabled={!messageInput.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;