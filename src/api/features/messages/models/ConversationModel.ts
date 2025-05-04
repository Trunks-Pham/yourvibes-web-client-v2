export interface CreateConversationRequestModel {
    name?: string,
    image?: File | string, 
    user_ids: string[],
}

export interface GetCoversationRequestModel {
    name?: string,
    created_at?: string,
    sort_by?: string,
    isDescending?: boolean,
    limit?: number,
    page?: number,
}

export interface GetConversationByIDRequestModel {
    conversation_id?: string,
}

export interface DeleteConversationByIDRequestModel {
    conversation_id?: string,
}

export interface UpdateConversationRequestModel {
    conversation_id?: string,
    name?: string,
    image?: string | File, 
}

export interface ConversationResponseModel {
    id?: string,
    name?: string,
    image?: string,
    avatar?: string,
    user_id?: string,
    family_name?: string,
    created_at?: string,
    updated_at?: string,
    last_message?: string,
    last_message_status?: boolean,
    active_status?: boolean,
}
