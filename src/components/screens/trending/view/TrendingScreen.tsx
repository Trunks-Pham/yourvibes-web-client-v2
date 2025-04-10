"use client";
import React, { useEffect } from "react";
import { Spin, Empty } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "@/components/common/post/views/Post";
import TrendingViewModel from "@/components/screens/trending/viewModel/TrendingViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import { useAuth } from "@/context/auth/useAuth";
import useColor from "@/hooks/useColor";

const TrendingScreen = () => {
  const { brandPrimary } = useColor();
  const { localStrings } = useAuth();
  const {
    trendingPosts,
    loading,
    fetchTrendingPosts,
    loadMoreTrendingPosts,
    hasMore,
    setTrendingPosts,
  } = TrendingViewModel(defaultPostRepo);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const handleDeletePost = (postId: string) => {
    setTrendingPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== postId)
    );
  };

  return (
    <div className="flex flex-col items-center mt-4">
      {loading && trendingPosts.length === 0 ? (
        <div className="flex-auto w-auto flex items-center justify-center">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "600px" }}>
          {trendingPosts.length > 0 ? (
            <InfiniteScroll
              className="flex flex-col items-center"
              dataLength={trendingPosts.length}
              next={loadMoreTrendingPosts}
              hasMore={hasMore}
              loader={
                <Spin
                  indicator={<LoadingOutlined spin />}
                  size="large"
                  style={{ marginTop: 20 }}
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
      )}
    </div>
  );
};

export default TrendingScreen;