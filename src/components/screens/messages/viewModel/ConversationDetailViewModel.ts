import { useState } from "react";
import { message } from "antd";

import { useAuth } from "@/context/auth/useAuth";
import { useWebSocket } from "@/context/websocket/useWebSocket";

import { defaultMessagesRepo } from "@/api/features/messages/MessagesRepo";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";

export const useConversationDetailViewModel = () => {
  const { user, localStrings } = useAuth();
  const {
    resetUnreadCount,
    unreadMessages,
  } = useWebSocket();

  const [existingMembersLoading, setExistingMembersLoading] = useState(false);

  const markConversationAsRead = async (conversationId: string) => {
    if (!user?.id || !conversationId) return;
    
    try {
      await defaultMessagesRepo.updateConversationDetail({
        conversation_id: conversationId,
        user_id: user.id
      });
      
      resetUnreadCount(conversationId);
      
    } catch (error) {
      // Silent error handling
    }
  };

  const addConversationMembers = async (conversationId: string, userIds: string[]) => {
    if (!user?.id || !conversationId) return null;
    
    try {
      const createPromises = userIds.map(userId => 
        defaultMessagesRepo.createConversationDetail({
          conversation_id: conversationId,
          user_id: userId
        })
      );
      
      await Promise.all(createPromises);
      
      return true;
    } catch (error) {
      console.error("Error adding members to conversation:", error);
      throw error;
    }
  };

  const leaveConversation = async (conversationId: string) => {
    if (!user?.id || !conversationId) return;
    
    try {
      await defaultMessagesRepo.deleteConversationDetail({
        user_id: user.id,
        conversation_id: conversationId
      });
      
      return true;
    } catch (error) {
      console.error("Error leaving conversation:", error);
      throw error;
    }
  };

  const fetchConversationMembers = async (conversationId: string): Promise<FriendResponseModel[]> => {
    setExistingMembersLoading(true);
    try {
      const response = await defaultMessagesRepo.getConversationDetailByUserID({
        conversation_id: conversationId
      });
  
      if (response.data) {
        const members = Array.isArray(response.data) ? response.data : [response.data];
        
        const memberIds = members.map(member => member.user_id).filter(Boolean) as string[];
        
        const membersWithDetails = members.filter(member => member.user && member.user.id);
        
        if (membersWithDetails.length > 0) {
          const memberProfiles = membersWithDetails.map(member => ({
            id: member.user?.id,
            name: member.user?.name,
            family_name: member.user?.family_name,
            avatar_url: member.user?.avatar_url
          }));
          
          return memberProfiles as FriendResponseModel[];
        }
      }
      return [];
    } catch (error) {
      console.error("Error fetching conversation members:", error);
      return [];
    } finally {
      setExistingMembersLoading(false);
    }
  };

  return {
    // State
    unreadMessages,
    existingMembersLoading,
    
    // Actions
    markConversationAsRead,
    addConversationMembers,
    leaveConversation,
    fetchConversationMembers,
  };
};