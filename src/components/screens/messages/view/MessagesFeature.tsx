"use client";

import React, { useState } from 'react';

const MessagesFeature = () => {
    const [messages, setMessages] = useState<{ [key: string]: string[] }>({});
    const [newMessage, setNewMessage] = useState<string>('');
    const [activeFriend, setActiveFriend] = useState<string | null>(null);

    const friends = [
        { name: 'Nguyễn Văn A', avatar: 'https://example.com/avatar1.jpg' },
        { name: 'Trần Thị B', avatar: 'https://example.com/avatar2.jpg' },
        { name: 'Lê Văn C', avatar: 'https://example.com/avatar3.jpg' },
        { name: 'Phạm Thị D', avatar: 'https://example.com/avatar4.jpg' },
        { name: 'Hoàng Văn E', avatar: 'https://example.com/avatar5.jpg' },
        { name: 'Đặng Thị F', avatar: 'https://example.com/avatar6.jpg' },
        { name: 'Bùi Văn G', avatar: 'https://example.com/avatar7.jpg' },
        { name: 'Đỗ Thị H', avatar: 'https://example.com/avatar8.jpg' },
        { name: 'Ngô Văn I', avatar: 'https://example.com/avatar9.jpg' },
        { name: 'Vũ Thị K', avatar: 'https://example.com/avatar10.jpg' },
        { name: 'Dương Văn L', avatar: 'https://example.com/avatar11.jpg' },
        { name: 'Phan Thị M', avatar: 'https://example.com/avatar12.jpg' },
        { name: 'Lý Văn N', avatar: 'https://example.com/avatar13.jpg' },
        { name: 'Tô Thị O', avatar: 'https://example.com/avatar14.jpg' },
        { name: 'Nguyễn Văn P', avatar: 'https://example.com/avatar15.jpg' },
        { name: 'Trần Thị Q', avatar: 'https://example.com/avatar16.jpg' },
        { name: 'Lê Văn R', avatar: 'https://example.com/avatar17.jpg' },
        { name: 'Phạm Thị S', avatar: 'https://example.com/avatar18.jpg' },
        { name: 'Hoàng Văn T', avatar: 'https://example.com/avatar19.jpg' },
        { name: 'Đặng Thị U', avatar: 'https://example.com/avatar20.jpg' }
    ];

    const handleSendMessage = () => {
        if (newMessage.trim() !== '' && activeFriend) {
            setMessages(prev => ({
                ...prev,
                [activeFriend]: [...(prev[activeFriend] || []), newMessage]
            }));
            setNewMessage('');
        }
    };

    return (
        <div className="flex h-[85vh] p-4">
            {/* Sidebar Friends List */}
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

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto border p-4 rounded-lg mb-4 bg-gray-100 max-h-[50vh]">
                    {activeFriend ? (
                        messages[activeFriend]?.length ? (
                            messages[activeFriend].map((message, index) => (
                                <div key={index} className="p-2 bg-white rounded-lg shadow mb-2">
                                    {message}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        )
                    ) : (
                        <p className="text-gray-500">Chọn một người bạn để bắt đầu trò chuyện.</p>
                    )}
                </div>

                {/* Input Section */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={activeFriend ? "Nhập tin nhắn..." : "Chọn bạn để nhắn tin"}
                        className="flex-1 p-2 border rounded-lg"
                        disabled={!activeFriend}
                    />
                    <button
                        onClick={handleSendMessage}
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
