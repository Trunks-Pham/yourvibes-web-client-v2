import { defaultMessagesRepo } from "@/api/features/messages/MessagesRepo";
import { ConversationDetailResponseModel } from "@/api/features/messages/models/ConversationDetailModel";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";
import { useAuth } from "@/context/auth/useAuth";
import { useState, useCallback } from "react";

export const useConversationViewModel = () => {
    const { user } = useAuth();
    const [activeFriend, setActiveFriend] = useState<FriendResponseModel | null>(null);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    // Lấy hoặc tạo cuộc trò chuyện giữa người dùng hiện tại và người bạn đang active
    const getOrCreateConversation = useCallback(async (): Promise<string> => {
        if (!user?.id || !activeFriend?.id) throw new Error("User hoặc friend không được xác định");

        // Kiểm tra xem đã có cuộc trò chuyện chưa
        const existingConversationId = await getExistingConversation(user.id, activeFriend.id);

        if (existingConversationId) {
            return existingConversationId;
        }

        // Tạo tên cho cuộc trò chuyện mới
        let conversationName = `Chat giữa ${user?.name} và ${activeFriend.name}`;
        if (conversationName.length > 30) {
            conversationName = conversationName.substring(0, 30);
        }

        // Tạo cuộc trò chuyện mới
        const conversationRes = await defaultMessagesRepo.createConversation({
            name: conversationName,
        });

        const conversation = conversationRes.data;
        if (!conversation?.id) {
            throw new Error('Không thể tạo cuộc trò chuyện');
        }

        const conversationId = conversation.id;

        // Thêm người dùng hiện tại vào cuộc trò chuyện
        await defaultMessagesRepo.createConversationDetail({
            conversation_id: conversationId,
            user_id: user?.id,
        });

        // Thêm người bạn vào cuộc trò chuyện
        await defaultMessagesRepo.createConversationDetail({
            conversation_id: conversationId,
            user_id: activeFriend.id,
        });
        
        return conversationId;
    }, [user, activeFriend]);

    // Tìm cuộc trò chuyện chung giữa 2 người dùng
    const getExistingConversation = useCallback(async (userId: string, friendId: string): Promise<string | null> => {
        try {
            // Lấy tất cả các cuộc trò chuyện của người dùng hiện tại
            const userRes = await defaultMessagesRepo.getConversationDetailByUserID({ user_id: userId });
            
            // Lấy tất cả các cuộc trò chuyện của người bạn
            const friendRes = await defaultMessagesRepo.getConversationDetailByUserID({ user_id: friendId });
            
            if (userRes.data && friendRes.data) {
                const userConvos = userRes.data as ConversationDetailResponseModel[];
                const friendConvos = friendRes.data as ConversationDetailResponseModel[];
                
                // Tìm cuộc trò chuyện chung giữa người dùng và người bạn
                const commonConvo = userConvos.find(uc =>
                    friendConvos.some(fc => fc.conversation?.id === uc.conversation?.id)
                );
                
                return commonConvo?.conversation?.id || null;
            }
        } catch (err) {
            console.error("Lỗi khi tìm kiếm cuộc trò chuyện hiện có", err);
        }
        return null;
    }, []);

    return {
        getOrCreateConversation,
        getExistingConversation,
        activeFriend,
        setActiveFriend,
        activeConversationId,
        setActiveConversationId
    };
};