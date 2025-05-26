"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SocketContextType } from "./socketContextType";
import { useAuth } from "../auth/useAuth";
import { MessageWebSocketResponseModel } from "@/api/features/messages/models/MessageModel";
import useTypeNotification from "@/hooks/useTypeNotification";
import { ApiPath } from "@/api/ApiPath";
import { Avatar, notification, theme } from "antd";
import useColor from "@/hooks/useColor";
import { log } from "console";

const WebSocketContext = createContext<SocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{
  children: ReactNode;
  onStatusUpdate?: (userId: string, active_status: boolean) => void;
}> = ({ children, onStatusUpdate }) => {
  const { user, localStrings } = useAuth();
  const {backgroundColor, brandPrimary, theme} = useColor();
  const [socketMessages, setSocketMessages] = useState<MessageWebSocketResponseModel[]>([]);
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const MAX_CONNECTION_ATTEMPTS = 3;
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionAttemptsNotification, setConnectionAttemptsNotification] = useState(0);

  const wsMessageRef = useRef<WebSocket | null>(null);
  const wsNotificationRef = useRef<WebSocket | null>(null);

  const notificationType = useTypeNotification();

  const mapNotifiCationContent = (type: string) => {
    switch (type) {
      case notificationType.LIKE_POST:
        return localStrings.Notification.Items.LikePost;
      case notificationType.NEW_SHARE:
        return localStrings.Notification.Items.SharePost;
      case notificationType.NEW_COMMENT:
        return localStrings.Notification.Items.CommentPost;
      case notificationType.FRIEND_REQUEST:
        return localStrings.Notification.Items.Friend;
      case notificationType.ACCEPT_FRIEND_REQUEST:
        return localStrings.Notification.Items.AcceptFriend;
      case notificationType.NEW_POST:
        return localStrings.Notification.Items.NewPost;
      case notificationType.LIKE_COMMENT:
        return localStrings.Notification.Items.LikeComment;
      case notificationType.NEW_POST_PERSONAL:
        return localStrings.Notification.Items.NewPostPersonal;
      case notificationType.BLOCK_CREATE_POST:
        return localStrings.Notification.Items.BlockCreatePost;
      case notificationType.DEACTIVATE_POST:
        return localStrings.Notification.Items.DeactivatePostContent;
      case notificationType.ACTIVACE_POST:
        return localStrings.Notification.Items.ActivacePostContent;
      case notificationType.DEACTIVATE_COMMENT:
        return localStrings.Notification.Items.DeactivateCommentContent;
      case notificationType.ACTIVACE_COMMENT:
        return localStrings.Notification.Items.ActivaceCommentContent;
      default:
        return localStrings.Notification.Notification;
    }
  };

  const isMessageProcessed = (message: MessageWebSocketResponseModel): boolean => {
    if (!message || !message.id) return true;

    const uniqueId = `${message.id}-${message.conversation_id}-${message.content}`;

    return processedMessagesRef.current.has(uniqueId);
  };

  const markMessageAsProcessed = (message: MessageWebSocketResponseModel) => {
    if (!message || !message.id) return;

    const uniqueId = `${message.id}-${message.conversation_id}-${message.content}`;

    processedMessagesRef.current.add(uniqueId);

    if (processedMessagesRef.current.size > 500) {
      const oldestEntries = Array.from(processedMessagesRef.current).slice(0, 200);
      oldestEntries.forEach((entry) => processedMessagesRef.current.delete(entry));
    }
  };

  const connectSocketMessage = () => {
    if (!user?.id || wsMessageRef.current) return;

    const ws = new WebSocket(`${ApiPath.GET_WS_PATH_MESSAGE}${user.id}`);
    wsMessageRef.current = ws;

    ws.onopen = () => {
      console.log("🔗 WebSocket Message connected");
      setSocketMessages([]);
    };

    ws.onmessage = (e) => {
      try {
        console.log("📩 WebSocket Message received:", e.data);
        const message = JSON.parse(e.data);

        if (message.type === "user_status_update" && onStatusUpdate) {
          onStatusUpdate(message.userId, message.active_status);
          return;
        }

        if (message.id && isMessageProcessed(message)) {
          return;
        }

        setSocketMessages((prev) => {
          const duplicate = prev.some((m) => message.id && m.id === message.id);

          if (duplicate) {
            return prev;
          }

          markMessageAsProcessed(message);

          return [message, ...prev.slice(0, 49)];
        });

        if (message?.user?.id !== user?.id) {
          const messageContent = message.content || "";
          const truncatedContent =
            messageContent.length > 50 ? `${messageContent.substring(0, 47)}...` : messageContent;

            notification.open({
              message: (
                <div style={{ display: "flex", alignItems: "flex-start"}}>
                  <Avatar
                    src={message.user?.avatar_url}
                    size={40}
                    style={{
                      backgroundColor: !message.user?.avatar_url ? "#1890ff" : undefined,
                      marginRight: 12,
                      marginTop: 4,
                    }}
                  >
                    {!message.user?.avatar_url && (message.user?.name?.charAt(0) || "U")}
                  </Avatar>
                  <div style={{ maxWidth: 250 }}>
                    <div
                      style={{
                        fontWeight: 500,
                        marginBottom: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {`${message?.user?.family_name || ""} ${message?.user?.name || ""} đã gửi tin nhắn`}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#555",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {truncatedContent}
                    </div>
                  </div>
                </div>
              ),
              placement: "topRight",
              duration: 5,
              description: null,
              key: `message-${message.conversation_id}-${Date.now()}`,
            });
            
            
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onclose = (e) => {
      console.log("❌ WebSocket Message disconnected:", e.reason, e.code);
      wsMessageRef.current = null;
      setConnectionAttempts((prevAttempts) => {
        console.log("newAttempts", prevAttempts);

        const newAttempts = prevAttempts + 1;
        if (newAttempts < MAX_CONNECTION_ATTEMPTS) {
          setTimeout(() => connectSocketMessage(), 100);
        }
        return newAttempts;
      });
    };

    ws.onerror = (error) => {
      console.error("⚠️ WebSocket Message error:", error);
    };
  };


  const connectSocketNotification = () => {
    if (!user?.id || wsNotificationRef.current) return;

    const ws = new WebSocket(`${ApiPath.GET_WS_PATH_NOTIFICATION}${user.id}`);
    wsNotificationRef.current = ws;

        ws.onopen = () => {
            console.log("🔗 WebSocket Notification connected");
        };

    ws.onmessage = (e) => {
      try {
        const notificationData = JSON.parse(e.data);
console.log("theme", theme);

        
        const { from: userName, content, notification_type: type, from_url: avatar_url } = notificationData;
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
          if (content.includes("abuse")) {
            return localStrings.Notification.Items.abuse;
          }
          return content;
        };

        const key = `notification-${Date.now()}`;
        
        notification.open({
          message: (
            <div style={{ display: "flex", alignItems: "center"}}>
              <Avatar
                src={avatar_url}
                size={40}
                style={{
                  backgroundColor: !avatar_url ? "#1890ff" : undefined,
                  marginRight: 8,
                  flexShrink: 0, // Ngăn avatar bị co lại
                }}
              />
              <div style={{ flex: 1, overflow: "hidden"}}>
                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {`${userName} ${notificationContent}`}
                </div>
                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {getDescription(content)}
                </div>
              </div>
            </div>
          ),
          placement: "topRight",
          key,
          duration: 5,
        });

      } catch (error) {
        console.error("Error processing notification:", error);
      }
    };

    ws.onclose = (e) => {
      console.log("❌ WebSocket Notification disconnected:", e.reason);
      wsNotificationRef.current = null;
      setConnectionAttemptsNotification((prevAttempts) => {
        const newAttempts = prevAttempts + 1;
        if (newAttempts < MAX_CONNECTION_ATTEMPTS) {
          setTimeout(() => connectSocketNotification(), 5000);
        }
        return newAttempts;
      });
    };

    ws.onerror = (error) => {
      console.error("⚠️ WebSocket Notification error:", error);
    };
  };

  const sendSocketMessage = (message: MessageWebSocketResponseModel): boolean => {
    if (!wsMessageRef.current || wsMessageRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      wsMessageRef.current.send(
        JSON.stringify({
          type: "message",
          data: message,
        })
      );
      return true;
    } catch (err) {
      console.error("Failed to send message via WebSocket:", err);
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
      setSocketMessages([]);
      processedMessagesRef.current.clear();
    };
  }, [user?.id]);

  return (
    <WebSocketContext.Provider
      value={{
        socketMessages,
        setSocketMessages,
        connectSocketMessage,
        connectSocketNotification,
        sendSocketMessage,
      }}
    >
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