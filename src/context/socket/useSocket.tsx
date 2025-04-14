"use client";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { SocketContextType } from "./socketContextType";
import { useAuth } from "../auth/useAuth";
import { MessageWebSocketResponseModel } from "@/api/features/messages/models/MessageModel";
import useTypeNotification from "@/hooks/useTypeNotification";
import { ApiPath } from "@/api/ApiPath";
import { notification } from "antd";

const WebSocketContext = createContext<SocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, localStrings } = useAuth();
    const [socketMessages, setSocketMessages] = useState<MessageWebSocketResponseModel[]>([]);

    // Sử dụng useRef để lưu trữ WebSocket
    const wsMessageRef = useRef<WebSocket | null>(null);
    const wsNotificationRef = useRef<WebSocket | null>(null);

    const { LIKE_POST, NEW_SHARE, NEW_COMMENT, FRIEND_REQUEST, ACCEPT_FRIEND_REQUEST, NEW_POST, LIKE_COMMENT } = useTypeNotification();

    const mapNotifiCationContent = (type: string) => {
        switch (type) {
            case LIKE_POST: return localStrings.Notification.Items.LikePost;
            case NEW_SHARE: return localStrings.Notification.Items.SharePost;
            case NEW_COMMENT: return localStrings.Notification.Items.CommentPost;
            case FRIEND_REQUEST: return localStrings.Notification.Items.Friend;
            case ACCEPT_FRIEND_REQUEST: return localStrings.Notification.Items.AcceptFriend;
            case NEW_POST: return localStrings.Notification.Items.NewPost;
            case LIKE_COMMENT: return localStrings.Notification.Items.LikeComment;
            default: return "notifications";
        }
    };

    // 👉 Hàm kết nối WebSocket Message
    const connectSocketMessage = () => {
        if (!user?.id || wsMessageRef.current) return; // Tránh kết nối lại khi đã có kết nối

        const ws = new WebSocket(`${ApiPath.GET_WS_PATH_MESSAGE}${user.id}`);
        wsMessageRef.current = ws;

        ws.onopen = () => console.log("🔗 WebSocket Message connected");

        ws.onmessage = (e) => {
            const message = JSON.parse(e.data);
            console.log("📩 Nhận tin nhắn:", message);
                // setSocketMessages((prev) => [message, ...prev]);
                if (message?.user?.id !== user?.id) {
                    notification.open({
                        message: `${message?.user?.name} đã gửi cho bạn một tin nhắn`,
                        placement: "topRight",
                        duration: 5,
                    });
                }
        };

        ws.onclose = (e) => {
            console.log("❌ WebSocket Message disconnected:", e.reason, e.code);
            if (e.code === 1006) {
                console.log("🔄 Attempting to reconnect WebSocket Message...");
                setTimeout(() => {
                    connectSocketMessage();
                }, 5000); // Thử lại sau 5 giây
            }
            wsMessageRef.current = null; // Reset ref khi bị ngắt kết nối
        };

        ws.onerror = (error) => {
            console.error("⚠️ WebSocket Message error:", error);
            // Toast.show({
            //     type: "error",
            //     text1: "Lỗi WebSocket",
            //     text2: "Không thể kết nối WebSocket.",
            // });
        };
    };

    // 👉 Hàm kết nối WebSocket Notification
    const connectSocketNotification = () => {
        if (!user?.id || wsNotificationRef.current) return;

        const ws = new WebSocket(`${ApiPath.GET_WS_PATH_NOTIFICATION}${user.id}`);
        console.log(ApiPath.GET_WS_PATH_NOTIFICATION, user.id);
        
        wsNotificationRef.current = ws;

        ws.onopen = () => console.log("🔗 WebSocket Notification connected");

        ws.onmessage = (e) => {
            const notificationData = JSON.parse(e.data);
            const { from: userName, content, notification_type: type } = notificationData;
            const notificationContent = mapNotifiCationContent(type);

            const key = `open${Date.now()}`;
            notification.open({
                message: `${userName} ${notificationContent}`,
                description: content,
                placement: "topRight",
                key,
                duration: 5,
            });
        };

        ws.onclose = (e) => {
            console.log("❌ WebSocket Notification disconnected:", e.reason);
            wsNotificationRef.current = null;
        };

        ws.onerror = (error) => {
            console.error("⚠️ WebSocket Notification error:", error);
            // Toast.show({
            //     type: "error",
            //     text1: "Lỗi WebSocket",
            //     text2: "Không thể kết nối WebSocket.",
            // });
        };
    };

    // 👉 Xử lý cleanup khi user thay đổi hoặc component unmount
    useEffect(() => {
        if (user?.id) {
            connectSocketNotification();
            connectSocketMessage();
        }

        return () => {
            if (wsMessageRef.current) {
                wsMessageRef.current.close();
                wsMessageRef.current = null;
            }
            if (wsNotificationRef.current) {
                wsNotificationRef.current.close();
                wsNotificationRef.current = null;
            }
        };
    }, [user?.id]);
    return (
        <WebSocketContext.Provider value={{ 
            socketMessages, setSocketMessages, connectSocketMessage, connectSocketNotification, }}>
            {children}
        </WebSocketContext.Provider>
        
    );
};

// Hook dùng WebSocket
export const useWebSocket = (): SocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};
