"use client"
import React, { useEffect, useState } from 'react';
import AboutTab from './AboutTab';
import { PostResponseModel } from '@/api/features/post/models/PostResponseModel';
import { UserModel } from '@/api/features/authenticate/model/LoginModel';
import { FriendResponseModel } from '@/api/features/profile/model/FriendReponseModel';
import { useSearchParams } from 'next/navigation';

const ProfileTabs = ({
  posts,
  hasMore,
  profileLoading,
  loadMorePosts,
  userInfo,
  friendCount,
  friends,
  resultCode,
  fetchUserPosts,
  loading,
  setPosts,
}: {
  posts: PostResponseModel[],
  hasMore: boolean,
  profileLoading: boolean,
  loadMorePosts: () => void,
  userInfo: UserModel,
  friendCount: number,
  friends: FriendResponseModel[],
  resultCode: number,
  fetchUserPosts: () => void,
  loading: boolean,
  setPosts: React.Dispatch<React.SetStateAction<PostResponseModel[]>>,
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
      user={userInfo}
      loading={loading}
      profileLoading={profileLoading}
      friendCount={friendCount}
      friends={friends}
      resultCode={resultCode}
      posts={posts}
      loadMorePosts={loadMorePosts}
      fetchUserPosts={fetchUserPosts}
      hasMore={hasMore}
      setPosts={setPosts}
    />
  );
};

export default ProfileTabs;