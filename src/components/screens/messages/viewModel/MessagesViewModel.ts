import { useEffect, useState, useRef } from "react";

import { useMessageViewModel } from "./MessageViewModel";
import { useConversationViewModel } from "./ConversationViewModel";
import { useConversationDetailViewModel } from "./ConversationDetailViewModel";

import { ConversationResponseModel } from "@/api/features/messages/models/ConversationModel";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";

export const useMessagesViewModel = () => {
  const messageViewModel = useMessageViewModel();
  const conversationViewModel = useConversationViewModel();
  const conversationDetailViewModel = useConversationDetailViewModel();

  const { currentConversation, setCurrentConversation } = conversationViewModel;
  const [existingMembers, setExistingMembers] = useState<FriendResponseModel[]>([]);
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentConversation?.id) {
      messageViewModel.fetchMessages(currentConversation.id, 1, false);
    }
  }, [currentConversation?.id]);

  useEffect(() => {
    const unsubscribe = messageViewModel.addMessageListener((conversationId, updatedMessages) => {
      if (conversationId === currentConversation?.id) {
        messageViewModel.setMessages(updatedMessages);
      }
    });
    
    return unsubscribe;
  }, [currentConversation?.id]);

  const fetchExistingMembers = async (conversationId: string) => {
    const members = await conversationDetailViewModel.fetchConversationMembers(conversationId);
    const memberIds = members.map(member => member.id || '');
    
    setExistingMembers(members);
    setExistingMemberIds(memberIds);
    
    return { members, memberIds };
  };

  const handleSelectConversation = (conversation: ConversationResponseModel) => {
    if (currentConversation?.id === conversation.id) {
      return;
    }

    setCurrentConversation(conversation);

    setTimeout(() => {
      if (conversation.id) {
        messageViewModel.fetchMessages(conversation.id);
        conversationDetailViewModel.markConversationAsRead(conversation.id);
      }
    }, 200);
  };

  return {
    // Message ViewModel
    ...messageViewModel,
    
    // Conversation ViewModel
    ...conversationViewModel,
    
    // Conversation Detail ViewModel
    ...conversationDetailViewModel,
    
    // Combined methods
    handleSelectConversation,
    existingMembers,
    existingMemberIds,
    fetchExistingMembers,
  };
};