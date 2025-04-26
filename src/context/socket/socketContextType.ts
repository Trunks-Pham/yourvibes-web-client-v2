
import { MessageWebSocketResponseModel } from "@/api/features/messages/models/MessageModel";


export interface SocketContextType {
    connectSocketMessage: ()=> void;
    sendSocketMessage: (message: MessageWebSocketResponseModel) => boolean;
    connectSocketNotification: () => void;
    socketMessages: MessageWebSocketResponseModel[];
    setSocketMessages: (messages: MessageWebSocketResponseModel[]) => void;
    onlineUsers: Set<string>;
    updateOnlineStatus: (userId: string, isOnline: boolean) => void;
}