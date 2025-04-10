import { useState, useEffect } from "react";
import { defaultSearchRepo } from "@/api/features/search/SearchRepository";
import { UserModel } from "@/api/features/authenticate/model/LoginModel";

const PeopleViewModel = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const limit = 20;

  const fetchAllUsers = async (newPage: number = 1) => {
    try {
      setLoading(true);
      const response = await defaultSearchRepo.search({
        limit: limit,
        page: newPage,
      });

      if (response?.data) {
        if (newPage === 1) {
          setUsers(response.data);
        } else {
          setUsers((prevUsers) => [...prevUsers, ...response.data]);
        }

        const { page: currentPage, limit: currentLimit, total } = response.paging;
        setPage(currentPage);
        setHasMore(currentPage * currentLimit < total);
      } else {
        console.error("Failed to fetch users:", response?.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = (userId: string) => {
    setFriendRequests((prev) => new Set(prev).add(userId));
  };

  const handleCancelFriend = (userId: string) => {
    setFriendRequests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const loadMoreUsers = () => {
    if (hasMore && !loading) {
      fetchAllUsers(page + 1);
    }
  };

  return {
    users,
    loading,
    page,
    hasMore,
    friendRequests,
    fetchAllUsers,
    handleAddFriend,
    handleCancelFriend,
    loadMoreUsers,
  };
};

export default PeopleViewModel;