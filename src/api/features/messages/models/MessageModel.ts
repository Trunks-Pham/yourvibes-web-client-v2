export interface CreateMessageRequestModel {
    content?: string,
    conversation_id?: string,
    parent_id?: string,
    user?:{
        avatar_url?: string,
        family_name?: string,
        id?: string,
        name?: string,
    }
}
export interface MessageWebSocketResponseModel {
    id?: string;
    content?: string;
    user_id?: string;
    conversation_id: string;
    parent_id?: string;
    parent_content?: string;
    user: {
      id?: string;
      avatar_url?: string;
      family_name?: string;
      name?: string;
    };
    created_at?: string;
  }
export interface GetMessagesByConversationIdRequestModel {
    conversation_id?: string,
    created_at?: string,
    sort_by?: string,
    is_descending?: boolean,
    page?: number,
    limit?: number
}

export interface GetMessageByIDRequestModel {
    messageId?: string,
}

export interface DeleteMessageRequestModel {
    message_id?: string,
}

export interface MessageResponseModel {
    id?: string,
    user_id?: string,
    user?: {
        id?: string,
        family_name?: string,
        name?: string,
        avatar_url?: string,
    }
    conversation_id?: string,
    parent_id?: string,
    parent_content?: string;
    content?: string,
    created_at?: string,
          
    isTemporary?: boolean,        

    fromServer?: boolean,

    isDateSeparator?: boolean;
}