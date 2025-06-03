import { useState, useCallback, useRef } from "react";
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
  
  const processedConversationsRef = useRef<Set<string>>(new Set());

  const addNewConversation = useCallback((conversation: ConversationResponseModel) => {
    if (!conversation || !conversation.id) return;
    
    if (processedConversationsRef.current.has(conversation.id)) {
      return;
    }
    
    processedConversationsRef.current.add(conversation.id);
    
    setConversations(prev => {
      const exists = prev.some(c => c.id === conversation.id);
      if (exists) return prev;
      
      return [conversation, ...prev];
    });
  }, []);

  const updateConversationOrder = useCallback((conversationId: string) => {
    if (!conversationId) return;
    
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

  const fetchConversations = useCallback(async () => {
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
        
        conversationsList.forEach(conv => {
          if (conv.id) processedConversationsRef.current.add(conv.id);
        });
        
        setConversations(conversationsList);
        
        // const detailsPromises = conversationsList.map(async (conversation) => {
        //   if (conversation.id) {
        //     try {
        //       const detailResponse = await defaultMessagesRepo.getConversationDetailByID({
        //         userId: user.id,
        //         conversationId: conversation.id
        //       });
              
        //       if (detailResponse.data) {
        //         return { id: conversation.id, detail: detailResponse.data };
        //       }
        //     } catch (error) {
        //       console.error("Error fetching conversation detail", conversation.id, error);
        //     }
        //   }
        //   return null;
        // });
        
        // const details = await Promise.all(detailsPromises);
        // const detailsMap: Record<string, ConversationDetailResponseModel> = {};
        
        // details.filter(Boolean).forEach(item => {
        //   if (item && item.id) {
        //     detailsMap[item.id] = item.detail as ConversationDetailResponseModel;
        //   }
        // });
        
        // setConversationDetails(detailsMap);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      message.error(localStrings.Messages.ErrorFetchingConversations);
    } finally {
      setConversationsLoading(false);
    }
  }, [user?.id, localStrings.Messages.ErrorFetchingConversations]);

  const createConversation = useCallback(async (name: string, image?: File | string, userIds?: string[]) => {
    if (!user?.id) return null;
    
    try {
      const uniqueUserIds = [...new Set(userIds || [])];
      
      const filteredUserIds = uniqueUserIds.filter(id => id !== user.id);
      
      if (filteredUserIds.length === 0) {
        message.error("Need one more another user!");
        return null;
      }
      
      if (filteredUserIds.length > 1 && !name) {
        message.error(localStrings.Messages.GroupNameRequired);
        return null;
      }
      
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
      console.error("Error creating conversation:", error);
      message.error(localStrings.Messages.GroupCreationFailed);
      return null;
    }
  }, [user?.id, addNewConversation, fetchConversations]);

  const updateConversation = useCallback(async (conversationId: string, name?: string, image?: File | string) => {
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
  }, [currentConversation?.id, localStrings.Public.Error]);

const deleteConversation = useCallback(async (conversationId: string) => {
  if (!user?.id || !conversationId) return;

  try {
    await defaultMessagesRepo.deleteConversation({ conversation_id: conversationId });

    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    processedConversationsRef.current.delete(conversationId);

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
    
    await fetchConversations();
    
  } catch (error) {
    console.error("Error deleting conversation:", error);
    message.error(localStrings.Public.Error);
    
    await fetchConversations();
  }
}, [user?.id, currentConversation?.id, fetchConversations, localStrings.Public.Error]);

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
    setConversations,
  };
};