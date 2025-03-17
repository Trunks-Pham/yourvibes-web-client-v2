import { UserModel } from '@/api/features/authenticate/model/LoginModel';
import { defaultMessagesRepo } from '@/api/features/messages/MessagesRepo';
import { FriendResponseModel } from '@/api/features/profile/model/FriendReponseModel';
import { defaultProfileRepo } from '@/api/features/profile/ProfileRepository';
import { ConversationDetailResponseModel } from '@/api/features/messages/models/ConversationDetailModel';
import { MessageResponseModel } from '@/api/features/messages/models/MessageModel';
import { useState, useEffect,useRef } from 'react';

export interface Message {
  avatar: string;
  sender: string;
  sender_id: string;
  text: string;
  timestamp: Date;
  reactions?: { [key: string]: number };
  replyTo?: Message;
}

export const useMessageViewModel = (user: any) => {
  const [newMessage, setNewMessage] = useState('');
  const [activeFriend, setActiveFriend] = useState<FriendResponseModel | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [userInfo, setUserInfo] = useState<UserModel | null>(null);
  const [ friends, setFriends ] = useState<FriendResponseModel[]>([]);
  const [activeFriendProfile, setActiveFriendProfile] = useState<UserModel | null>(null); 
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null);

  const POLLING_INTERVAL = 3000;

  useEffect(() => {
    if (user) {
      setUserInfo(user);
    }
  }, [user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (activeFriend && activeFriend.id) {
      if (polling) {
        clearInterval(polling);
      }
      
      fetchMessages();
      
      const interval = setInterval(() => {
        fetchMessages();
      }, POLLING_INTERVAL);
      
      setPolling(interval);
      
      return () => {
        clearInterval(interval);
        setPolling(null);
      };
    } else if (polling) {
      clearInterval(polling);
      setPolling(null);
    }
  }, [activeFriend]);

  const getExistingConversation = async (userId: string, friendId: string): Promise<string | null> => {
    try {
      const userRes = await defaultMessagesRepo.getConversationDetailByUserID({ user_id: userId });
      const friendRes = await defaultMessagesRepo.getConversationDetailByUserID({ user_id: friendId });
      if (userRes.data && friendRes.data) {
        const userConvos = userRes.data as ConversationDetailResponseModel[];
        const friendConvos = friendRes.data as ConversationDetailResponseModel[];
        const commonConvo = userConvos.find(uc =>
          friendConvos.some(fc => fc.conversation?.id === uc.conversation?.id)
        );
        return commonConvo?.conversation?.id || null;
      }
    } catch (err) {
      console.error("Error fetching existing conversation", err);
    }
    return null;
  };

  const handleSendMessage = async (replyTo?: Message) => {
    if (newMessage.trim() !== '' && activeFriend) {
      try {
        const tempMessage: Message = {
          avatar: user?.avatar_url || '',
          sender: `${user?.family_name} ${user?.name}`,
          sender_id: user?.id,
          text: newMessage,
          timestamp: new Date(),
          replyTo: replyTo ? { 
            avatar: replyTo.avatar,
            sender: replyTo.sender,
            sender_id: replyTo.sender_id,
            text: replyTo.text,
            timestamp: replyTo.timestamp
          } : undefined
        };

        const key = activeFriend.id as string;
        setMessages((prev) => ({
          ...prev,
          [key]: [...(prev[key] || []), tempMessage]
        }));

        let conversation_id = await getExistingConversation(user?.id, activeFriend.id);
        
        if (!conversation_id) {
          let conversationName = `Chat between ${user?.name} and ${activeFriend.name}`;
          if (conversationName.length > 30) {
            conversationName = conversationName.substring(0, 30);
          }
    
          const conversationRes = await defaultMessagesRepo.createConversation({
            name: conversationName,
          });
    
          const conversation = conversationRes.data;
          if (!conversation?.id) {
            throw new Error('Failed to create conversation');
          }
          conversation_id = conversation.id;
    
          await defaultMessagesRepo.createConversationDetail({
            conversation_id,
            user_id: user?.id,
          });
    
          await defaultMessagesRepo.createConversationDetail({
            conversation_id,
            user_id: activeFriend.id,
          });
        }
    
        await defaultMessagesRepo.createMessage({
          content: newMessage,
          conversation_id,
          parent_id: replyTo ? replyTo.sender_id : undefined, 
        });
    
        setNewMessage('');
        setReplyTo(null);
        
        await fetchMessages();
        
      } catch (error) {
        console.error('Error sending message:', error);
        if (activeFriend && activeFriend.id) {
          const key = activeFriend.id as string;
          setMessages((prev) => ({
            ...prev,
            [key]: prev[key].filter(msg => 
              !(msg.text === newMessage && msg.timestamp.getTime() > Date.now() - 5000)
            )
          }));
        }
      }
    }
  };
  
  const fetchMessages = async () => {
    if (!activeFriend || !activeFriend.id || !user?.id) return;
  
    try {
      const conversation_id = await getExistingConversation(user.id, activeFriend.id);
      if (conversation_id) {
        const res = await defaultMessagesRepo.getMessagesByConversationId({
          conversation_id,
          page: 1,
          limit: 50,
        });
        if (res.data) {
          const fetchedMessages = res.data as MessageResponseModel[];
          const mappedMessages: Message[] = fetchedMessages.map((msg: MessageResponseModel) => ({
            avatar: msg.user?.avatar_url || '',
            sender: msg.user ? `${msg.user.family_name} ${msg.user.name}` : '',
            sender_id: msg.user?.id || '',
            text: msg.content || '',
            timestamp: new Date(msg.created_at || Date.now()),
            reactions: {}, 
          }));
          
          mappedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          
          const key = activeFriend.id as string;
          setMessages((prev) => ({
            ...prev,
            [key]: mappedMessages,
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const fetchFriends = async (page: number) => {
      try {
        const response = await defaultProfileRepo.getListFriends({
          page: page,
          limit: 10,
          user_id: user?.id,
        });
  
        if (response?.data) {
          if (Array.isArray(response?.data)) {
              const friends = response?.data.map(
                (friendResponse: UserModel) => ({
                  id: friendResponse.id,
                  family_name: friendResponse.family_name,
                  name: friendResponse.name,
                  avatar_url: friendResponse.avatar_url,
                })
              ) as UserModel[];
              setFriends(friends);
            } else{
          console.error("response.data is null");
          setFriends([]);
        }}
      } catch (error: any) {
        console.error(error);
      }
    };

    const fetchUserProfile = async (userId: string) => {
      try {
        const response = await defaultProfileRepo.getProfile(userId);
        if (response?.data) {
          setActiveFriendProfile(response.data);
          setIsProfileModalOpen(true); 
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin hồ sơ:", error);
      }
    };

  return {
    newMessage,
    setNewMessage,
    activeFriend,
    setActiveFriend,
    messages,
    handleSendMessage,
    fetchMessages,
    replyTo,
    setReplyTo,
    messagesEndRef,
    fetchFriends,
    friends,
    fetchUserProfile, 
    activeFriendProfile, 
    isProfileModalOpen, 
    setIsProfileModalOpen,
  };
};