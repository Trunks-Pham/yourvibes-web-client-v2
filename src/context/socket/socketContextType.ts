<<<<<<< HEAD
import { MessageResponseModel, MessageWebSocketResponseModel } from "@/api/features/messages/models/MessageModel" ;

export interface SocketContextType {
    connectSocketMessage: ()=> void;
    // sendSocketMessage: (message: string) => void;
    connectSocketNotification: () => void;
    socketMessages: MessageWebSocketResponseModel[];
    setSocketMessages: (messages: MessageWebSocketResponseModel[]) => void;
  
=======
import { MessageWebSocketResponseModel } from "@/api/features/messages/models/MessageModel";


export interface SocketContextType {
    connectSocketMessage: ()=> void;
    // sendSocketMessage: (message: string) => void;
    connectSocketNotification: () => void;
    socketMessages: MessageWebSocketResponseModel[];
    setSocketMessages: (messages: MessageWebSocketResponseModel[]) => void;
  
>>>>>>> aae70b8bf7bdacbb72948e538b78b16d7472a5bf
}