import { useState, useEffect } from "react";
import { defaultProfileRepo } from "@/api/features/profile/ProfileRepository";
import { defaultFriendRepo } from "@/api/features/friends/FriendRepo";
import { UserModel } from "@/api/features/authenticate/model/LoginModel";
import { message } from "antd";
import { useAuth } from "@/context/auth/useAuth";
import { GetUserNonFriendsModel } from "@/api/features/friends/models/GetUserNonFriends";

interface FriendRequest {
  id: string;
  from_user: {
    id: string;
    name: string;
    family_name: string;
    avatar_url: string;
  };
}

const PeopleViewModel = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFriendRequests, setLoadingFriendRequests] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [friendRequestsSent, setFriendRequestsSent] = useState<Set<string>>(new Set());
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<FriendRequest[]>([]);
  const limit = 10;
  const { localStrings } = useAuth();

  const fetchAllUsers = async (newPage: number = 1) => {
    try {
      setLoading(true);

      const response = await defaultFriendRepo.getUsersNonFriend({ page: newPage, limit: limit });

      if (response?.data && Array.isArray(response.data)) {
        const mappedUsers: UserModel[] = response.data.map((user: GetUserNonFriendsModel) => ({
          id: user.id,
          name: user.name,
          family_name: user.family_name,
          avatar_url: user.avatar_url,
        }));

        if (newPage === 1) {
          setUsers(mappedUsers);
        } else {
          setUsers((prevUsers) => [...prevUsers, ...mappedUsers]);
        }

        const { page: currentPage, limit: currentLimit, total } = response.paging || {};
        setPage(currentPage || newPage);
        setHasMore((currentPage || newPage) * (currentLimit || limit) < total);
      } else {
        message.error(`${localStrings.People.FetchUsersFailed}`);
      }
    } catch (error) {
      message.error(`${localStrings.People.FetchUsersFailed}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomingFriendRequests = async () => {
    try {
      setLoadingFriendRequests(true);
      const response = await defaultProfileRepo.getListFriendsRequest({});

      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        setIncomingFriendRequests(
          response.data.map((friend: any) => ({
            id: friend.id,
            from_user: {
              id: friend.id,
              name: friend.name,
              family_name: friend.family_name,
              avatar_url: friend.avatar_url,
            },
          }))
        );
      } else {
        setIncomingFriendRequests([]);
      }
    } catch (error) {
      // Optional: Handle errors
    } finally {
      setLoadingFriendRequests(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        hasMore &&
        !loading
      ) {
        const nextPage = page + 1;
        fetchAllUsers(nextPage);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, page]);

  useEffect(() => {
    fetchAllUsers(1);
    fetchIncomingFriendRequests();
  }, []);

  return {
    users,
    loading,
    loadingFriendRequests,
    hasMore,
    friendRequests: friendRequestsSent,
    incomingFriendRequests,

    handleAddFriend: async (userId: string) => {
      try {
        const response = await defaultProfileRepo.sendFriendRequest(userId);

        if (response?.code === 20001 && response?.message === "Success") {
          setFriendRequestsSent((prev) => new Set(prev).add(userId));
          message.success(`${localStrings.People.FriendRequestSentSuccess}`);
        } else {
          message.error(`${localStrings.People.FriendRequestSentFailed}`);
        }
      } catch (error) {
        message.error(`${localStrings.People.FriendRequestSentError}`);
      }
    },

    handleCancelFriend: async (userId: string) => {
      try {
        const response = await defaultProfileRepo.cancelFriendRequest(userId);
        if (response?.code === 20001 && response?.message === "Success") {
          setFriendRequestsSent((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          message.success(`${localStrings.People.FriendRequestCanceledSuccess}`);
        } else {
          message.error(`${localStrings.People.FriendRequestCanceledFailed}`);
        }
      } catch (error) {
        message.error(`${localStrings.People.FriendRequestCanceledError}`);
      }
    },

    handleAcceptFriendRequest: async (userId: string) => {
      try {
        const response = await defaultProfileRepo.acceptFriendRequest(userId);
        if (response?.code === 20001 && response?.message === "Success") {
          setIncomingFriendRequests((prev) =>
            prev.filter((request) => request.from_user.id !== userId)
          );
          message.success(`${localStrings.People.AcceptScuccess}`);
        } else {
          message.error(`${localStrings.People.AcceptFailed}`);
        }
      } catch (error) {
        message.error(`${localStrings.People.AcceptFailed}`);
      }
    },

    handleDeclineFriendRequest: async (userId: string) => {
      try {
        const response = await defaultProfileRepo.refuseFriendRequest(userId);
        if (response?.code === 20001 && response?.message === "Success") {
          setIncomingFriendRequests((prev) =>
            prev.filter((request) => request.from_user.id !== userId)
          );
          message.success(`${localStrings.People.DeclineSuccess}`);
        } else {
          message.error(`${localStrings.People.DeclineFailed}`);
        }
      } catch (error) {
        message.error(`${localStrings.People.DeclineFailed}`);
      }
    },
  };
};

export default PeopleViewModel;
