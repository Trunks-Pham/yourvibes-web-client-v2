"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth/useAuth';
import { useMessageViewModel, Message } from '@/components/screens/messages/viewModel/MessagesViewModel';
import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { AiOutlineSend, AiOutlineSearch } from "react-icons/ai";
import { FaRegSmile } from 'react-icons/fa';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

const MessagesFeature = () => {
  const { user } = useAuth();
  const friends = [
    { 
      name: 'Nguyễn Văn A', 
      avatar: 'https://thumbs.dreamstime.com/b/avatar-icon-avatar-flat-symbol-isolated-white-avatar-icon-avatar-flat-symbol-isolated-white-background-avatar-simple-icon-124920496.jpg', 
      lastOnline: new Date() 
    },
    { 
      name: 'Trần Thị B', 
      avatar: 'https://thumbs.dreamstime.com/b/avatar-icon-avatar-flat-symbol-isolated-white-avatar-icon-avatar-flat-symbol-isolated-white-background-avatar-simple-icon-124920496.jpg', 
      lastOnline: new Date(Date.now() - 5 * 60000) // 5 phút trước
    }
  ];

  const {
    newMessage,
    setNewMessage,
    activeFriend,
    setActiveFriend,
    messages,
    handleSendMessage,
    handleAddReaction,
    replyTo,
    setReplyTo,
    messagesEndRef,
  } = useMessageViewModel(user);

  // State để quản lý hiển thị EmojiPicker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const  emojiPickerRef = useRef(null);
  // Hàm kiểm tra xem tin nhắn có phải của người dùng đang đăng nhập hay không
  const isUserMessage = (message: Message) => {
    return message.sender === `${user?.family_name} ${user?.name}`;
  };

  const toggleReaction = (message: Message, reaction: string) => {
    const currentReactions = message.reactions || {};
    const currentCount = currentReactions[reaction] || 0;
    const newCount = currentCount === 0 ? 1 : 0;
    handleAddReaction(message, reaction, newCount);
  };

  const getStatus = (lastOnline: Date) => {
    const now = new Date();
    const diff = (now.getTime() - new Date(lastOnline).getTime()) / 1000; 
    if (diff < 60) {
      return 'online';
    } else if (diff < 3600) {
      return `online ${Math.floor(diff / 60)} minutes ago`;
    } else {
      return `online ${Math.floor(diff / 3600)} hours ago`;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();

    if(
        showEmojiPicker
    ){
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
   return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };  
  }, [messages, activeFriend, showEmojiPicker]);

  // Hàm xử lý khi chọn emoji từ EmojiPicker
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if(
        showEmojiPicker &&
        emojiPickerRef.current &&
        !(emojiPickerRef.current as HTMLElement).contains(event.target as Node)
    ){
        setShowEmojiPicker(false);
    }}

  // Gửi tin nhắn khi nhấn Enter trong ô input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newMessage.trim() && activeFriend) {
      handleSendMessage(replyTo ?? undefined);
      setReplyTo(null);
    }
  };

  return (
    <div className="flex h-[85vh] p-4 relative">
      {/* Left Side Bar */}
      <div className="w-1/4 border-r p-4 overflow-y-auto h-[80vh] bg-white">
        <div className="flex items-center w-full">
          <AiOutlineSearch className="mr-[10px]" />
          <input
            type="text"
            placeholder="Nhập tên người liên hệ"
            className="flex-1 p-2 border rounded-lg"
          />
        </div>
        
        <h2 className="text-xl font-bold mb-4 mt-4">Bạn bè</h2>
        <ul>
          {friends.map((friend, index) => (
            <li
              key={index}
              className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-blue-100 ${activeFriend === friend.name ? 'bg-blue-200' : ''}`}
              onClick={() => setActiveFriend(friend.name)}
            >
              <img src={friend.avatar} alt={`${friend.name}'s avatar`} className="w-10 h-10 rounded-full mr-2" />
              <span className="font-medium">{friend.name}</span>
              <span className={`ml-2 text-sm ${getStatus(friend.lastOnline) === 'online' ? 'text-green-500' : 'text-gray-500'}`}>
                {getStatus(friend.lastOnline) === 'online' ? <strong>{getStatus(friend.lastOnline)}</strong> : getStatus(friend.lastOnline)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Conversation Main Screen */}
      <div className="flex-1 flex flex-col px-2">
        {/* Conversation Header */}
        <div className='sticky bg-white z-100 top-0 flex h-20 rounded-xl'>
          <img
            src="https://dogily.vn/wp-content/swift-ai/images/wp-content/uploads/2022/08/cho-corgi-jpg.webp"
            alt="Corgi"
            className="mt-2 mr-15 ml-2 w-16 h-16 rounded-full object-cover"
          />
          <div className='grow'>
            <h3 className='mt-2 mb-3 ml-3 text-xl font-bold'>Đây là email</h3>
            <h3 className='ml-3 text-l'>Last Active:</h3>
          </div>
        </div>

        {/* Conversation Chat */}
        <div className="flex-1 overflow-y-auto border p-4 rounded-lg mb-4 bg-gray-100 max-h-[70vh]">
          {activeFriend ? (
            messages[activeFriend]?.length ? (
              <>
                {messages[activeFriend].map((message, index) => {
                  const isUser = isUserMessage(message);
                  return (
                    <div key={index} className={`flex items-start mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {/* Nếu tin nhắn từ bạn bè, hiển thị avatar bên trái */}
                      {!isUser && (
                        <img
                          src={message.avatar}
                          alt={`${message.sender}'s avatar`}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <div className={`p-2 rounded-lg shadow max-w-xs w-80 break-words 
                          ${isUser ? 'bg-white text-black' : 'bg-white text-black'}`}>
                        <div className="font-bold">{message.sender}</div>
                        <div>{message.text}</div>
                        {message.replyTo && (
                          <div className="text-sm text-gray-500">
                            Trả lời: {message.replyTo.text}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </div>
                        <div className="flex gap-2 mt-2 items-center">
                          <button onClick={() => toggleReaction(message, '❤️')} className="flex items-center">
                            {message.reactions?.['❤️'] ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart className="text-black" />
                            )}
                            {message.reactions?.['❤️'] && (
                              <span className="ml-1 text-sm">{message.reactions['❤️']}</span>
                            )}
                          </button>
                          <button onClick={() => setReplyTo(message)} className="text-sm text-blue-500">
                            Trả lời
                          </button>
                        </div>
                      </div>
                      {/* Nếu tin nhắn của người dùng, hiển thị avatar bên phải */}
                      {isUser && (
                        <img
                          src={message.avatar}
                          alt={`${message.sender}'s avatar`}
                          className="w-8 h-8 rounded-full ml-2"
                        />
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <p className="text-gray-500">Chưa có tin nhắn nào</p>
            )
          ) : (
            <p className="text-gray-500">Chọn bạn để nhắn tin</p>
          )}
        </div>

        {/* Conversation Send Message */}
        <div className="flex gap-2 relative">
          {replyTo && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Trả lời: {replyTo.text}</span>
              <button onClick={() => setReplyTo(null)} className="text-red-500">Hủy</button>
            </div>
          )}
          <button
            title="Chọn emoji"
            aria-label="Chọn emoji"
            className="p-1 mr-0 relative z-10"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaRegSmile className="text-2xl" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-20" ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={onEmojiClick}
               />
            </div>
          )}
          <div className="flex items-center p-2 border rounded-lg w-full">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeFriend ? "Nhập tin nhắn..." : "Chọn bạn để nhắn tin"}
              className="flex-1 outline-none"
              disabled={!activeFriend}
            />
          </div>
          <button
            onClick={() => {
              handleSendMessage(replyTo ?? undefined);
              setReplyTo(null);
            }}
            title="Gửi tin nhắn"
            aria-label="Gửi tin nhắn"
            className={`px-4 py-2 rounded-lg text-white ${newMessage.trim() && activeFriend ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!newMessage.trim() || !activeFriend}
          >
            <AiOutlineSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesFeature;