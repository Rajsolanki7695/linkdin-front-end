import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Send,
  AlertCircle,
  Circle,
  Check,
  CheckCheck,
  Clock,
} from "lucide-react";
import { Navbar } from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import API from "../services/api";

export const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const targetQueryUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [canChat, setCanChat] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await API.get("/chats/conversations");
      setConversations(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching conversations:", err);
      return [];
    }
  };

  const handleSelectPartner = async (partner) => {
    setActivePartner(partner);
    setErrorMessage("");
    setLoadingHistory(true);

    try {
      await API.get(`/chats/permission/${partner._id}`);
      setCanChat(true);

      const res = await API.get(`/chats/${partner._id}`);
      setMessages(res.data);

      // Emit read status to sender
      if (socket) {
        socket.emit("mark_read", { senderId: partner._id });
      }
    } catch (err) {
      setCanChat(false);
      setErrorMessage(
        err.message || "You can only chat with users you follow.",
      );
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 1. Initial conversation load & handle URL query navigation from profile
  useEffect(() => {
    fetchConversations().then((convos) => {
      if (targetQueryUserId) {
        const existing = convos.find(
          (c) => c.partner._id === targetQueryUserId,
        );
        if (existing) {
          handleSelectPartner(existing.partner);
        } else {
          // Fetch target profile directly if no active conversation exists yet
          API.get(`/users/${targetQueryUserId}`)
            .then((res) => handleSelectPartner(res.data))
            .catch(() => setErrorMessage("User not found"));
        }
      }
    });
  }, [targetQueryUserId]);

  // 2. Socket Listeners for Delivery & Read Status
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (activePartner && newMessage.sender._id === activePartner._id) {
        setMessages((prev) => [...prev, newMessage]);
        socket.emit("mark_read", { senderId: activePartner._id });
      }
      fetchConversations();
    };

    const handleMessagesRead = ({ readBy }) => {
      if (activePartner && activePartner._id === readBy) {
        setMessages((prev) =>
          prev.map((msg) =>
            (msg.sender?._id || msg.sender) === user._id
              ? { ...msg, status: "read" }
              : msg,
          ),
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, activePartner, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Send Message with Optimistic Socket Delivery
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activePartner || !socket || !canChat) return;

    const messageText = inputMessage.trim();
    const tempId = `temp_${Date.now()}`;

    // Optimistic pending state
    const optimisticMessage = {
      _id: tempId,
      sender: { _id: user._id, name: user.name, avatar: user.avatar },
      receiver: activePartner._id,
      message: messageText,
      status: "sending",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputMessage("");

    socket.emit(
      "send_message",
      { receiverId: activePartner._id, message: messageText },
      (response) => {
        if (response?.success) {
          // Replace optimistic message with actual persisted data from backend
          setMessages((prev) =>
            prev.map((msg) => (msg._id === tempId ? response.data : msg)),
          );
          fetchConversations();
        } else {
          alert(response?.error || "Failed to send message");
          setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        }
      },
    );
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-blue-200" />;
      case "sent":
        return <Check className="h-3 w-3 text-blue-200" />;
      case "delivered":
        return <CheckCheck className="h-3.5 w-3.5 text-blue-200" />;
      case "read":
        return <CheckCheck className="h-3.5 w-3.5 text-cyan-300" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />

      <main className="mx-auto max-w-5xl py-6 px-3">
        <div className="flex h-[78vh] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Left Panel: Conversation List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="border-b border-gray-200 p-3 bg-gray-50">
              <h2 className="text-sm font-bold text-gray-700">Messaging</h2>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {conversations.length === 0 ? (
                <p className="p-4 text-xs text-gray-400 text-center">
                  No active chats. Follow someone to start messaging.
                </p>
              ) : (
                conversations.map(({ partner, lastMessage }) => {
                  const isOnline = onlineUsers.has(partner._id);
                  const isSelected = activePartner?._id === partner._id;

                  return (
                    <div
                      key={partner._id}
                      onClick={() => handleSelectPartner(partner)}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={
                            partner.avatar ||
                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          }
                          alt={partner.name}
                          className="h-11 w-11 rounded-full object-cover border"
                        />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {partner.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat */}
          <div className="flex flex-1 flex-col justify-between bg-white">
            {activePartner ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        activePartner.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={activePartner.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {activePartner.name}
                      </h4>
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Circle
                          className={`h-2 w-2 fill-current ${
                            onlineUsers.has(activePartner._id)
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        {onlineUsers.has(activePartner._id)
                          ? "Active Now"
                          : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {!canChat ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />

                      <p className="text-sm font-medium text-gray-700">
                        {errorMessage}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        You must follow this user before sending a direct
                        message.
                      </p>
                    </div>
                  ) : loadingHistory ? (
                    <p className="text-center text-xs text-gray-400 py-10">
                      Loading conversation...
                    </p>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-10">
                      No messages yet. Send a note to say hi!
                    </p>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = (msg.sender?._id || msg.sender) === user._id;
                      return (
                        <div
                          key={msg._id || index}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                              isMe
                                ? "bg-[#0a66c2] text-white rounded-br-none"
                                : "bg-[#f2f2f2] text-gray-900 rounded-bl-none"
                            }`}
                          >
                            <p className="whitespace-pre-line break-words">
                              {msg.message}
                            </p>
                            <div
                              className={`flex items-center gap-1 text-[10px] mt-1 ${
                                isMe
                                  ? "text-blue-100 justify-end"
                                  : "text-gray-400 justify-start"
                              }`}
                            >
                              <span>
                                {new Date(
                                  msg.createdAt || Date.now(),
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMe && renderStatusIcon(msg.status)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {canChat && (
                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-gray-200 p-3 flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Write a message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="rounded-full bg-[#0a66c2] p-2.5 text-white disabled:opacity-50 hover:bg-[#004182] transition"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-gray-400">
                <p className="text-sm font-semibold">Select a conversation</p>
                <p className="text-xs mt-1">
                  Choose someone from the list to view chat history or send a
                  message.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
