import { useState, useEffect } from 'react'; 

const autoResponses = [
    'Đây là tin nhắn phản hồi tự động.',
    'Xin chào! Đây là phản hồi tự động.',
    'Chúng tôi sẽ liên hệ lại sớm nhất có thể.',
    'Cảm ơn bạn đã nhắn tin. Đây là phản hồi tự động.',
    'Hệ thống đang bận. Đây là phản hồi tự động.',
    'Chúng tôi đã nhận được tin nhắn của bạn.',
    'Tin nhắn tự động: Chúng tôi sẽ trả lời sớm.',
    'Cảm ơn bạn đã liên hệ. Đây là phản hồi tự động.',
    'Xin đợi trong giây lát, đây là phản hồi tự động.',
    'Phản hồi tự động: Chúng tôi sẽ sớm liên hệ lại.',
    'Tin nhắn của bạn đã được ghi nhận.',
    'Đây là phản hồi tự động từ hệ thống.',
    'Chúng tôi sẽ trả lời bạn trong thời gian sớm nhất.',
    'Phản hồi tự động: Cảm ơn bạn đã nhắn tin.',
    'Xin chào! Đây là phản hồi tự động từ hệ thống.',
    'Cảm ơn bạn, tin nhắn của bạn đã được tiếp nhận.',
    'Chúng tôi hiện không thể trả lời ngay lập tức.',
    'Đây là phản hồi tự động. Vui lòng chờ đợi.',
    'Tin nhắn tự động: Xin vui lòng kiên nhẫn chờ.',
    'Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.',
    'Xin cảm ơn! Đây là phản hồi tự động.',
    'Tin nhắn của bạn đã được chuyển đến bộ phận liên quan.',
    'Đây là phản hồi tự động. Chúng tôi đang kiểm tra.',
    'Phản hồi tự động: Xin vui lòng chờ thêm ít phút.',
    'Chúng tôi đánh giá cao phản hồi của bạn.',
    'Hệ thống đang xử lý yêu cầu của bạn.',
    'Đây là tin nhắn tự động, xin đừng trả lời.',
    'Cảm ơn bạn đã kiên nhẫn chờ đợi.',
    'Phản hồi tự động: Chúng tôi đang xử lý yêu cầu.',
    'Xin lỗi, hiện tại chúng tôi không thể trả lời.',
    'Tin nhắn của bạn rất quan trọng với chúng tôi.',
    'Đây là phản hồi tự động, xin vui lòng chờ.',
    'Chúng tôi sẽ trả lời ngay khi có thể.',
    'Xin chào! Đây là tin nhắn tự động.',
    'Chúng tôi đang xem xét yêu cầu của bạn.',
    'Tin nhắn tự động: Cảm ơn bạn đã liên hệ.',
    'Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
    'Phản hồi tự động: Chúng tôi đã nhận được tin nhắn.',
    'Đây là tin nhắn phản hồi tự động từ hệ thống.',
    'Xin vui lòng chờ, chúng tôi sẽ liên hệ lại.',
    'Chúng tôi trân trọng phản hồi của bạn.',
    'Phản hồi tự động: Hệ thống đang bận.',
    'Cảm ơn bạn đã kiên nhẫn.',
    'Tin nhắn tự động: Chúng tôi sẽ sớm trả lời.',
    'Đây là phản hồi tự động. Cảm ơn bạn.',
    'Chúng tôi đang xử lý yêu cầu của bạn.',
    'Phản hồi tự động: Xin vui lòng chờ đợi.',
    'Tin nhắn của bạn đã được ghi nhận.',
    'Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.',
    'Đây là phản hồi tự động từ hệ thống.',
    'Xin vui lòng chờ, chúng tôi sẽ phản hồi ngay.',
    'Phản hồi tự động: Hệ thống đang xử lý yêu cầu.',
    'Cảm ơn bạn đã liên hệ với chúng tôi.',
    'Tin nhắn tự động: Chúng tôi sẽ sớm trả lời.',
    'Phản hồi tự động: Xin vui lòng kiên nhẫn.',
    'Đây là tin nhắn phản hồi tự động.',
    'Xin cảm ơn! Đây là phản hồi tự động.',
    'Tin nhắn của bạn đã được chuyển đến bộ phận liên quan.',
    'Đây là phản hồi tự động. Chúng tôi đang kiểm tra.',
    'Phản hồi tự động: Xin vui lòng chờ thêm ít phút.',
    'Chúng tôi đánh giá cao phản hồi của bạn.',
    'Hệ thống đang xử lý yêu cầu của bạn.',
    'Đây là tin nhắn tự động, xin đừng trả lời.',
    'Cảm ơn bạn đã kiên nhẫn chờ đợi.',
    'Phản hồi tự động: Chúng tôi đang xử lý yêu cầu.',
    'Xin lỗi, hiện tại chúng tôi không thể trả lời.',
    'Tin nhắn của bạn rất quan trọng với chúng tôi.',
    'Đây là phản hồi tự động, xin vui lòng chờ.',
    'Chúng tôi sẽ trả lời ngay khi có thể.',
    'Xin chào! Đây là tin nhắn tự động.',
    'Chúng tôi đang xem xét yêu cầu của bạn.',
    'Tin nhắn tự động: Cảm ơn bạn đã liên hệ.',
    'Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
    'Phản hồi tự động: Chúng tôi đã nhận được tin nhắn.',
    'Đây là tin nhắn phản hồi tự động từ hệ thống.',
    'Xin vui lòng chờ, chúng tôi sẽ liên hệ lại.',
    'Chúng tôi trân trọng phản hồi của bạn.',
    'Phản hồi tự động: Hệ thống đang bận.',
    'Cảm ơn bạn đã kiên nhẫn.',
    'Tin nhắn tự động: Chúng tôi sẽ sớm trả lời.'
];

