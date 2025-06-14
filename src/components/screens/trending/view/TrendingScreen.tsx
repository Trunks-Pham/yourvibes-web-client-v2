"use client";

import React, { useEffect, useRef, useState } from "react";
import { Spin, Empty, Avatar, Skeleton } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "@/components/common/post/views/Post";
import TrendingViewModel from "@/components/screens/trending/viewModel/TrendingViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import { defaultFriendRepo } from "@/api/features/friends/FriendRepo";
import { useAuth } from "@/context/auth/useAuth";
import useColor from "@/hooks/useColor";
import ProfileViewModel from "@/components/screens/profile/viewModel/ProfileViewModel";
import { useRouter } from "next/navigation";
import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { DateTransfer } from "@/utils/helper/DateTransfer";

const TrendingScreen = () => {
  const { brandPrimary, borderBirth, colorOnl, backgroundColor, brandPrimaryTap } = useColor();
  const { localStrings, user } = useAuth();
  const router = useRouter();
  const {
    trendingPosts,
    loading,
    fetchTrendingPosts,
    loadMoreTrendingPosts,
    hasMore,
    setTrendingPosts,
    birthdayFriends,
    loadingBirthday,
    fetchBirthdayFriends,
  } = TrendingViewModel(defaultPostRepo, defaultFriendRepo);
  const { friends, fetchMyFriends, page } = ProfileViewModel();
  // Ref lưu các DOM node của từng post
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (user) {
      fetchTrendingPosts(page);
      fetchMyFriends(page);
      fetchBirthdayFriends();
    }
  }, []);

  const handleDeletePost = (postId: string) => {
    setTrendingPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== postId)
    );
  };

  const renderFriends = () => {
    return (
      <div
        style={{
          marginInline: "10px",
          position: "fixed",
          width: "300px",
          maxHeight: "100vh",
          overflowY: "auto",
          padding: "16px",
          scrollbarWidth: "none",
        }}
      >
        <span
          style={{
            fontWeight: "750",
            fontSize: 16,
            color: brandPrimary || "#1890ff",
            letterSpacing: "0.5px",
          }}
        >
          {localStrings.Public.Birtday}
        </span>
        <div
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          {/* Phần hiển thị bạn bè có sinh nhật */}
          {loadingBirthday ? (
            <div style={{ textAlign: "center", padding: "12px" }}>
              <Spin indicator={<LoadingOutlined spin />} size="small" />
            </div>
          ) : birthdayFriends.length > 0 ? (
            <div>
              {birthdayFriends?.map((friend) => {
                return (
                  <div
                    key={friend.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      margin: "6px 0 10px 0",
                      cursor: "pointer",
                      borderRadius: "10px",
                      backgroundColor: backgroundColor,
                      transition: "all 0.3s ease",
                      animation: "fadeIn 0.5s ease-in-out",
                      boxShadow:
                        "0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                    onClick={() => router.push(`/user/${friend.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 12px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.06)";
                    }}
                  >
                    <Avatar
                      src={friend.avatar_url}
                      alt={friend.name}
                      size={44}
                      style={{
                        border: `3px solid ${borderBirth || "#FF6699"}`,
                        boxShadow: "0 2px 4px rgba(186, 141, 167, 0.1)",
                      }}
                    />
                    <div style={{ marginLeft: 12, flex: 1 }}>
                      <span
                        style={{
                          fontWeight: "600",
                          fontSize: 15,
                          // color: "#1f2937",
                          color: brandPrimary,
                          display: "block",
                        }}
                      >
                        {friend.family_name + " " + friend.name}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          // color: "#4b5563",
                          color: brandPrimaryTap,
                          fontSize: 13,
                          fontWeight: "500",
                          marginTop: 4,
                        }}
                      >
                        <span
                          role="img"
                          aria-label="birthday"
                          style={{ marginRight: 6, fontSize: 16 }}
                        ></span>
                        <span>
                          {localStrings.Public.Birthday}{" "}
                          {dayjs(friend.birthday).format("DD/MM")}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "20px",
                        opacity: 0.7,
                        transition: "opacity 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "0.7")
                      }
                    ></span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                fontSize: 13,
                // color: "#6b7280",
                padding: "12px",
                textAlign: "center",
                backgroundColor: backgroundColor,
                borderRadius: "8px",
              }}
            >
              {localStrings.Public.NoBirthdays}
            </div>
          )}
        </div>
        <span
          style={{
            fontWeight: "700",
            fontSize: 16,
            color: brandPrimary || "#1890ff",
            letterSpacing: "0.5px",
          }}
        >
          {localStrings.Public.Friend}
        </span>
        <div
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        >
          {friends && friends.length > 0 ? (
                  friends?.map((user) => (
                <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  margin: "6px 0 10px 0",
                  cursor: "pointer",
                  borderRadius: "10px",
                  backgroundColor: backgroundColor,
                  transition: "all 0.3s ease",
                  animation: "fadeIn 0.5s ease-in-out",
                  boxShadow:
                    "0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.04)",
                    color: brandPrimary,
                }}
                  onClick={() => router.push(`/user/${user?.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 12px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 0, 0, 0.06)";
                  }}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Avatar
                      src={user.avatar_url}
                      alt={user.name}
                      size={40}
                      style={{
                        boxShadow: "0 2px 4px rgba(186, 141, 167, 0.1)",
                      }}
                    />
                    {user.active_status && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 12,
                          height: 12,
                          backgroundColor: colorOnl || "#00CED1",
                          border: "2px solid white", 
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>

                  <span
                    style={{
                      marginLeft: 12,
                      fontWeight: "600",
                      fontSize: 14,
                      // color: "#1f2937",
                    }}
                  >
                    {user.family_name + " " + user.name}
                  </span>
                </div>
            ))
              
          ) : (
            <div
              style={{
                textAlign: "center",
                // color: "#6b7280",
                fontSize: 12,
                padding: "12px",
              }}
            >
              {localStrings.Public.AllUsers}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Thêm keyframes cho animation
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);


  return (
    <div className="lg:flex mt-4">
          <div className="flex-auto w-auto flex flex-col items-center justify-center">
            <div style={{ width: "100%", maxWidth: "600px" }}>
              {trendingPosts.length > 0 ? (
                <InfiniteScroll
                  dataLength={trendingPosts.length}
                  next={loadMoreTrendingPosts}
                  hasMore={hasMore}
                  loader={<Skeleton avatar paragraph={{ rows: 4 }} />}
                >
                  {trendingPosts.map((post) => (
                    <div
                      key={post.id}
                      data-postid={post.id}
                      ref={(el) => {
                        if (post.id !== undefined) {
                          postRefs.current[post.id] = el;
                        }
                      }}>
                        <Post
                          key={post.id}
                          post={post}
                          onDeletePost={handleDeletePost}
                        >
                            {post?.parent_post && (
                    <Post post={post?.parent_post} isParentPost />
                  )}
                        </Post>
                      </div>
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
          <div className="flex-initial w-[320px] hidden xl:block">
            {renderFriends()}
          </div>
    </div>
  );
};

export default TrendingScreen;
