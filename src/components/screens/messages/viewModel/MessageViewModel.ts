import { useState, useRef } from "react";
import { message } from "antd";

import { useAuth } from "@/context/auth/useAuth";
import { useWebSocket } from "@/context/websocket/useWebSocket";

import { defaultMessagesRepo } from "@/api/features/messages/MessagesRepo";
import { ConversationResponseModel } from "@/api/features/messages/models/ConversationModel";
import { MessageResponseModel } from "@/api/features/messages/models/MessageModel";

interface ExtendedMessageResponseModel extends MessageResponseModel {
  isDateSeparator?: boolean;
}

type MessageWithDate = ExtendedMessageResponseModel;

export const useMessageViewModel = () => {
  const { user, localStrings } = useAuth();
  const {
    isConnected: isWebSocketConnected,
    sendMessage: wsSendMessage,
    getMessagesForConversation,
    updateMessagesForConversation,
    addMessageListener,
  } = useWebSocket();

  const [messages, setMessages] = useState<MessageResponseModel[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [isMessagesEnd, setIsMessagesEnd] = useState<boolean>(false);
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const pageSize = 20;
  const messageListRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef<boolean>(true);
  const scrollPositionRef = useRef<number>(0);

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
      // Error handling
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
    if (!user?.id || !conversationId || !messageText.trim() || !isWebSocketConnected) {
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
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...response.data, fromServer: true, isTemporary: false } : msg
          )
        );
        
        wsSendMessage({
          type: "message",
          data: response.data
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
    if (!user?.id) return;
    
    try {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      await defaultMessagesRepo.deleteMessage({ message_id: messageId });
    } catch (error) {
      message.error(localStrings.Public.Error);
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
    isWebSocketConnected,
    messageListRef,
    initialMessagesLoaded,
    
    // Setters
    setMessageText,
    
    // Actions
    fetchMessages,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    handleScroll,
    scrollToBottom,
    getMessagesForConversation,
    addMessageListener,
  };
};