export interface Friend {
  name: string;
  avatar: string;
  lastOnline: Date;
}

export interface Message {
  avatar: string;
  sender: string;
  text: string;
  timestamp: Date;
  reactions?: { [key: string]: number };
  replyTo?: Message;
}

export const useMessageViewModel = (user: any, friends: Friend[]) => {
  const [newMessage, setNewMessage] = useState('');
  const [activeFriend, setActiveFriend] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      friends.forEach(friend => {
        if (friend.name === activeFriend) {
          friend.lastOnline = new Date();
        }
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeFriend, friends]);

  const handleSendMessage = (replyTo?: Message) => {
    if (newMessage.trim() !== '' && activeFriend) {
      const timestamp = new Date();
      setMessages((prev) => ({
        ...prev,
        [activeFriend]: [
          ...(prev[activeFriend] || []),
          {
            sender: `${user?.family_name} ${user?.name}`,
            avatar: user?.avatar_url || '',
            text: newMessage,
            timestamp,
            replyTo,
          },
        ],
      }));
      setNewMessage('');

      setTimeout(() => {
        const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
        setMessages((prev) => ({
          ...prev,
          [activeFriend]: [
            ...(prev[activeFriend] || []),
            {
              sender: activeFriend,
              avatar: friends.find((friend) => friend.name === activeFriend)?.avatar || '',
              text: randomResponse,
              timestamp: new Date(),
            },
          ],
        }));
      }, 2000);
    }
  };

  const handleAddReaction = (message: Message, reaction: string, newCount?: number) => {
    setMessages((prev) => ({
      ...prev,
      [activeFriend!]: prev[activeFriend!].map((msg) =>
        msg === message
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [reaction]: newCount ?? (msg.reactions?.[reaction] || 0) + 1,
              },
            }
          : msg
      ),
    }));
  };

  return {
    newMessage,
    setNewMessage,
    activeFriend,
    setActiveFriend,
    messages,
    handleSendMessage,
    handleAddReaction,
  };
};