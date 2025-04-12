import { ApiPath } from "../../ApiPath"; 
import { BaseApiResponseModel } from "../../baseApiResponseModel/baseApiResponseModel";
import client from "../../client";
import { GetUserNonFriendsModel } from "./models/GetUserNonFriends";

interface IFriendRepo {
    getUsersNonFriend(): Promise<BaseApiResponseModel<GetUserNonFriendsModel>>;
}

export class FriendRepo implements IFriendRepo {
    async getUsersNonFriend(): Promise<BaseApiResponseModel<GetUserNonFriendsModel>> {
        return client.get(ApiPath.NON_FRIENDS);
    }
}

export const defaultFriendRepo = new FriendRepo();