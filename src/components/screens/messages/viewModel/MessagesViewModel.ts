import { useEffect, useState, useRef } from "react";
import { ConversationResponseModel } from "@/api/features/messages/models/ConversationModel";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";

import { useMessageViewModel } from "./MessageViewModel";
import { useConversationViewModel } from "./ConversationViewModel";
import { useConversationDetailViewModel } from "./ConversationDetailViewModel";

export const useMessagesViewModel = () => {
  const messageViewModel = useMessageViewModel();
  const conversationViewModel = useConversationViewModel();
  const conversationDetailViewModel = useConversationDetailViewModel();

  const { 
    messages, messagesLoading, messageText, setMessageText,
    isMessagesEnd, messageListRef, initialMessagesLoaded,
    currentConversationId,
    fetchMessages, sendMessage, deleteMessage, loadMoreMessages,
    handleScroll, scrollToBottom, getMessagesForConversation, addMessageListener
  } = messageViewModel;

  const {
    conversations, currentConversation, conversationsLoading, 
    searchText, unreadMessages, setSearchText, setCurrentConversation,
    fetchConversations, createConversation, updateConversation, 
    deleteConversation, resetUnreadCount
  } = conversationViewModel;

  const {
    existingMembersLoading, markConversationAsRead,
    addConversationMembers, leaveConversation, fetchConversationMembers
  } = conversationDetailViewModel;

  const [existingMembers, setExistingMembers] = useState<FriendResponseModel[]>([]);
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentConversation?.id) {
      fetchMessages(currentConversation.id, 1, false);
    }
  }, [currentConversation?.id]);

  useEffect(() => {
    const unsubscribe = addMessageListener((conversationId, updatedMessages) => {
      if (conversationId === currentConversation?.id) {
        // Cập nhật messages UI khi có tin nhắn mới
      }
    });
    
    return unsubscribe;
  }, [currentConversation?.id]);

  const fetchExistingMembers = async (conversationId: string) => {
    const members = await fetchConversationMembers(conversationId);
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
        fetchMessages(conversation.id);
        markConversationAsRead(conversation.id);
        resetUnreadCount(conversation.id);
      }
    }, 200);
  };

  // Kết hợp sendMessage để nhận conversationId từ currentConversation
  const handleSendMessage = () => {
    if (!currentConversation?.id) return;
    return sendMessage(currentConversation.id);
  };

  // Kết hợp loadMoreMessages
  const handleLoadMoreMessages = () => {
    if (!currentConversation?.id) return;
    return loadMoreMessages(currentConversation.id);
  };

  // Kết hợp handleScroll
  const handleScrollMessages = (e: React.UIEvent<HTMLDivElement>) => {
    if (!currentConversation?.id) return;
    return handleScroll(e, currentConversation.id);
  };

  return {
    // State
    messages,
    messagesLoading,
    messageText,
    isMessagesEnd,
    messageListRef,
    initialMessagesLoaded,
    conversations,
    currentConversation,
    conversationsLoading,
    searchText,
    unreadMessages,
    existingMembers,
    existingMemberIds,
    
    // Setters
    setSearchText,
    setMessageText,
    setCurrentConversation,
  
    // Actions
    fetchConversations,
    fetchMessages,
    sendMessage: handleSendMessage,
    deleteMessage,
    createConversation,
    updateConversation,
    deleteConversation,
    markConversationAsRead,
    loadMoreMessages: handleLoadMoreMessages,
    handleScroll: handleScrollMessages,
    addConversationMembers,
    leaveConversation,
    fetchExistingMembers,
    getMessagesForConversation,
  };
};