"use client";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { SocketContextType } from "./socketContextType";
import { useAuth } from "../auth/useAuth";
import { MessageWebSocketResponseModel } from "@/api/features/messages/models/MessageModel";
import useTypeNotification from "@/hooks/useTypeNotification";
import { ApiPath } from "@/api/ApiPath";
import { notification } from "antd";
import { log } from "console";

const WebSocketContext = createContext<SocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, localStrings } = useAuth();
    const [socketMessages, setSocketMessages] = useState<MessageWebSocketResponseModel[]>([]);

    const MaxConnection = 3;
    const [connectionAttempts, setConnectionAttempts] = useState(0); 
    const [connectionAttemptsNotification, setConnectionAttemptsNotification] = useState(0);

    const wsMessageRef = useRef<WebSocket | null>(null);
    const wsNotificationRef = useRef<WebSocket | null>(null);

    const { LIKE_POST, NEW_SHARE, NEW_COMMENT, FRIEND_REQUEST, ACCEPT_FRIEND_REQUEST, NEW_POST, LIKE_COMMENT, NEW_POST_PERSONAL,
        BLOCK_CREATE_POST,
        DEACTIVATE_POST,
        ACTIVACE_POST,
        DEACTIVATE_COMMENT,
        ACTIVACE_COMMENT, } = useTypeNotification();

    const mapNotifiCationContent = (type: string) => {
        switch (type) {
            case LIKE_POST: return localStrings.Notification.Items.LikePost;
            case NEW_SHARE: return localStrings.Notification.Items.SharePost;
            case NEW_COMMENT: return localStrings.Notification.Items.CommentPost;
            case FRIEND_REQUEST: return localStrings.Notification.Items.Friend;
            case ACCEPT_FRIEND_REQUEST: return localStrings.Notification.Items.AcceptFriend;
            case NEW_POST: return localStrings.Notification.Items.NewPost;
            case LIKE_COMMENT: return localStrings.Notification.Items.LikeComment;
            case NEW_POST_PERSONAL: return localStrings.Notification.Items.NewPostPersonal;
            case BLOCK_CREATE_POST: return localStrings.Notification.Items.BlockCreatePost;
            case DEACTIVATE_POST: return localStrings.Notification.Items.DeactivatePostContent;
            case ACTIVACE_POST: return localStrings.Notification.Items.ActivacePostContent;
            case DEACTIVATE_COMMENT: return localStrings.Notification.Items.DeactivateCommentContent;
            case ACTIVACE_COMMENT: return localStrings.Notification.Items.ActivaceCommentContent;

            default: return localStrings.Notification.Notification;
        }
    };

    const connectSocketMessage = () => {
        if (!user?.id) return; 
        
        if (wsMessageRef.current) {
            wsMessageRef.current.close();
            wsMessageRef.current = null;
        }
    
        try {
            const ws = new WebSocket(`${ApiPath.GET_WS_PATH_MESSAGE}${user.id}`);
            wsMessageRef.current = ws;
    
            ws.onopen = () => {
                console.log("🔗 WebSocket Message connected");
                setConnectionAttempts(0); 
            };
    
            ws.onmessage = (e) => {
                try {
                    const message = JSON.parse(e.data);
                    console.log("🔥 WebSocket Message Received:", message);
                    
                    setSocketMessages((prev) => [...prev, message]);
                    
                    if (message?.user?.id !== user?.id) {
                        notification.open({
                            message: `${message?.user?.family_name || ''} ${message?.user?.name || ''} sent you a message`,
                            description: message.content,
                            placement: "topRight",
                            duration: 5,
                        });
                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            };
    
            ws.onclose = (e) => {
                console.log("❌ WebSocket Message disconnected:", e.reason, e.code);
                wsMessageRef.current = null;
                
                setConnectionAttempts((prevAttempts) => {
                    const newAttempts = prevAttempts + 1;
                    const delay = Math.min(500 * Math.pow(2, newAttempts), 30000); 
                    
                    if (newAttempts < MaxConnection) {
                        console.log(`Attempting to reconnect in ${delay/1000}s (attempt ${newAttempts})`);
                        setTimeout(() => connectSocketMessage(), delay);
                    } else {
                        console.log("Maximum reconnection attempts reached");
                    }
                    return newAttempts;
                });
            };
    
            ws.onerror = (error) => {
                console.error("⚠️ WebSocket Message error:", error);
            };
        } catch (error) {
            console.error("Failed to connect to WebSocket:", error);
            wsMessageRef.current = null;
        }
    };

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

            const getDescription = (content: string) => {
                if (content.includes("violence")) {
                    return localStrings.Notification.Items.violence;
                }
                if (content.includes("nsfw")) {
                    return localStrings.Notification.Items.nsfw;
                }
                if (content.includes("political")) {
                    return localStrings.Notification.Items.political;
                }
                return content;
            }
            const key = `open${Date.now()}`;
            notification.open({
                message: `${userName} ${notificationContent}`,
                description: getDescription(content),
                placement: "topRight",
                key,
                duration: 5,
            });
        };

        ws.onclose = (e) => {
            console.log("❌ WebSocket Notification disconnected:", e.reason);
            wsNotificationRef.current = null;
            setConnectionAttemptsNotification((prevAttempts) => {
                const newAttempts = prevAttempts + 1;
                console.log("connectionAttemptsNotification", newAttempts);
                console.log("MaxConnection", MaxConnection);
                
                if (newAttempts < MaxConnection) {
                    setTimeout(() => connectSocketNotification(), 5000); 
                }
                return newAttempts;
            });
        };

        ws.onerror = (error) => {
            console.error("⚠️ WebSocket Notification error:", error);
        };
    };

    const sendSocketMessage = (message: MessageWebSocketResponseModel) => {
        if (!wsMessageRef.current || wsMessageRef.current.readyState !== WebSocket.OPEN) {
            connectSocketMessage();
            
            return false;
        }
        
        try {
            console.log("Sending message via WebSocket:", message);
            wsMessageRef.current.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error("Error sending message:", error);
            return false;
        }
    };

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
            socketMessages, setSocketMessages, connectSocketMessage, connectSocketNotification, sendSocketMessage }}>
            {children}
        </WebSocketContext.Provider>
        
    );
};

export const useWebSocket = (): SocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};
