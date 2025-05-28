"use client";
import React, { useEffect } from "react";
import ProfileHeader from "../components/ProfileHeader";
import useColor from "@/hooks/useColor";
import { useAuth } from "@/context/auth/useAuth";
import { UserModel } from "@/api/features/authenticate/model/LoginModel";
import ProfileTabs from "../components/ProfileTabs";
import {
  FriendStatus,
  Privacy,
} from "@/api/baseApiResponseModel/baseApiResponseModel";
import ProfileViewModel from "../viewModel/ProfileViewModel";
import { Skeleton, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const ProfileFeature = () => {
  const { user, localStrings } = useAuth();

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
    fetchMyFriends,
    page,
    hasMore,
    setPosts,
    hasMoreFriends,
    loadMoreFriends,
    setFriends,
    loadingFriends,
    setFriendsModal,
    friendsModal,
    fetchFriendsModal
  } = ProfileViewModel();

  useEffect(() => {
    if (user) {
      fetchUserProfile(user?.id as string);
      // fetchMyFriends(page);
      fetchUserPosts();
    }
  }, []);

  return (
    <div>
      {profileLoading ? (
        <Skeleton active paragraph={{ rows: 16 }} />
      ) : (
        <>
          <ProfileHeader
            total={total}
            user={user as UserModel}
            loading={false}
            friendCount={friendCount}
            fetchUserProfile={fetchUserProfile}
          />
          <ProfileTabs
            posts={posts}
            loading={loading}
            profileLoading={false}
            loadMorePosts={loadMorePosts}
            userInfo={user as UserModel}
            friendCount={friendCount}
            friends={friends}
            resultCode={resultCode}
            fetchUserPosts={fetchUserPosts}
            hasMore={hasMore}
            setPosts={setPosts}
            hasMoreFriends={hasMoreFriends}
            loadMoreFriends={loadMoreFriends}
            fetchFriends={async (page?: number) => { await fetchMyFriends(page); }}
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

export default ProfileFeature;