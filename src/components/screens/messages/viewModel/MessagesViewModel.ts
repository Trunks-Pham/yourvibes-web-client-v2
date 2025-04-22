import { useEffect, useState, useCallback } from "react";
import { ConversationResponseModel } from "@/api/features/messages/models/ConversationModel";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";
import { MessageResponseModel } from "@/api/features/messages/models/MessageModel";

import { useMessageViewModel } from "./MessageViewModel";
import { useConversationViewModel } from "./ConversationViewModel";
import { useConversationDetailViewModel } from "./ConversationDetailViewModel";

import { useWebSocket } from "@/context/socket/useSocket";

export const useMessagesViewModel = () => {
  const messageViewModel = useMessageViewModel();
  const conversationViewModel = useConversationViewModel();
  const conversationDetailViewModel = useConversationDetailViewModel();
  const { socketMessages } = useWebSocket();

  const { 
    messages, messagesLoading, messageText, setMessageText,
    isMessagesEnd, messageListRef, initialMessagesLoaded,
    currentConversationId,
    fetchMessages, sendMessage, deleteMessage, loadMoreMessages,
    handleScroll, getMessagesForConversation, addMessageListener,
    addNewMessage,
  } = messageViewModel;

  const {
    conversations, currentConversation, conversationsLoading, 
    searchText, unreadMessages, setSearchText, setCurrentConversation,
    fetchConversations, createConversation, updateConversation, 
    deleteConversation, resetUnreadCount, addNewConversation, updateConversationOrder
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
    });
    
    return unsubscribe;
  }, [currentConversation?.id]);

  useEffect(() => {
    if (!socketMessages.length) return;
  
    const latestMessage = socketMessages[0];
    if (!latestMessage) return;
  
    const isDuplicate = messages.some(m => m.id === latestMessage.id);
    if (isDuplicate) return;
  
    const messageModel: MessageResponseModel = {
      ...latestMessage,
      id: latestMessage.id || `ws-${Date.now()}`,
      fromServer: true
    };
  
    addNewMessage(latestMessage.conversation_id, messageModel);
    updateConversationOrder(latestMessage.conversation_id);
  
    if (currentConversation?.id === latestMessage.conversation_id) {
      setTimeout(() => messageViewModel.scrollToBottom(), 100);
      markConversationAsRead(latestMessage.conversation_id);
      resetUnreadCount(latestMessage.conversation_id);
    } else {
      conversationViewModel.incrementUnreadCount(latestMessage.conversation_id);
    }
  }, [socketMessages, currentConversation?.id]);

  useEffect(() => {
    const handleNewConversation = (event: CustomEvent) => {
      if (event.detail) {
        addNewConversation(event.detail);
      }
    };
    
    window.addEventListener('new_conversation', handleNewConversation as EventListener);
    
    return () => {
      window.removeEventListener('new_conversation', handleNewConversation as EventListener);
    };
  }, []);

  const updateUnreadCount = useCallback((conversationId: string) => {
    conversationViewModel.incrementUnreadCount(conversationId);
  }, [conversationViewModel.incrementUnreadCount]);

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

  const handleSendMessage = () => {
    if (!currentConversation?.id) return;
    return sendMessage(currentConversation.id);
  };

  const handleLoadMoreMessages = () => {
    if (!currentConversation?.id) return;
    return loadMoreMessages(currentConversation.id);
  };

  const handleScrollMessages = (e: React.UIEvent<HTMLDivElement>) => {
    if (!currentConversation?.id) return;
    
    handleScroll(e, currentConversation.id);
    
    if (!messagesLoading) {
      markConversationAsRead(currentConversation.id);
      resetUnreadCount(currentConversation.id);
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
    handleSelectConversation,
    resetUnreadCount,
  };
};