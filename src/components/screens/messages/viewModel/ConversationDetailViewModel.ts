import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";

import { useAuth } from "@/context/auth/useAuth";

import { defaultMessagesRepo } from "@/api/features/messages/MessagesRepo";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";

export const useConversationDetailViewModel = () => {
  const { user, localStrings } = useAuth();

  const [existingMembersLoading, setExistingMembersLoading] = useState(false);
  const [conversationMembersMap, setConversationMembersMap] = useState<Record<string, FriendResponseModel[]>>({});


  const addConversationMembers = useCallback(async (conversationId: string, userIds: string[]) => {
    if (!user?.id || !conversationId || !userIds.length) return null;
    
    try {
      const createPromises = userIds.map(userId => 
        defaultMessagesRepo.createConversationDetail({
          conversation_id: conversationId,
          user_id: userId
        })
      );
      
      await Promise.all(createPromises);
      
      await fetchConversationMembers(conversationId);
      
      return true;
    } catch (error) {
      console.error("Error adding members to conversation:", error);
      throw error;
    }
  }, [user?.id]);

  const leaveConversation = useCallback(async (conversationId: string) => {
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
  }, [user?.id]);

  const fetchConversationMembers = useCallback(async (conversationId: string): Promise<FriendResponseModel[]> => {
    if (!conversationId) return [];
    
    setExistingMembersLoading(true);
    
    try {
      const response = await defaultMessagesRepo.getConversationDetailByUserID({
        conversation_id: conversationId
      });
  
      if (response.data) {
        const members = Array.isArray(response.data) ? response.data : [response.data];
        
        const membersWithDetails = members.filter(member => member.user && member.user.id);
        
        if (membersWithDetails.length > 0) {
          const memberProfiles = membersWithDetails.map(member => ({
            id: member.user?.id,
            name: member.user?.name,
            family_name: member.user?.family_name,
            avatar_url: member.user?.avatar_url
          }));
          
          const membersList = memberProfiles as FriendResponseModel[];
          
          setConversationMembersMap(prev => ({
            ...prev,
            [conversationId]: membersList
          }));
          
          return membersList;
        }
      }
      return [];
    } catch (error) {
      console.error("Error fetching conversation members:", error);
      return [];
    } finally {
      setExistingMembersLoading(false);
    }
  }, []);

  // const getMembersForConversation = useCallback((conversationId: string): FriendResponseModel[] => {
  //   return conversationMembersMap[conversationId] || [];
  // }, [conversationMembersMap]);


  const getCurrentUserRole = useCallback(async (conversationId: string): Promise<number | null> => {
    if (!user?.id || !conversationId) return null;
    
    try {
      const response = await defaultMessagesRepo.getConversationDetailByUserID({
        conversation_id: conversationId
      });
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          const currentUserDetail = response.data.find(detail => detail.user_id === user.id);
          return currentUserDetail?.conversation_role ?? null;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }, [user?.id]);
  
  const isUserConversationOwner = useCallback(async (conversationId: string): Promise<boolean> => {
    const role = await getCurrentUserRole(conversationId);
    return role === 0;
  }, [getCurrentUserRole]);


  return {
    // State
    existingMembersLoading,
    conversationMembersMap,
    
    // Actions
    addConversationMembers,
    leaveConversation,
    fetchConversationMembers,
    getCurrentUserRole,
    isUserConversationOwner,
    // getMembersForConversation,
  };
};