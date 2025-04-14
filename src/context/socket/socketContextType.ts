import { MessageResponseModel, MessageWebSocketResponseModel } from "@/src/api/features/messages/models/Messages";

export interface SocketContextType {
    connectSocketMessage: ()=> void;
    // sendSocketMessage: (message: string) => void;
    connectSocketNotification: () => void;
    socketMessages: MessageWebSocketResponseModel[];
    setSocketMessages: (messages: MessageWebSocketResponseModel[]) => void;
  
}