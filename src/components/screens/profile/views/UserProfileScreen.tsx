"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Drawer, Modal, Skeleton, Space, Typography } from 'antd';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import UserProfileViewModel from '../viewModel/UserProfileViewModel';
import { UserModel } from '@/api/features/authenticate/model/LoginModel';


const UserProfileScreen = ({ id }: { id: string }) => {
  const {
    loading,
    profileLoading,
    posts,
    fetchUserPosts,
    loadMorePosts,
    total,
    friends,
    friendCount,
    resultCode,
    fetchUserProfile,
    fetchFriends,
    page,
    userInfo,
    hasMore,
    hasMoreFriends,
    loadMoreFriends,
    setPosts,
    setFriends,
    loadingFriends,
    setFriendsModal,
    friendsModal,
    fetchFriendsModal
  } = UserProfileViewModel(id);


useEffect(() => {
    if (id) {
      fetchUserProfile(id);
      // fetchFriends(page);
      fetchUserPosts();
    }
  }
, [id]);

  return (
    <div>
      {profileLoading ? (
        <Skeleton
          active
          paragraph={{ rows: 16 }}
        />
      ) : (
      <>
        <ProfileHeader
          total={total}
          user={userInfo as UserModel}
          loading={profileLoading}
          friendCount={friendCount}
          fetchUserProfile={fetchUserProfile}
        />
        <ProfileTabs
          posts={posts}
          loading={loading}
          profileLoading={profileLoading}
          loadMorePosts={loadMorePosts}
          userInfo={userInfo as UserModel}
          friendCount={friendCount}
          friends={friends}
          resultCode={resultCode}
          fetchUserPosts={fetchUserPosts}
          hasMore={hasMore}
          setPosts={setPosts}
          hasMoreFriends={hasMoreFriends}
          loadMoreFriends={loadMoreFriends}
          fetchFriends={async (page?: number) => { await fetchFriends(page); }}
          setFriends={setFriends}
          loadingFriends={loadingFriends}
          friendsModal={friendsModal}
          setFriendsModal={setFriendsModal}
          fetchFriendsModal={async (page?: number) => { await fetchFriendsModal(page); }}
        />
      </>
      )}
    </div>
  );
};

export default UserProfileScreen;