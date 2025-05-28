"use client"
import React, { useEffect, useState } from 'react';
import AboutTab from './AboutTab';
import { PostResponseModel } from '@/api/features/post/models/PostResponseModel';
import { UserModel } from '@/api/features/authenticate/model/LoginModel';
import { FriendResponseModel } from '@/api/features/profile/model/FriendReponseModel';
import { useSearchParams } from 'next/navigation';

const ProfileTabs = ({
  posts,
  loading,
  profileLoading,
  loadMorePosts,
  userInfo,
  friendCount,
  friends,
  resultCode,
  fetchUserPosts,
  hasMore,
  setPosts,
  hasMoreFriends,
  loadMoreFriends,
  fetchFriends,
  setFriends,
  loadingFriends,
  friendsModal,
  setFriendsModal,
  fetchFriendsModal
}: {
  posts: PostResponseModel[];
  loading: boolean;
  profileLoading: boolean;
  loadMorePosts: () => void;
  userInfo: UserModel;
  friendCount: number;
  friends: FriendResponseModel[];
  resultCode: number;
  fetchUserPosts: (newPage?: number) => Promise<void>;
  hasMore: boolean;
  setPosts: React.Dispatch<React.SetStateAction<PostResponseModel[]>>;
  hasMoreFriends: boolean;
  loadMoreFriends: () => void;
  fetchFriends: (page?: number) => Promise<void>;
  setFriends: React.Dispatch<React.SetStateAction<FriendResponseModel[]>>;
  loadingFriends: boolean;
  friendsModal: FriendResponseModel[];
  setFriendsModal: React.Dispatch<React.SetStateAction<FriendResponseModel[]>>;
  fetchFriendsModal: (page?: number) => Promise<void>;
}) => {
  const searchParams = useSearchParams();  
  const tab = searchParams.get('tab');  

  const [activeKey, setActiveKey] = useState<string>('info');  
 
  useEffect(() => {
    if (tab) {
      setActiveKey(tab);  
    }
  }, [tab]);

  return (
    <AboutTab
      posts={posts}
      loading={loading}
      profileLoading={profileLoading}
      loadMorePosts={loadMorePosts}
      user={userInfo}
      friendCount={friendCount}
      friends={friends}
      resultCode={resultCode}
      fetchUserPosts={fetchUserPosts}
      hasMore={hasMore}
      setPosts={setPosts}
      hasMoreFriends={hasMoreFriends}
      loadMoreFriends={loadMoreFriends}
      fetchFriends={fetchFriends}
      setFriends={setFriends}
      loadingFriends={loadingFriends}
      friendsModal={friendsModal}
      setFriendsModal={setFriendsModal}
      fetchFriendsModal={fetchFriendsModal}
    />
  );
};

export default ProfileTabs;