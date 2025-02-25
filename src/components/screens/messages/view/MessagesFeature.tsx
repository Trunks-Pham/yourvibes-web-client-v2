"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/auth/useAuth';
import { useMessageViewModel, Message } from '@/components/screens/messages/viewModel/MessagesViewModel';
import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const MessagesFeature = () => {
    const { user } = useAuth();
    const friends = [
        { name: 'Nguyễn Văn A', avatar: 'https://thumbs.dreamstime.com/b/avatar-icon-avatar-flat-symbol-isolated-white-avatar-icon-avatar-flat-symbol-isolated-white-background-avatar-simple-icon-124920496.jpg' },
        { name: 'Trần Thị B', avatar: 'https://thumbs.dreamstime.com/b/avatar-icon-avatar-flat-symbol-isolated-white-avatar-icon-avatar-flat-symbol-isolated-white-background-avatar-simple-icon-124920496.jpg' }
    ];

    const {
        newMessage,
        setNewMessage,
        activeFriend,
        setActiveFriend,
        messages,
        handleSendMessage,
        handleAddReaction,
    } = useMessageViewModel(user, friends);

    const [replyTo, setReplyTo] = useState<Message | null>(null);

    const toggleReaction = (message: Message, reaction: string) => {
        const currentReactions = message.reactions || {};
        const currentCount = currentReactions[reaction] || 0;

        // Toggle logic: If the reaction count is 0, increment by 1; if greater than 0, set to 0
        const newCount = currentCount === 0 ? 1 : 0;

        handleAddReaction(message, reaction, newCount);
    };


    return (
        <div className="flex h-[85vh] p-4">
            <div className="w-1/4 border-r p-4 overflow-y-auto h-[80vh]">
                <h2 className="text-xl font-bold mb-4">Bạn bè</h2>
                <ul>
                    {friends.map((friend, index) => (
                        <li
                            key={index}
                            className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-blue-100 ${activeFriend === friend.name ? 'bg-blue-200' : ''}`}
                            onClick={() => setActiveFriend(friend.name)}
                        >
                            <img src={friend.avatar} alt={`${friend.name}'s avatar`} className="w-10 h-10 rounded-full mr-2" />
                            <span className="font-medium">{friend.name}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex-1 flex flex-col p-4">
                <h1 className="text-2xl font-bold mb-4">{activeFriend ? `Nhắn tin với ${activeFriend}` : 'Chọn một người bạn'}</h1>
                <div className="flex-1 overflow-y-auto border p-4 rounded-lg mb-4 bg-gray-100 max-h-[70vh]">
                    {activeFriend ? (
                        messages[activeFriend]?.length ? (
                            messages[activeFriend].map((message, index) => (
                                <div key={index} className="p-2 bg-white rounded-lg shadow mb-2 flex items-center">
                                    <img src={message.avatar} alt={`${message.sender}'s avatar`} className="w-8 h-8 rounded-full mr-2" />
                                    <div>
                                        <div className="font-bold">{message.sender}</div>
                                        <div>{message.text}</div>
                                        {message.replyTo && (
                                            <div className="text-sm text-gray-500">
                                                Trả lời: {message.replyTo.text}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</div>
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
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        )
                    ) : (
                        <p className="text-gray-500">Chọn một người bạn để bắt đầu trò chuyện.</p>
                    )}
                </div>

                <div className="flex gap-2">
                    {replyTo && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Trả lời: {replyTo.text}</span>
                            <button onClick={() => setReplyTo(null)} className="text-red-500">Hủy</button>
                        </div>
                    )}
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={activeFriend ? "Nhập tin nhắn..." : "Chọn bạn để nhắn tin"}
                        className="flex-1 p-2 border rounded-lg"
                        disabled={!activeFriend}
                    />
                    <button
                        onClick={() => handleSendMessage(replyTo ?? undefined)}
                        className={`px-4 py-2 rounded-lg text-white ${newMessage.trim() && activeFriend ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!newMessage.trim() || !activeFriend}
                    >
                        Gửi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessagesFeature;