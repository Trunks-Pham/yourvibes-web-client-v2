"use client";

import { useState, useEffect, useCallback } from "react";
import { defaultProfileRepo } from "@/api/features/profile/ProfileRepository";
import { defaultSearchRepo } from "@/api/features/search/SearchRepository";
import { UserModel } from "@/api/features/authenticate/model/LoginModel";
import { message } from "antd";
import { FriendModel } from "@/api/features/profile/model/GetListFriendsRequsetModel";

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

  // Callback để đồng bộ users từ SearchScreen
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
        console.error("Failed to fetch users:", response?.message);
        message.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch incoming friend requests
  const fetchIncomingFriendRequests = async () => {
    try {
      setLoadingFriendRequests(true);
      const response = await defaultProfileRepo.getListFriendsRequest({
        limit,
        page: 1,
      });

      if (response?.data?.data) {
        setIncomingFriendRequests(
          response.data.data.map((friend: FriendModel) => ({
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
        console.error("Failed to fetch friend requests:", response?.message);
        message.error("Failed to fetch friend requests");
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      message.error("Error fetching friend requests");
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
      console.error("Error sending friend request:", error);
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
      console.error("Error canceling friend request:", error);
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
      console.error("Error accepting friend request:", error);
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
      console.error("Error declining friend request:", error);
      message.error("Error declining friend request");
    }
  };

  // Load more users
  const loadMoreUsers = () => {
    if (hasMore && !loading) {
      setLoading(true);
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchAllUsers(nextPage); // Gọi fetchAllUsers với trang tiếp theo
        return nextPage;
      });
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchAllUsers(); // Tải tất cả người dùng mặc định
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