"use client"
import { UserModel } from '@/api/features/authenticate/model/LoginModel';
import { PostResponseModel } from '@/api/features/post/models/PostResponseModel';
import { defaultPostRepo } from '@/api/features/post/PostRepo';
import { FriendResponseModel } from '@/api/features/profile/model/FriendReponseModel';
import { defaultProfileRepo } from '@/api/features/profile/ProfileRepository';
import { useAuth } from '@/context/auth/useAuth';
import { useState } from 'react'

const ProfileViewModel = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [pageFriend, setPageFriend] = useState(1);
  const [totalFriends, setTotalFriends] = useState(0);
  const [hasMoreFriends, setHasMoreFriends] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;
  const [friends, setFriends] = useState<FriendResponseModel[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [search, setSearch] = useState<string>("");
  const [resultCode, setResultCode] = useState(0);
  const [infoUser, setInfoUser] = useState<UserModel>();
  const getFriendCount = () => friendCount;
  const fetchUserPosts = async (newPage: number = 1) => {
    try {
      setLoading(true);
      const response = await defaultPostRepo.getPosts({
        user_id: user?.id,
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
        const {
          page: currentPage,
          limit: currentLimit,
          total: totalRecords,
        } = response?.paging;

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

  const loadMorePosts = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
      fetchUserPosts(page + 1);
    }
  };

  const fetchMyFriends = async (page: number) => {
    try {
      setLoadingFriends(true);
      const response = await defaultProfileRepo.getListFriends({
        page: page,
        limit: 10,
        user_id: user?.id,
      });
      if (!response?.error) {
        
        if (page === 1) {
          setFriends(response?.data);
        } else {
          setFriends((prevFriends) => [...prevFriends, ...response?.data]);
        }
        const {
          page: currentPage,
          limit: currentLimit,
          total: totalRecords,
        } = response?.paging;

        setTotalFriends(totalRecords);
        setPageFriend(currentPage);
        setFriendCount(totalRecords);
        setHasMoreFriends(currentPage * currentLimit < totalRecords);
      }
      
    return friends;
  }
  catch (error: any) {
    console.error(error);
  }finally {
    setLoadingFriends(false);
  }
}

const loadMoreFriends = () => {
  
  if (!loadingFriends && hasMoreFriends) {
    setPageFriend((prevPage) => prevPage + 1);
    fetchMyFriends(pageFriend + 1);
  }
}

//Privacy setting
const fetchUserProfile = async (id: string) => {
  try {
    setProfileLoading(true);
    const response = await defaultProfileRepo.getProfile(id);
    
    if (!response?.error) {
      setInfoUser(response?.data)
      setResultCode(response?.code);
    } else {
    }
  } catch (error: any) {
    console.error(error);
  } finally {
    setProfileLoading(false);
  }
}

  
  return {
    loading,
    posts,
    hasMore,
    loadMorePosts,
    fetchUserPosts,
    total,
    friendCount,
    search,
    setSearch,
    friends,
    page,
    getFriendCount,
    fetchMyFriends,
    fetchUserProfile,
    resultCode,
    profileLoading,
    setProfileLoading,
    setPosts,
    hasMoreFriends,
    loadMoreFriends,
    infoUser
  };
};

export default ProfileViewModel