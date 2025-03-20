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
        console.log(`Tìm kiếm cuộc trò chuyện giữa user ${userId} và friend ${friendId}`);
        
        // Lấy tất cả các cuộc trò chuyện của người dùng hiện tại
        const userRes = await defaultMessagesRepo.getConversationDetailByUserID({ user_id: userId });
        console.log("Kết quả lấy cuộc trò chuyện của người dùng:", userRes);
        
        // Lấy tất cả các cuộc trò chuyện của người bạn
        const friendRes = await defaultMessagesRepo.getConversationDetailByUserID({ user_id: friendId });
        console.log("Kết quả lấy cuộc trò chuyện của bạn:", friendRes);
        
        if (userRes.data && friendRes.data) {
            // Đảm bảo dữ liệu trả về là mảng
            const userConvos = Array.isArray(userRes.data) ? userRes.data : [userRes.data];
            const friendConvos = Array.isArray(friendRes.data) ? friendRes.data : [friendRes.data];
            
            console.log("Số cuộc trò chuyện của người dùng:", userConvos.length);
            console.log("Số cuộc trò chuyện của bạn:", friendConvos.length);
            
            // In thông tin chi tiết để debug
            userConvos.forEach((conv, index) => {
            console.log(`User conversation ${index}:`, conv.conversation_id || conv.conversation?.id);
            });
            
            friendConvos.forEach((conv, index) => {
            console.log(`Friend conversation ${index}:`, conv.conversation_id || conv.conversation?.id);
            });
            
            // Tìm cuộc trò chuyện chung giữa người dùng và người bạn
            // Kiểm tra cả conversation_id và conversation?.id
            const commonConvo = userConvos.find(uc => {
            const ucId = uc.conversation_id || (uc.conversation && uc.conversation.id);
            return friendConvos.some(fc => {
                const fcId = fc.conversation_id || (fc.conversation && fc.conversation.id);
                return ucId === fcId;
            });
            });
            
            if (commonConvo) {
            const conversationId = commonConvo.conversation_id || (commonConvo.conversation && commonConvo.conversation.id);
            console.log("Đã tìm thấy cuộc trò chuyện chung:", conversationId);
            return conversationId || null;
            } else {
            console.log("Không tìm thấy cuộc trò chuyện chung");
            }
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