"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import useColor from "@/hooks/useColor";
import Post from "@/components/common/post/views/Post";
import HomeViewModel from "../viewModel/HomeViewModel";
import { defaultNewFeedRepo } from "@/api/features/newFeed/NewFeedRepo";
import { defaultFriendRepo } from "@/api/features/friends/FriendRepo";
import { useAuth } from "@/context/auth/useAuth";
import { useRouter } from "next/navigation";
import { Avatar, Empty, Modal, Skeleton, Spin, ConfigProvider } from "antd";
import AddPostScreen from "../../addPost/view/AddPostScreen";
import ProfileViewModel from "../../profile/viewModel/ProfileViewModel";
import { LoadingOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import FriendSuggestions from "@/components/common/Suggestions/friendSuggestions";
import dayjs from "dayjs";
import EditPostViewModel from "@/components/features/editpost/viewModel/EditPostViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import { PostResponseModel } from "@/api/features/post/models/PostResponseModel";

const Homepage = () => {
  const { brandPrimary, backgroundColor, lightGray, borderBirth, colorOnl, brandPrimaryTap, borderColor } = useColor();
  const {
    loading,
    newFeeds,
    setNewFeeds,
    fetchNewFeeds,
    loadMoreNewFeeds,
    deleteNewFeed,
    hasMore,
    birthdayFriends,
    loadingBirthday,
    fetchBirthdayFriends,
  } = HomeViewModel(defaultNewFeedRepo, defaultFriendRepo);
  const { user, localStrings } = useAuth();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { friends, fetchMyFriends, page, loadMoreFriends, hasMoreFriends } = ProfileViewModel();
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { deletePost } = EditPostViewModel(defaultPostRepo, user?.id || "", "");
  // State lưu danh sách id các post đang visible
  const [visiblePosts, setVisiblePosts] = useState<string[]>([]);
  // Ref lưu các DOM node của từng post
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (user) {
      fetchMyFriends(page);
      fetchNewFeeds();
      fetchBirthdayFriends();
    }
  }, []);

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleDeleteNewFeed = async (id: string) => {
    await deleteNewFeed(id);
    setNewFeeds((prevNewFeeds) =>
      prevNewFeeds.filter((post) => post.id !== id)
    );
  };

  const renderAddPost = useCallback(() => {
    return (
      <>
        <div
          onClick={() => setIsModalVisible(true)}
          style={{
            padding: "10px",
            display: "flex",
            alignItems: "center",
            backgroundColor: backgroundColor,
            boxShadow:
              "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
            borderRadius: "10px",
            cursor: "pointer",
            width: "100%",
            maxWidth: "600px",
            position: "relative",
            border: `1px solid ${borderColor}`,
          }}
        >
          <Avatar
            src={user?.avatar_url}
            alt="User Avatar"
            size={{ xs: 40, sm: 40, md: 50, lg: 50, xl: 50, xxl: 50 }}
          />
          <div style={{ marginLeft: "10px", flex: 1 }}>
            <b style={{ color: brandPrimary }}>
              {user?.family_name + " " + user?.name ||
                localStrings.Public.Username}
            </b>
            <p style={{ color: "gray" }}>{localStrings.Public.Today}</p>
          </div>
          <span
            style={{
              position: "absolute",
              right: "10px",
              fontSize: "24px",
              fontWeight: "bold",
              color: brandPrimary || "#1890ff",
              backgroundColor: backgroundColor,
              padding: "5px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            +
          </span>
        </div>
        <Modal
          centered
          title={<span style={{ color: brandPrimary }}>{localStrings.AddPost.NewPost}</span>}
          open={isModalVisible}
          onCancel={handleModalClose}
          width={800}
          footer={null}
        >
          <AddPostScreen
            onPostSuccess={() => setIsModalVisible(false)}
            fetchNewFeeds={fetchNewFeeds}
          />
        </Modal>
      </>
    );
  }, [
    user,
    localStrings,
    isModalVisible,
    backgroundColor,
    lightGray,
    brandPrimary,
    fetchNewFeeds,
  ]);

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
          {localStrings.Public.Birthday}
        </span>
        <div
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
            maxHeight: "calc(100vh - 200px)",
          }}
        >
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
                      border: `1px solid ${borderColor}`,
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
                  alignItems: "center warn",
                  padding: "8px 12px",
                  margin: "6px 0 10px 0",
                  cursor: "pointer",
                  borderRadius: "10px",
                  backgroundColor: backgroundColor,
                  border: `1px solid ${borderColor}`,
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

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    setIsDragging(true);
    setStartY(event.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setStartY(0);
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (isDragging && scrollContainerRef.current) {
      const deltaY = event.clientY - startY;
      if (deltaY > 100) {
        fetchNewFeeds();
        setStartY(event.clientY);
      }
    }
  };

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

    // Intersection Observer để theo dõi post nào đang visible
  useEffect(() => {
    if (!newFeeds.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Lọc các post đang intersect với viewport (visible)
        const currentlyVisible: string[] = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute("data-postid");
            if (postId) currentlyVisible.push(postId);
          }
        });
        setVisiblePosts(currentlyVisible);
      },
      {
        root: null, // viewport
        threshold: 0.5, // khi 50% phần tử hiển thị
      }
    );

    // Quan sát tất cả các phần tử post
    Object.values(postRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    // Cleanup khi unmount hoặc posts thay đổi
    return () => {
      observer.disconnect();
    };
  }, [newFeeds]);
  

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: backgroundColor,
            headerBg: backgroundColor,
            titleColor: brandPrimary,
            colorText: brandPrimary,
            colorIcon: brandPrimaryTap,
          },
        },
      }}
    >
      <div
        className="lg:flex mt-4"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        ref={scrollContainerRef}
      >
        {loading ? (
          <div className="flex-auto w-auto flex items-center justify-center">
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          </div>
        ) : (
          <>
            <div className="flex-auto w-auto flex flex-col items-center justify-center">
              {renderAddPost()}
              <div style={{ width: "100%", maxWidth: "600px" }}>
                <FriendSuggestions postIndex={0} />
              </div>
              <div style={{ width: "100%" }}>
                {newFeeds?.length > 0 ? (
                  <InfiniteScroll
                    className="flex flex-col items-center"
                    dataLength={newFeeds.length}
                    next={loadMoreNewFeeds}
                    hasMore={hasMore}
                    loader={
                      <Spin indicator={<LoadingOutlined spin />} size="large" />
                    }
                  >
                    {newFeeds.map((item, index) => (
                      <div
                        key={item?.id}
                        data-postid={item?.id}
                           ref={(el) => {
                  if (item.id !== undefined) {
                    postRefs.current[item.id] = el;
                  }
                }}
                        style={{ width: "100%", maxWidth: "600px" }}
                      >
                        <Post
                          post={item}
                          onDeleteNewFeed={handleDeleteNewFeed}
                          onDeletePost={deletePost}
                          isVisiblePost={visiblePosts.includes(item.id || "")}
                        >
                          {item?.parent_post && (
                            <Post post={item?.parent_post} isParentPost isVisiblePost={visiblePosts.includes(item?.parent_post.id || "")} />
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
                          {localStrings.Post.NoPosts}
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
          </>
        )}
      </div>
    </ConfigProvider>
  );
};

export default Homepage; 