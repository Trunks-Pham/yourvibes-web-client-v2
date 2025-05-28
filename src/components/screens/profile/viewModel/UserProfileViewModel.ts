"use client";
import { useEffect, useState } from "react";
import { PostResponseModel } from "@/api/features/post/models/PostResponseModel";
import { UserModel } from "@/api/features/authenticate/model/LoginModel";
import { FriendStatus } from "@/api/baseApiResponseModel/baseApiResponseModel";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import { defaultProfileRepo } from "@/api/features/profile/ProfileRepository";

const UserProfileViewModel = (userId?: string) => {
  const [posts, setPosts] = useState<PostResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userInfo, setUserInfo] = useState<UserModel | null>(null);
  const [sendRequestLoading, setSendRequestLoading] = useState(false);
  const [newFriendStatus, setNewFriendStatus] = useState<FriendStatus | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [friends, setFriends] = useState<FriendResponseModel[]>([]);
   const [friendsModal, setFriendsModal] = useState<FriendResponseModel[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [resultCode, setResultCode] = useState(0);
  const [totalPageFriends, setTotalPageFriends] = useState(0);
  const [hasMoreFriends, setHasMoreFriends] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const limit = 10;

  const fetchUserPosts = async (newPage: number = 1) => {
    if (!userId && !userInfo?.id) return;
    try {
      setLoading(true);
      const response = await defaultPostRepo.getPosts({
        user_id: userId || userInfo?.id,
        sort_by: "created_at",
        isDescending: true,
        page: newPage,
        limit: limit,
      });

      if (!response?.error) {
        if (newPage === 1) {
          setPosts(response?.data);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...response?.data]);
        }
        const { page: currentPage, limit: currentLimit, total: totalRecords } = response?.paging;
        setTotal(totalRecords);
        setPage(currentPage);
        setHasMore(currentPage * currentLimit < totalRecords);
      } else {
        console.error(response?.message);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (id: string) => {
    try {
      setProfileLoading(true);
      const response = await defaultProfileRepo.getProfile(id);

      if (!response?.error) {
        setUserInfo(response?.data);
        setResultCode(response?.code);
        setNewFriendStatus(response?.data?.friend_status || FriendStatus.NotFriend);
      } else {
        console.error(response?.message);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadMorePosts = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
      fetchUserPosts(page + 1);
    }
  };

  const sendFriendRequest = async (id: string) => {
    try {
      setSendRequestLoading(true);
      const response = await defaultProfileRepo.sendFriendRequest(id);
      if (!response?.error) {
        setNewFriendStatus(FriendStatus.SendFriendRequest);
      } else {
        console.error(response?.message);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setSendRequestLoading(false);
    }
  };

  const cancelFriendRequest = async (id: string) => {
    try {
      setSendRequestLoading(true);
      const response = await defaultProfileRepo.cancelFriendRequest(id);
      if (!response?.error) {
        setNewFriendStatus(FriendStatus.NotFriend);
      } else {
        console.error(response?.message);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setSendRequestLoading(false);
    }
  };

  const refuseFriendRequest = async (id: string) => {
    try {
      setSendRequestLoading(true);
      const response = await defaultProfileRepo.refuseFriendRequest(id);
      if (!response?.error) {
        setNewFriendStatus(FriendStatus.NotFriend);
      } else {
        console.error(response?.message);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setSendRequestLoading(false);
    }
  };

  const acceptFriendRequest = async (id: string) => {
    try {
      setSendRequestLoading(true);
      const response = await defaultProfileRepo.acceptFriendRequest(id);
      if (!response?.error) {
        setNewFriendStatus(FriendStatus.IsFriend);
      } else {
        console.error(response?.message);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setSendRequestLoading(false);
    }
  };

  const unFriend = async (id: string) => {
    try {
      setSendRequestLoading(true);
      const response = await defaultProfileRepo.unfriend(id);
      if (!response?.error) {
        setNewFriendStatus(FriendStatus.NotFriend);
      } else {
        console.error(response?.message);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setSendRequestLoading(false);
    }
  };

  const fetchFriends = async (page: number = 1): Promise<FriendResponseModel[] | undefined> => {
    if (!userId && !userInfo?.id) {
      console.error("No user ID provided for fetching friends");
      return undefined;
    }
    try {
      setLoadingFriends(true);
      const response = await defaultProfileRepo.getListFriends({
        page: page,
        limit: 10,
        user_id: userId || userInfo?.id,
      });

      if (!response?.error && response?.data) {
        const newFriends = response.data;
        if (page === 1) {
          setFriends(newFriends);
        } else {
          setFriends((prevFriends) => [...prevFriends, ...newFriends]);
        }
        const { page: currentPage, limit: currentLimit, total: totalRecords } = response.paging;
        setFriendCount(totalRecords);
        setHasMoreFriends(currentPage * currentLimit < totalRecords);
        const totalPage = Math.ceil(totalRecords / currentLimit);
        setTotalPageFriends(totalPage);
        setPage(currentPage);
        return newFriends;
      } else {
        console.error("response.data is null or error occurred");
        setFriends([]);
        return undefined;
      }
    } catch (error: any) {
      console.error(error);
      return undefined;
    } finally {
      setLoadingFriends(false);
    }
  };

    const fetchFriendsModal = async (page: number = 1): Promise<FriendResponseModel[] | undefined> => {
    if (!userId && !userInfo?.id) {
      console.error("No user ID provided for fetching friends");
      return undefined;
    }
    try {
      setLoadingFriends(true);
      const response = await defaultProfileRepo.getListFriends({
        page: page,
        limit: 10,
        user_id: userId || userInfo?.id,
      });

      if (!response?.error && response?.data) {
        const newFriends = response.data;
        if (page === 1) {
          setFriendsModal(newFriends);
        } else {
          setFriendsModal((prevFriends) => [...prevFriends, ...newFriends]);
        }
        const { page: currentPage, limit: currentLimit, total: totalRecords } = response.paging;
        setFriendCount(totalRecords);
        setHasMoreFriends(currentPage * currentLimit < totalRecords);
        const totalPage = Math.ceil(totalRecords / currentLimit);
        setTotalPageFriends(totalPage);
        setPage(currentPage);
        return newFriends;
      } else {
        console.error("response.data is null or error occurred");
        setFriendsModal([]);
        return undefined;
      }
    } catch (error: any) {
      console.error(error);
      return undefined;
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadMoreFriends = () => {
    console.log("loadMoreFriends called", loadingFriends, hasMoreFriends);
    
    if (!loadingFriends && hasMoreFriends) {
      setPage((prevPage) => prevPage + 1);
      fetchFriendsModal(page + 1);
    }
  };

  // useEffect(() => {
  //   if (userId) {
  //     fetchUserProfile(userId);
  //   }
  // }, [userId]);

  // useEffect(() => {
  //   if (userId || userInfo?.id) {
  //     fetchUserPosts();
  //     fetchFriends(1);
  //   }
  // }, [userId, userInfo]);

  return {
    loading,
    profileLoading,
    posts,
    hasMore,
    loadMorePosts,
    fetchUserPosts,
    total,
    fetchUserProfile,
    userInfo,
    sendFriendRequest,
    sendRequestLoading,
    refuseFriendRequest,
    cancelFriendRequest,
    newFriendStatus,
    setNewFriendStatus,
    acceptFriendRequest,
    unFriend,
    friendCount,
    search,
    setSearch,
    friends,
    page,
    setPage,
    fetchFriends,
    resultCode,
    setResultCode,
    totalPage: totalPageFriends,
    hasMoreFriends,
    loadingFriends,
    setPosts,
    setFriends,
    loadMoreFriends,
    friendsModal,
    setFriendsModal,
    fetchFriendsModal,
  };
};

export default UserProfileViewModel;