"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth/useAuth';
import { useMessageViewModel, Message } from '@/components/screens/messages/viewModel/MessagesViewModel';
import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { AiOutlineSend, AiOutlineSearch } from "react-icons/ai";
import { FaRegSmile } from 'react-icons/fa';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { UserModel } from '@/api/features/authenticate/model/LoginModel';
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { Modal } from 'antd';
import { useRouter } from 'next/navigation';

const MessagesFeature = () => {
  const { user } = useAuth();
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
    fetchFriends,
    friends,
  } = useMessageViewModel(user);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const router = useRouter();

  const isUserMessage = (message: Message) => {
    return message.sender === `${user?.family_name} ${user?.name}`;
  };

  const toggleReaction = (message: Message, reaction: string) => {
    const currentReactions = message.reactions || {};
    const currentCount = currentReactions[reaction] || 0;
    const newCount = currentCount === 0 ? 1 : 0;
    handleAddReaction(message, reaction, newCount);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeFriend]);

  useEffect(() => {
    fetchFriends(1);
  }, [user]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

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
          <button
            title="Tạo nhóm chat"
            aria-label="Tạo nhóm chat"
            onClick={() => setShowGroupModal(true)}
            className="ml-2 p-1"
          >
            <AiOutlineUsergroupAdd className="text-2xl" />
          </button>
        </div>
        <h2 className="text-xl font-bold mb-4 mt-4">Bạn bè</h2>
        <ul>
          {friends.map((friend: UserModel, index: number) => {
            const friendName = friend.name || "";
            const friendFamilyName = friend.family_name || "";
            return (
              <li
                key={index}
                className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-blue-100 ${activeFriend === friendName ? 'bg-blue-200' : ''}`}
                onClick={() => setActiveFriend(friendName || null)}
              >
                <img src={friend.avatar_url} alt={`${friendName}'s avatar`} className="w-10 h-10 rounded-full mr-2" />
                <span className="font-medium">{friendFamilyName} {friendName}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Conversation Area */}
      <div className="flex-1 flex flex-col px-2">
        {activeFriend ? (
          (() => {
            const activeFriendData = friends.find((friend: UserModel) => friend.name === activeFriend);
            return (
              <div className='sticky bg-white z-100 top-0 flex h-20 rounded-xl'>
                <img
                  src={activeFriendData?.avatar_url || "https://via.placeholder.com/64"}
                  alt={activeFriendData?.name || "Friend avatar"}
                  className="mt-2 mr-15 ml-2 w-16 h-16 rounded-full object-cover"
                />
                <div className='grow'>
                <h3 className='mt-6 mb-2 ml-3 text-xl font-bold'>
                  {activeFriendData ? `${activeFriendData.family_name || ""} ${activeFriendData.name || ""}`.trim() : "Chọn bạn để chat"}
                </h3>
                </div>
              </div>
            );
          })()
        ) : (
          <div className='sticky bg-white z-100 top-0 flex h-20 rounded-xl'>
            <div className='grow p-4'>
              <h3 className='mt-2 mb-3 ml-3 text-xl font-bold'>Chọn bạn để chat</h3>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto border p-4 rounded-lg mb-4 bg-gray-100 max-h-[70vh]">
          {activeFriend ? (
            messages[activeFriend]?.length ? (
              <>
                {messages[activeFriend].map((message, index) => {
                  const isUser = isUserMessage(message);
                  return (
                    <div key={index} className={`flex items-start mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <img
                          src={message.avatar}
                          alt={`${message.sender}'s avatar`}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <div className={`p-2 rounded-lg shadow max-w-xs w-80 break-words bg-white text-black`}>
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
            <div className="absolute bottom-16 left-0 z-20">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
          <div className="flex items-center w-full">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeFriend ? "Nhập tin nhắn..." : "Chọn bạn để nhắn tin"}
              className="w-full p-2 border rounded-lg outline-none"
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
      {/* Modal tạo nhóm chat */}
      <Modal
        title="Tạo nhóm chat"
        open={showGroupModal}
        onCancel={() => setShowGroupModal(false)}
        footer={null}
        styles={{ body: { padding: '20px' } }}
      >
        <input
          type="text"
          value={groupSearch}
          onChange={(e) => setGroupSearch(e.target.value)}
          placeholder="Tìm kiếm bạn bè..."
          className="w-full p-2 border rounded-lg mb-4"
        />
        <ul className="max-h-60 overflow-y-auto mb-4">
          {friends
            .filter((friend: UserModel) => {
              const fullName = `${friend.family_name || ""} ${friend.name || ""}`.toLowerCase();
              return fullName.includes(groupSearch.toLowerCase());
            })
            .map((friend: UserModel, index: number) => {
              const fullName = `${friend.family_name || ""} ${friend.name || ""}`;
              return (
                <li
                  key={index}
                  onClick={() => {
                    if (selectedFriends.includes(friend.id!)) {
                      setSelectedFriends((prev) => prev.filter((id) => id !== friend.id));
                    } else {
                      setSelectedFriends((prev) => [...prev, friend.id!]);
                    }
                  }}
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                >
                  <input
                  type="checkbox"
                  id={`friend-checkbox-${friend.id}`}
                  checked={selectedFriends.includes(friend.id!)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                  className="mr-2"
                  title={`Chọn ${fullName} vào nhóm chat`}
                />
                  <img src={friend.avatar_url} alt={fullName} className="w-8 h-8 rounded-full mr-2" />
                  <span>{fullName}</span>
                </li>
              );
            })}
        </ul>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowGroupModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={() => {
              // Nếu có ít nhất 1 bạn được chọn, chuyển hướng đến conversation với thành viên là user đăng nhập và những người được chọn
              if (selectedFriends.length > 0) {
                router.push(`/messages?members=${[user?.id, ...selectedFriends].join(',')}`);
                setShowGroupModal(false);
              }
            }}
            disabled={selectedFriends.length === 0}
            className={`px-4 py-2 rounded-lg text-white ${
              selectedFriends.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Xác Nhận
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MessagesFeature;
