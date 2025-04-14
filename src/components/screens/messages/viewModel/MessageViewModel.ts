import { useState, useRef, useEffect } from "react";
import { message } from "antd";

import { useAuth } from "@/context/auth/useAuth";

import { defaultMessagesRepo } from "@/api/features/messages/MessagesRepo";
import { MessageResponseModel } from "@/api/features/messages/models/MessageModel";

interface ExtendedMessageResponseModel extends MessageResponseModel {
  isDateSeparator?: boolean;
}

type MessageWithDate = ExtendedMessageResponseModel;

export const useMessageViewModel = () => {
  const { user, localStrings } = useAuth();

  const [messages, setMessages] = useState<MessageResponseModel[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [isMessagesEnd, setIsMessagesEnd] = useState<boolean>(false);
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, MessageResponseModel[]>>({});
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  const pageSize = 20;
  const messageListRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);
  const scrollPositionRef = useRef<number>(0);
  const messageListenersRef = useRef<Set<(conversationId: string, messages: MessageResponseModel[]) => void>>(new Set());

  const addMessageListener = (callback: (conversationId: string, messages: MessageResponseModel[]) => void) => {
    messageListenersRef.current.add(callback);
    return () => {
      messageListenersRef.current.delete(callback);
    };
  };

  const notifyMessageListeners = (conversationId: string, messages: MessageResponseModel[]) => {
    messageListenersRef.current.forEach(callback => {
      try {
        callback(conversationId, messages);
      } catch (error) {
        console.error("Error in message listener callback:", error);
      }
    });
  };

  const addNewMessage = (conversationId: string, message: MessageResponseModel) => {
    if (!conversationId || !message) {
      return;
    }
    
    setMessagesByConversation(prev => {
      const conversationMessages = prev[conversationId] || [];
      
      const isDuplicate = message.id 
        ? conversationMessages.some(msg => msg.id === message.id)
        : conversationMessages.some(
            msg => 
              msg.content === message.content && 
              msg.user_id === message.user_id &&
              Math.abs(new Date(msg.created_at || "").getTime() - 
                      new Date(message.created_at || "").getTime()) < 2000
          );
      
      if (isDuplicate) {
        return prev;
      }
      
      const formattedMessage = {
        ...message,
        isTemporary: false,
        fromServer: true
      };
      
      const updatedMessages = [...conversationMessages, formattedMessage].sort(
        (a, b) => new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
      );
      
      notifyMessageListeners(conversationId, updatedMessages);
      
      if (conversationId === currentConversationId) {
        setMessages(processMessagesWithDateSeparators(updatedMessages));
      }
      
      return {
        ...prev,
        [conversationId]: updatedMessages
      };
    });
  };

  const getMessagesForConversation = (conversationId: string): MessageResponseModel[] => {
    return messagesByConversation[conversationId] || [];
  };

  const updateMessagesForConversation = (conversationId: string, messages: MessageResponseModel[]) => {
    if (!conversationId || !messages || messages.length === 0) return;
    
    const formattedMessages = messages.map(msg => ({
      ...msg,
      isTemporary: false,
      fromServer: true
    }));
    
    setMessagesByConversation(prev => {
      const existingMessages = prev[conversationId] || [];
      
      const messageMap = new Map();
      
      existingMessages.forEach(msg => {
        if (msg.id) {
          messageMap.set(msg.id, msg);
        }
      });
      
      formattedMessages.forEach(msg => {
        if (msg.id) {
          messageMap.set(msg.id, msg);
        } else {
          existingMessages.push(msg);
        }
      });
    
      const uniqueMessages = Array.from(messageMap.values());
      
      const allMessages = [...uniqueMessages, ...existingMessages.filter(msg => !msg.id)];
      
      const finalMessages = allMessages.filter((msg, index, self) => {
        if (!msg.id) {
          return index === self.findIndex(m => 
            m.content === msg.content && 
            m.user_id === msg.user_id &&
            Math.abs(new Date(m.created_at || "").getTime() - 
                    new Date(msg.created_at || "").getTime()) < 2000
          );
        }
        return true; 
      });
      
      const sortedMessages = finalMessages.sort(
        (a, b) => new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
      );
      
      notifyMessageListeners(conversationId, sortedMessages);
      
      return {
        ...prev,
        [conversationId]: sortedMessages
      };
    });
  };

  const formatDateForDisplay = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date);
    const messageDay = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate()
    );
  
    if (messageDay.getTime() === today.getTime()) {
      return "Hôm nay";
    } else if (messageDay.getTime() === yesterday.getTime()) {
      return "Hôm qua";
    } else {
      const day = messageDate.getDate().toString().padStart(2, '0');
      const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
      const year = messageDate.getFullYear();
      
      return `${day}/${month}/${year}`;
    }
  };
  
  const processMessagesWithDateSeparators = (messages: MessageResponseModel[]): MessageWithDate[] => {
    if (!messages || messages.length === 0) return [];
  
    const processedMessages: MessageWithDate[] = [];
    let currentDate: string | null = null;
  
    const sortedMessages = [...messages].sort((a, b) => {
      const dateA = new Date(a.created_at || "");
      const dateB = new Date(b.created_at || "");
      return dateA.getTime() - dateB.getTime();
    });
  
    sortedMessages.forEach((message) => {
      if (message.created_at) {
        const messageDate = new Date(message.created_at);
        
        const messageDateStr = messageDate.toISOString().split('T')[0];
  
        if (messageDateStr !== currentDate) {
          currentDate = messageDateStr;
          
          const formattedDate = formatDateForDisplay(messageDate);
          
          const dateSeparator: MessageWithDate = {
            id: `date-separator-${messageDateStr}`,
            content: formattedDate,
            isDateSeparator: true,
            created_at: message.created_at,
          };
          
          processedMessages.push(dateSeparator);
        }
      }
      
      processedMessages.push(message as MessageWithDate);
    });
  
    return processedMessages;
  };

  const fetchMessages = async (conversationId: string, page: number = 1, shouldAppend: boolean = false) => {
    if (!user?.id || !conversationId) return;
    
    setCurrentConversationId(conversationId);
    setMessagesLoading(true);
    
    if (shouldAppend && messageListRef.current) {
      scrollPositionRef.current = messageListRef.current.scrollHeight - messageListRef.current.scrollTop;
    }
    
    try {
      const response = await defaultMessagesRepo.getMessagesByConversationId({
        conversation_id: conversationId,
        sort_by: "created_at",
        is_descending: true,
        limit: pageSize,
        page: page
      });
      
      if (response.data) {
        const messageList = Array.isArray(response.data) ? response.data : [response.data];
        
        setIsMessagesEnd(messageList.length < pageSize);
        
        const formattedMessages = messageList.map(msg => ({
          ...msg,
          fromServer: true,
          isTemporary: false
        }));
        
        const sortedApiMessages = [...formattedMessages].sort((a, b) => {
          const dateA = new Date(a.created_at || "");
          const dateB = new Date(b.created_at || "");
          return dateA.getTime() - dateB.getTime();
        });
        
        let existingMessages = shouldAppend ? [...messages] : [];
        
        if (shouldAppend) {
          const existingMessageMap = new Map();
          existingMessages.forEach(msg => {
            if (msg.id) {
              existingMessageMap.set(msg.id, true);
            }
          });
          
          const uniqueNewMessages = sortedApiMessages.filter(msg => 
            !msg.id || !existingMessageMap.has(msg.id)
          );
          
          const firstApiMsgTime = new Date(sortedApiMessages[0]?.created_at || Date.now()).getTime();
          const firstExistingMsgTime = new Date(existingMessages[0]?.created_at || Date.now()).getTime();
          
          let updatedMessages = [];
          if (firstApiMsgTime < firstExistingMsgTime) {
            updatedMessages = [...uniqueNewMessages, ...existingMessages];
          } else {
            updatedMessages = [...existingMessages, ...uniqueNewMessages];
          }
          
          const sortedMessages = updatedMessages.sort((a, b) => {
            const dateA = new Date(a.created_at || "");
            const dateB = new Date(b.created_at || "");
            return dateA.getTime() - dateB.getTime();
          });
          
          const messagesWithDateSeparators = processMessagesWithDateSeparators(sortedMessages);

          setMessages(messagesWithDateSeparators);

          updateMessagesForConversation(conversationId, sortedMessages);
          
          setTimeout(() => {
            if (messageListRef.current) {
              messageListRef.current.scrollTop = 
                messageListRef.current.scrollHeight - scrollPositionRef.current;
            }
          }, 50);
        } else {
          const messagesWithDateSeparators = processMessagesWithDateSeparators(sortedApiMessages);
          
          setMessages(messagesWithDateSeparators);
          
          updateMessagesForConversation(conversationId, sortedApiMessages);
          
          setInitialMessagesLoaded(true);
          
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadMoreMessages = async (conversationId: string) => {
    if (conversationId && !messagesLoading && !isMessagesEnd) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchMessages(conversationId, nextPage, true);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, conversationId: string) => {
    const { scrollTop } = e.currentTarget;
    
    if (scrollTop < 100 && !messagesLoading && !isMessagesEnd && conversationId) {
      loadMoreMessages(conversationId);
    }
  };

  const sendMessage = async (conversationId: string) => {
    if (!user?.id || !conversationId || !messageText.trim()) {
      return;
    }
    
    if (messageText.length > 500) {
      message.error(localStrings.Messages.MessageTooLong);
      return;
    }
    
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const messageContent = messageText.trim();
    
    const tempMessage: MessageResponseModel = {
      id: tempId,
      user_id: user.id,
      user: {
        id: user.id,
        name: user.name,
        family_name: user.family_name,
        avatar_url: user.avatar_url
      },
      conversation_id: conversationId,
      content: messageContent,
      created_at: new Date().toISOString(),
      isTemporary: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    addNewMessage(conversationId, tempMessage);
    
    setMessageText("");
    
    scrollToBottom();
    
    try {
      const createMessageData = {
        content: messageContent,
        conversation_id: conversationId,
        user: {
          id: user.id,
          name: user.name,
          family_name: user.family_name,
          avatar_url: user.avatar_url
        }
      };
      
      const response = await defaultMessagesRepo.createMessage(createMessageData);
      
      if (response.data) {
        const serverMessage = { ...response.data, fromServer: true, isTemporary: false };
        
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? serverMessage : msg
          )
        );
        
        // Update message records
        setMessagesByConversation(prev => {
          const conversationMessages = prev[conversationId] || [];
          const updatedMessages = conversationMessages.map(msg => 
            msg.id === tempId ? serverMessage : msg
          );
          
          return {
            ...prev,
            [conversationId]: updatedMessages
          };
        });
        
      }
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...msg, sendFailed: true } : msg
        )
      );
      
      message.error(localStrings.Public.Error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user?.id || !currentConversationId) return;
    
    try {
      // Remove from UI first
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Remove from store
      setMessagesByConversation(prev => {
        if (!prev[currentConversationId]) return prev;
        
        const updatedMessages = prev[currentConversationId].filter(msg => msg.id !== messageId);
        
        return {
          ...prev,
          [currentConversationId]: updatedMessages
        };
      });
      
      // Call API
      await defaultMessagesRepo.deleteMessage({ message_id: messageId });
    } catch (error) {
      message.error(localStrings.Public.Error);
      
      if (currentConversationId) {
        fetchMessages(currentConversationId);
      }
    }
  };

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  return {
    // State
    messages,
    messagesLoading,
    messageText,
    isMessagesEnd,
    messageListRef,
    initialMessagesLoaded,
    currentConversationId,
    
    // Setters
    setMessageText,
    setMessages,
    setCurrentConversationId,
    
    // Actions
    fetchMessages,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    handleScroll,
    scrollToBottom,
    getMessagesForConversation,
    addMessageListener,
    updateMessagesForConversation,
    addNewMessage,
  };
};