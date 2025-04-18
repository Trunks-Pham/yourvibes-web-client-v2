import { useEffect, useState } from "react";
import { ConversationResponseModel } from "@/api/features/messages/models/ConversationModel";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";
import { MessageResponseModel } from "@/api/features/messages/models/MessageModel";

import { useMessageViewModel } from "./MessageViewModel";
import { useConversationViewModel } from "./ConversationViewModel";
import { useConversationDetailViewModel } from "./ConversationDetailViewModel";

// import { useWebSocket } from "@/context/socket/useSocket";
import { useWebSocket } from "@/context/websocket/useWebSocket";

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
      }
    });
    
    return unsubscribe;
  }, [currentConversation?.id]);

  useEffect(() => {
    if (socketMessages.length > 0) {
        const latestMessage = socketMessages[socketMessages.length - 1];
        const messageModel: MessageResponseModel = {
            id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            content: latestMessage.content,
            user_id: latestMessage.user_id,
            conversation_id: latestMessage.conversation_id,
            parent_id: latestMessage.parent_id,
            created_at: latestMessage.created_at || new Date().toISOString(),
            user: latestMessage.user,
            fromServer: true
        };
        
        addNewMessage(latestMessage.conversation_id, messageModel);
        
        if (currentConversation?.id === latestMessage.conversation_id) {
            setTimeout(() => messageViewModel.scrollToBottom(), 100);
        }
    }
  }, [socketMessages, currentConversation?.id]);

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