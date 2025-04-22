import { useState, useCallback } from "react";
import { message } from "antd";

import { useAuth } from "@/context/auth/useAuth";

import { defaultMessagesRepo } from "@/api/features/messages/MessagesRepo";
import { ConversationResponseModel, UpdateConversationRequestModel } from "@/api/features/messages/models/ConversationModel";
import { ConversationDetailResponseModel } from "@/api/features/messages/models/ConversationDetailModel";

export const useConversationViewModel = () => {
  const { user, localStrings } = useAuth();

  const [conversations, setConversations] = useState<ConversationResponseModel[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationResponseModel | null>(null);
  const [conversationsLoading, setConversationsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [conversationDetails, setConversationDetails] = useState<Record<string, ConversationDetailResponseModel>>({});

  const addNewConversation = useCallback((conversation: ConversationResponseModel) => {
    setConversations(prev => {
      const exists = prev.some(c => c.id === conversation.id);
      if (exists) return prev;
      
      return [conversation, ...prev];
    });
  }, []);

  const updateConversationOrder = useCallback((conversationId: string) => {
    setConversations(prev => {
      const conversationIndex = prev.findIndex(c => c.id === conversationId);
      if (conversationIndex < 0) return prev;
      
      const updatedConversations = [...prev];
      const conversation = { ...updatedConversations[conversationIndex] };
      
      conversation.updated_at = new Date().toISOString();
      
      updatedConversations.splice(conversationIndex, 1);
      updatedConversations.unshift(conversation);
      
      return updatedConversations;
    });
  }, []);


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
        
        const detailsPromises = conversationsList.map(async (conversation) => {
          if (conversation.id) {
            try {
              const detailResponse = await defaultMessagesRepo.getConversationDetailByID({
                userId: user.id,
                conversationId: conversation.id
              });
              
              if (detailResponse.data) {
                return { id: conversation.id, detail: detailResponse.data };
              }
            } catch (error) {
              console.error("Error fetching conversation detail", conversation.id, error);
            }
          }
          return null;
        });
        
        const details = await Promise.all(detailsPromises);
        const detailsMap: Record<string, ConversationDetailResponseModel> = {};
        
        details.filter(Boolean).forEach(item => {
          if (item && item.id) {
            detailsMap[item.id] = item.detail as ConversationDetailResponseModel;
          }
        });
        
        setConversationDetails(detailsMap);
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
      const filteredUserIds = (userIds || []).filter(id => id !== user.id);
      
      const createResponse = await defaultMessagesRepo.createConversation({
        name: name,
        image: image, 
        user_ids: filteredUserIds
      });
        
        if (createResponse.data) {
          const newConversation = createResponse.data;
          
          addNewConversation(newConversation);
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

  const hasUnreadMessages = (conversationId: string): boolean => {
    if (!conversationId) return false;
    
    const detail = conversationDetails[conversationId];
    return detail && detail.last_mess_status === false;
  };

  const updateConversationReadStatus = (conversationId: string) => {
    if (!conversationId) return;
    
    setConversationDetails(prev => {
      const detail = prev[conversationId];
      if (!detail) return prev;
      
      return {
        ...prev,
        [conversationId]: {
          ...detail,
          last_mess_status: true 
        }
      };
    });
  };

  const markNewMessageUnread = (conversationId: string) => {
    if (!conversationId || conversationId === currentConversation?.id) return;
    
    setConversationDetails(prev => {
      const detail = prev[conversationId];
      if (!detail) return prev;
      
      return {
        ...prev,
        [conversationId]: {
          ...detail,
          last_mess_status: false 
        }
      };
    });
  };

  return {
    // State
    conversations,
    currentConversation,
    conversationsLoading,
    searchText,
    conversationDetails,
    
    // Setters
    setSearchText,
    setCurrentConversation,
    
    // Actions
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    addNewConversation,
    updateConversationOrder,
    hasUnreadMessages,
    updateConversationReadStatus,
    markNewMessageUnread
  };
};