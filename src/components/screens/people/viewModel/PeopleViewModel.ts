import { useState, useEffect, useCallback } from "react";
import { defaultProfileRepo } from "@/api/features/profile/ProfileRepository";
import { defaultSearchRepo } from "@/api/features/search/SearchRepository";
import { UserModel } from "@/api/features/authenticate/model/LoginModel";
import { message } from "antd";
import { FriendModel } from "@/api/features/profile/model/GetListFriendsRequsetModel";
import { useAuth } from "@/context/auth/useAuth";

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
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 20;
  const { localStrings } = useAuth();

  // Callback to sync users from SearchScreen
  const updateSearchResults = useCallback(
    (newUsers: UserModel[], total: number) => {
      setLoading(false);
      if (page === 1) {
        setUsers(newUsers);
      } else {
        setUsers((prevUsers) => [...prevUsers, ...newUsers]);
      }
      setHasMore(users.length + newUsers.length < total);
    },
    [page, users.length, limit]
  );

  // Fetch all users
  const fetchAllUsers = async (newPage: number = 1) => {
    try {
      setLoading(true);
      const response = await defaultSearchRepo.search({
        limit,
        page: newPage,
      });

      if (response?.data) {
        if (newPage === 1) {
          setUsers(response.data);
        } else {
          setUsers((prevUsers) => [...prevUsers, ...response.data]);
        }

        const { page: currentPage, limit: currentLimit, total } = response.paging || {};
        setPage(currentPage || newPage);
        setHasMore(currentPage * currentLimit < total);
      } else {
        message.error(`${localStrings.People.FetchUsersFailed}`);
      }
    } catch (error) {
      message.error(`${localStrings.People.FetchUsersFailed}`);
    } finally {
      setLoading(false);
    }
  };

// Fetch incoming friend requests without pagination
const fetchIncomingFriendRequests = async () => {
  try {
    setLoadingFriendRequests(true);
    const response = await defaultProfileRepo.getListFriendsRequest({});

    if (response?.data?.data && (response.data.data as unknown as FriendModel[]).length > 0) {
      setIncomingFriendRequests(
        (response.data.data as unknown as FriendModel[]).map((friend: FriendModel)=> ({
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
      message.info(`${localStrings.People.NoFriendRequests}`); 
    }
  } catch (error) {
    message.error(`${localStrings.People.NoFriendRequests}`);
  } finally {
    setLoadingFriendRequests(false);
  }
};

  // Handle sending a friend request
  const handleAddFriend = async (userId: string) => {
    try {
      const response = await defaultProfileRepo.sendFriendRequest(userId);
      if (response?.data) {
        setFriendRequestsSent((prev) => new Set(prev).add(userId));
        message.success("Friend request sent");
      } else {
        message.error("Failed to send friend request");
      }
    } catch (error) {
      message.error("Error sending friend request");
    }
  };

  // Handle canceling a friend request
  const handleCancelFriend = async (userId: string) => {
    try {
      const response = await defaultProfileRepo.cancelFriendRequest(userId);
      if (response?.data) {
        setFriendRequestsSent((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        message.success("Friend request canceled");
      } else {
        message.error("Failed to cancel friend request");
      }
    } catch (error) {
      message.error("Error canceling friend request");
    }
  };

  // Handle accepting a friend request
  const handleAcceptFriendRequest = async (userId: string) => {
    try {
      const response = await defaultProfileRepo.acceptFriendRequest(userId);
      if (response?.data) {
        setIncomingFriendRequests((prev) =>
          prev.filter((request) => request.from_user.id !== userId)
        );
        message.success("Friend request accepted");
      } else {
        message.error("Failed to accept friend request");
      }
    } catch (error) {
      message.error("Error accepting friend request");
    }
  };

  // Handle declining a friend request
  const handleDeclineFriendRequest = async (userId: string) => {
    try {
      const response = await defaultProfileRepo.refuseFriendRequest(userId);
      if (response?.data) {
        setIncomingFriendRequests((prev) =>
          prev.filter((request) => request.from_user.id !== userId)
        );
        message.success("Friend request declined");
      } else {
        message.error("Failed to decline friend request");
      }
    } catch (error) {
      message.error("Error declining friend request");
    }
  };

  // Load more users
  const loadMoreUsers = () => {
    if (hasMore && !loading) {
      setLoading(true);
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchAllUsers(nextPage);
        return nextPage;
      });
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchAllUsers();
    fetchIncomingFriendRequests();
  }, []);

  return {
    users,
    loading,
    loadingFriendRequests,
    hasMore,
    friendRequests: friendRequestsSent,
    incomingFriendRequests,
    handleAddFriend,
    handleCancelFriend,
    handleAcceptFriendRequest,
    handleDeclineFriendRequest,
    loadMoreUsers,
    searchQuery,
    updateSearchResults,
  };
};

export default PeopleViewModel;