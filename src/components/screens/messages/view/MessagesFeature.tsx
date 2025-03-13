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
import { CiCircleChevDown } from "react-icons/ci";
import { Modal } from 'antd';
import { useRouter } from 'next/navigation';
import { IoMdArrowBack } from "react-icons/io";

const MessagesFeature = () => {
  const { user, localStrings } = useAuth();
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
    fetchUserProfile,
    setIsProfileModalOpen,
    isProfileModalOpen,
    activeFriendProfile,
  } = useMessageViewModel(user);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const router = useRouter();

  let hoverTimeout: NodeJS.Timeout | null = null;

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(!activeFriend);
      } else {
        setShowSidebar(true);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeFriend]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setShowSidebar(!activeFriend);
    }
  }, [activeFriend]);

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 300);
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

  const handleBackToFriendList = () => {
    setActiveFriend(null);
    setShowSidebar(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-[85vh] p-2 md:p-4 relative">
      {/* Left Side Bar */}
      {showSidebar && (
        <div className="w-full md:w-1/3 lg:w-1/4 border-r p-2 md:p-4 overflow-y-auto h-[40vh] md:h-[80vh] bg-white">
          <div className="flex items-center w-full">
            <AiOutlineSearch className="mr-[10px]" />
            <input
              type="text"
              placeholder={localStrings.Messages.SearchUser}
              className="flex-1 p-2 border rounded-lg text-sm md:text-base"
            />
            <button
              title={localStrings.Messages.CreateChatGroup}
              aria-label={localStrings.Messages.CreateChatGroup}
              onClick={() => setShowGroupModal(true)}
              className="ml-2 p-1"
            >
              <AiOutlineUsergroupAdd className="text-xl md:text-2xl" />
            </button>
          </div>
          <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4 mt-2 md:mt-4">{localStrings.Messages.FriendBar}</h2>
          <ul>
            {friends.map((friend: UserModel, index: number) => {
              const friendName = friend.name || "";
              const friendFamilyName = friend.family_name || "";
              return (
                <li
                  key={index}
                  className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-blue-100 ${activeFriend === friendName ? 'bg-blue-200' : ''}`}
                  onClick={() => {
                    setActiveFriend(friendName || null);
                    if (window.innerWidth < 768) {
                      setShowSidebar(false);
                    }
                  }}
                >
                  <img src={friend.avatar_url} alt={`${friendName}'s avatar`} className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2" />
                  <span className="font-medium text-sm md:text-base">{friendFamilyName} {friendName}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* Conversation Area */}
      <div className={`flex-1 flex flex-col px-1 md:px-2 ${!showSidebar ? 'block' : 'hidden md:block'}`}>
        {/* Conversation Header */}
        {activeFriend ? (
          (() => {
            const activeFriendData = friends.find((friend: UserModel) => friend.name === activeFriend);
            return (
              <div className='sticky bg-white z-100 top-0 flex h-16 md:h-20 rounded-xl items-center'>
                {window.innerWidth < 768 && (
                  <button 
                    onClick={handleBackToFriendList}
                    className="p-2 mr-1"
                    aria-label="Back to friend list"
                  >
                    <IoMdArrowBack className="text-xl" />
                  </button>
                )}
                <img
                  src={activeFriendData?.avatar_url || "https://via.placeholder.com/64"}
                  alt={activeFriendData?.name || "Friend avatar"}
                  className="mt-1 md:mt-2 mr-3 ml-1 md:ml-2 w-10 h-10 md:w-16 md:h-16 rounded-full object-cover cursor-pointer"
                  onMouseEnter={() => {
                    hoverTimeout = setTimeout(() => {
                      fetchUserProfile(activeFriendData?.id!);
                    }, 200); 
                  }}
                  onMouseLeave={() => {
                    if (hoverTimeout) {
                      clearTimeout(hoverTimeout); 
                    }
                  }}
                />
                <div className='grow'>
                  <h3 className='mt-1 md:mt-6 mb-1 md:mb-2 ml-1 md:ml-3 text-base md:text-xl font-bold truncate'>
                    {activeFriendData ? `${activeFriendData.family_name || ""} ${activeFriendData.name || ""}`.trim() : "Chọn bạn để chat"}
                  </h3>
                </div>
              </div>
            );
          })()
        ) : (
          <div className='sticky bg-white z-100 top-0 flex h-16 md:h-20 rounded-xl'>
            <div className='grow p-2 md:p-4'>
              <h3 className='mt-1 md:mt-2 mb-1 md:mb-3 ml-1 md:ml-3 text-base md:text-xl font-bold'>{localStrings.Messages.ChooseFriendToChat}</h3>
            </div>
          </div>
        )}

        {/* Conversation Content */}
        <div
          className="flex-1 overflow-y-auto border p-4 rounded-lg mb-4 bg-gray-100 h-[64vh] relative"
          onScroll={(e) => {
            const target = e.currentTarget;
            const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight > 100;
            setShowScrollToBottom(isNearBottom);
          }}
        >
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
                          {localStrings.Messages.Reply}: {message.replyTo.text}
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
                            {localStrings.Messages.Reply}
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
              <p className="text-gray-500">{localStrings.Messages.NoMessages}</p>
            )
          ) : (
            <p className="text-gray-500">{localStrings.Messages.ChooseFriendToConnect}</p>
          )}
        </div>
        {showScrollToBottom && (
          <button
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
              setShowScrollToBottom(false);
            }}
            className="absolute bottom-16 md:bottom-20 md:mb-2 right-6 md:right-12 p-1 md:p-2 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-200"
            title={localStrings.Messages.ScrollToBottom}
          >
            <CiCircleChevDown className="text-xl md:text-2xl text-gray-700" />
          </button>
        )}
        {/* Reply bar */}
        {replyTo && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">{localStrings.Messages.Reply}: {replyTo.text}</span>
            <button onClick={() => setReplyTo(null)} className="text-red-500">{localStrings.Messages.Cancel}</button>
          </div>
        )}
        {/* Input area */}
        <div className="flex gap-2 relative mb-2 md:mb-4">
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
              placeholder={activeFriend ? localStrings.Messages.EnterMessage : localStrings.Messages.ChooseFriendToConnect}
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
        title={localStrings.Messages.CreateChatGroup}
        open={showGroupModal}
        onCancel={() => setShowGroupModal(false)}
        footer={null}
        styles={{ 
          body: { padding: '20px' },
          mask: { background: 'rgba(0, 0, 0, 0.6)' },
          content: { 
            width: '90%', 
            maxWidth: '500px',
            margin: '0 auto' 
          }
        }}
      >
        <input
          type="text"
          value={groupSearch}
          onChange={(e) => setGroupSearch(e.target.value)}
          placeholder={localStrings.Messages.FindFriendInModal}
          className="w-full p-2 border rounded-lg mb-4 text-sm md:text-base"
        />
        <ul className="max-h-40 md:max-h-60 overflow-y-auto mb-4">
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
                  <img src={friend.avatar_url} alt={fullName} className="w-6 h-6 md:w-8 md:h-8 rounded-full mr-2" />
                  <span className="text-sm md:text-base">{fullName}</span>
                </li>
              );
            })}
        </ul>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowGroupModal(false)}
            className="px-2 py-1 md:px-4 md:py-2 rounded-lg border border-gray-400 text-gray-700 text-sm md:text-base"
          >
            {localStrings.Messages.Cancel}
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
            className={`px-2 py-1 md:px-4 md:py-2 rounded-lg text-white text-sm md:text-base ${
              selectedFriends.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {localStrings.Messages.Confirm}
          </button>
        </div>
      </Modal>
      
      {/* Modal hiển thị thông tin hồ sơ */}
      <Modal
        title={localStrings.Messages.UserProfile}
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        footer={null}
        styles={{ 
          body: { padding: '20px' },
          mask: { background: 'rgba(0, 0, 0, 0.6)' },
          content: { 
            width: '90%', 
            maxWidth: '400px',
            margin: '0 auto' 
          }
        }}
      >
        {activeFriendProfile ? (
          <div className="flex flex-col items-center p-2 md:p-4">
            <img
              src={activeFriendProfile.avatar_url || "https://via.placeholder.com/100"}
              alt="Avatar"
              className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-gray-300"
            />
            <h3 className="mt-2 text-base md:text-lg font-bold">{activeFriendProfile.family_name} {activeFriendProfile.name}</h3>
            <p className="text-sm md:text-base text-gray-600">{activeFriendProfile.email}</p>
            <div className="w-full mt-4">
              <button
                className="w-full py-1 md:py-2 border border-black text-black rounded-md hover:bg-gray-100 text-sm md:text-base"
                onClick={() => window.open(`/user/${activeFriendProfile.id}`, "_parent")}
              >
                {localStrings.Messages.ProfilePage}
              </button>
              <button
                className="w-full py-1 md:py-2 mt-2 border border-black text-black rounded-md hover:bg-gray-100 text-sm md:text-base"
                onClick={() => alert("Tính năng chặn chưa được triển khai")}
              >
                {localStrings.Messages.Block}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm md:text-base">Đang tải thông tin...</p>
        )}
      </Modal>
    </div>
  );
};

export default MessagesFeature;