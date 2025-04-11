"use client";

import React, { useEffect } from "react";
import { Spin, Empty, Avatar } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "@/components/common/post/views/Post";
import TrendingViewModel from "@/components/screens/trending/viewModel/TrendingViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import { useAuth } from "@/context/auth/useAuth";
import useColor from "@/hooks/useColor";
import ProfileViewModel from "@/components/screens/profile/viewModel/ProfileViewModel"; // Import ProfileViewModel
import { useRouter } from "next/navigation"; // Import useRouter for navigation

const TrendingScreen = () => {
  const { brandPrimary } = useColor();
  const { localStrings, user } = useAuth(); // Get user from useAuth
  const router = useRouter(); // For navigating to user profiles
  const {
    trendingPosts,
    loading,
    fetchTrendingPosts,
    loadMoreTrendingPosts,
    hasMore,
    setTrendingPosts,
  } = TrendingViewModel(defaultPostRepo);

  // Use ProfileViewModel to fetch friends
  const { friends, fetchMyFriends, page } = ProfileViewModel();

  useEffect(() => {
    fetchTrendingPosts(); // Fetch trending posts
    if (user) {
      fetchMyFriends(page); // Fetch friends when user is available
    }
  }, []);

  const handleDeletePost = (postId: string) => {
    setTrendingPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== postId)
    );
  };

  // Render the friends list (same as in Homepage)
  const renderFriends = () => {
    return (
      <div
        style={{
          marginInline: "10px",
          position: "fixed",
          width: "300px",
          maxHeight: "600px",
          overflowY: "auto",
          backgroundColor: "rgb(244, 244, 244)",
          borderRadius: "8px",
        }}
      >
        <span className="font-bold text-lg">{localStrings.Public.Friend}</span>
        <hr className="border-t-1 border-gray-400" />
        {friends.map((user) => (
          <div key={user.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 10,
                borderBottom: "1px solid #f0f0f0",
                cursor: "pointer",
              }}
              onClick={() => router.push(`/user/${user?.id}`)} // Navigate to user profile
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar src={user.avatar_url} alt={user.name} size={40} />
                <span style={{ marginLeft: 10, fontWeight: "bold", fontSize: 16 }}>
                  {user.family_name + " " + user.name}
                </span>
              </div>
            </div>
            <hr className="border-t-1 border-gray-300" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="lg:flex mt-4">
      {/* Main Content */}
      {loading && trendingPosts.length === 0 ? (
        <div className="flex justify-center items-center h-screen bg-white">
          <Spin
            size="large"
            tip="Loading"
            style={{ color: "#4B5563" }}
          />
        </div>
      ) : (
        <>
          <div className="flex-auto w-auto flex flex-col items-center justify-center">
            <div style={{ width: "100%", maxWidth: "600px" }}>
              {trendingPosts.length > 0 ? (
                <InfiniteScroll
                  className="flex flex-col items-center"
                  dataLength={trendingPosts.length}
                  next={loadMoreTrendingPosts}
                  hasMore={hasMore}
                  loader={
                    <Spin
                      size="large"
                      tip="Loading"
                      style={{ marginTop: 20, color: "#4B5563" }}
                    />
                  }
                >
                  {trendingPosts.map((post) => (
                    <Post
                      key={post.id}
                      post={post}
                      onDeletePost={handleDeletePost}
                    />
                  ))}
                </InfiniteScroll>
              ) : (
                <div className="w-full h-screen flex justify-center items-center">
                  <Empty
                    description={
                      <span style={{ color: "gray", fontSize: 16 }}>
                        {localStrings.Post.NoTrendingPosts}
                      </span>
                    }
                  />
                </div>
              )}
            </div>
          </div>
          {/* Friends List Sidebar */}
          <div className="flex-initial w-[320px] hidden xl:block">
            {renderFriends()}
          </div>
        </>
      )}
    </div>
  );
};

export default TrendingScreen;