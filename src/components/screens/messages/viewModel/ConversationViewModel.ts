import { useState, useEffect } from "react";
import { message } from "antd";

import { useAuth } from "@/context/auth/useAuth";
import { useWebSocket } from "@/context/websocket/useWebSocket";

import { defaultMessagesRepo } from "@/api/features/messages/MessagesRepo";
import { ConversationResponseModel, UpdateConversationRequestModel } from "@/api/features/messages/models/ConversationModel";

export const useConversationViewModel = () => {
  const { user, localStrings } = useAuth();
  const {
    isConnected: isWebSocketConnected,
    sendMessage: wsSendMessage,
    updateConversations,
    conversations: wsConversations,
    getMessagesForConversation,
  } = useWebSocket();

  const [conversations, setConversations] = useState<ConversationResponseModel[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationResponseModel | null>(null);
  const [conversationsLoading, setConversationsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    if (wsConversations && wsConversations.length > 0) {
      setConversations(wsConversations);
    }
  }, [wsConversations]);

  const fetchConversations = async () => {
    if (!user?.id) return;
    
    setConversationsLoading(true);
    try {
      const response = await defaultMessagesRepo.getConversations({
        limit: 50,
        page: 1
      });
      
      if (response.data) {
        const conversationsList = Array.isArray(response.data) 
          ? response.data 
          : [response.data];
        
        setConversations(conversationsList);
        updateConversations(conversationsList);
        
        const lastMessagesMap = new Map();
        
        const fetchMessagesPromises = conversationsList.map(async (conversation) => {
          if (conversation.id) {
            try {
              const messageResponse = await defaultMessagesRepo.getMessagesByConversationId({
                conversation_id: conversation.id,
                sort_by: "created_at",
                is_descending: true,
                limit: 1,
                page: 1
              });
              
              if (messageResponse.data) {
                const messageList = Array.isArray(messageResponse.data) 
                  ? messageResponse.data 
                  : [messageResponse.data];
                
                if (messageList.length > 0) {
                  const formattedMessages = messageList.map(msg => ({
                    ...msg,
                    fromServer: true,
                    isTemporary: false
                  }));
                  
                  lastMessagesMap.set(conversation.id, formattedMessages[0]);
                }
              }
            } catch (error) {
              console.error("Error fetching messages for conversation", conversation.id, error);
            }
          }
        });
        
        await Promise.all(fetchMessagesPromises);
        
        const sortedConversations = [...conversationsList].sort((a, b) => {
          const lastMessageA = lastMessagesMap.get(a.id);
          const lastMessageB = lastMessagesMap.get(b.id);
          
          if (!lastMessageA && !lastMessageB) return 0;
          if (!lastMessageA) return 1;
          if (!lastMessageB) return -1;
          
          const timeA = new Date(lastMessageA.created_at || '').getTime();
          const timeB = new Date(lastMessageB.created_at || '').getTime();
          
          return timeB - timeA;
        });
        
        setConversations(sortedConversations);
        updateConversations(sortedConversations);
      }
    } catch (error) {
      message.error(localStrings.Messages.ErrorFetchingConversations);
    } finally {
      setConversationsLoading(false);
    }
  };

  const createConversation = async (name: string, image?: File | string, userIds?: string[]) => {
    if (!user?.id) return null;
    
    try {
      const createResponse = await defaultMessagesRepo.createConversation({
        name: name,
        image: image, 
        user_ids: userIds || []
      });
      
      if (createResponse.data) {
        const newConversation = createResponse.data;
        
        if (isWebSocketConnected) {
          wsSendMessage({
            type: "new_conversation",
            conversation: newConversation,
            members: userIds
          });
        }
        
        await fetchConversations();
        return newConversation;
      }
      return null;
    } catch (error) {
      message.error(localStrings.Messages.GroupCreationFailed);
      return null;
    }
  };

  const updateConversation = async (conversationId: string, name?: string, image?: File | string) => {
    if (!conversationId) return null;
    
    try {
      const updateData: UpdateConversationRequestModel = {
        conversation_id: conversationId
      };
      
      if (name) updateData.name = name;
      if (image) updateData.image = image;
      
      const response = await defaultMessagesRepo.updateConversation(updateData);
      
      if (response.data) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? response.data as ConversationResponseModel
              : conv
          )
        );
        
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(response.data as ConversationResponseModel);
        }
        
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error updating conversation:", error);
      message.error(localStrings.Public.Error);
      return null;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user?.id) return;
    
    try {
      await defaultMessagesRepo.deleteConversation({ conversation_id: conversationId });
      
      await fetchConversations();
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
    } catch (error) {
      message.error(localStrings.Public.Error);
    }
  };

  return {
    // State
    conversations,
    currentConversation,
    conversationsLoading,
    searchText,
    
    // Setters
    setSearchText,
    setCurrentConversation,
    
    // Actions
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    getMessagesForConversation,
  };
};