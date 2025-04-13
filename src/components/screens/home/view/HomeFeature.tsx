"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import useColor from "@/hooks/useColor";
import Post from "@/components/common/post/views/Post";
import HomeViewModel from "../viewModel/HomeViewModel";
import { defaultNewFeedRepo } from "@/api/features/newFeed/NewFeedRepo";
import { defaultFriendRepo } from "@/api/features/friends/FriendRepo";
import { useAuth } from "@/context/auth/useAuth";
import { useRouter } from "next/navigation";
import { Avatar, Empty, Modal, Spin } from "antd";
import AddPostScreen from "../../addPost/view/AddPostScreen";
import ProfileViewModel from "../../profile/viewModel/ProfileViewModel";
import { LoadingOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import FriendSuggestions from "@/components/common/Suggestions/friendSuggestions";
import dayjs from "dayjs";

const Homepage = () => {
  const { brandPrimary, backgroundColor, lightGray } = useColor();
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
  const { friends, fetchMyFriends, page } = ProfileViewModel();
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    setNewFeeds((prevNewFeeds) => prevNewFeeds.filter((post) => post.id !== id));
  };

  const formatBirthday = (birthday: string) => {
    if (!birthday) return { formatted: "", age: null };

    let parsedDate: dayjs.Dayjs | null = null;

    if (birthday.includes("T") && birthday.includes("/")) {
      const datePart = birthday.split("/")[1];
      const [month, year] = datePart.split("/").map(Number);
      const day = parseInt(birthday.split("T")[0], 10);
      parsedDate = dayjs(`${year}-${month}-${day}`);
    } else {
      parsedDate = dayjs(birthday, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
    }

    if (!parsedDate.isValid()) {
      console.warn("Invalid birthday:", birthday);
      return { formatted: "Invalid date", age: null };
    }

    const formatted = parsedDate.format("DD/MM/YYYY");
    const currentYear = 2025;
    const age = currentYear - parsedDate.year();

    return { formatted, age };
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
            border: `1px solid `,
            borderRadius: "10px",
            cursor: "pointer",
            width: "100%",
            maxWidth: "600px",
            position: "relative",
          }}
        >
          <Avatar
            src={user?.avatar_url}
            alt="User Avatar"
            size={{ xs: 40, sm: 40, md: 50, lg: 50, xl: 50, xxl: 50 }}
          />
          <div style={{ marginLeft: "10px", flex: 1 }}>
            <p>
              <b>{user?.family_name + " " + user?.name || localStrings.Public.Username}</b>
            </p>
            <p style={{ color: "gray" }}>{localStrings.Public.Today}</p>
          </div>
          <span
            style={{
              position: "absolute",
              right: "10px",
              fontSize: "24px",
              fontWeight: "bold",
              color: brandPrimary || "#1890ff",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
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
          title={localStrings.AddPost.NewPost}
          open={isModalVisible}
          onCancel={handleModalClose}
          width={800}
          footer={null}
        >
          <AddPostScreen onPostSuccess={() => setIsModalVisible(false)} fetchNewFeeds={fetchNewFeeds} />
        </Modal>
      </>
    );
  }, [user, localStrings, isModalVisible, backgroundColor, lightGray, brandPrimary, fetchNewFeeds]);

  const renderFriends = () => {
    return (
      <div
        style={{
          marginInline: "10px",
          position: "fixed",
          width: "300px",
          maxHeight: "600px",
          overflowY: "auto",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <span className="font-bold text-lg text-gray-800">{localStrings.Public.Friend}</span>
        <hr className="border-t-1 border-gray-300 my-3" />

        {/* Phần hiển thị bạn bè có sinh nhật */}
        {loadingBirthday ? (
          <div style={{ textAlign: "center", padding: "12px" }}>
            <Spin indicator={<LoadingOutlined spin />} size="small" />
          </div>
        ) : birthdayFriends.length > 0 ? (
          <div
            style={{
              background: "linear-gradient(135deg, #fff1f5 0%, #e6f0ff 100%)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "16px",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
              animation: "fadeIn 0.5s ease-in-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px", marginRight: "8px" }}></span>
              <span
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  color: brandPrimary || "#1890ff",
                  letterSpacing: "0.5px",
                }}
              >
                {localStrings.Public.Birtday}
              </span>
            </div>
            {birthdayFriends.map((friend) => {
              const { formatted, age } = formatBirthday(friend.birthday);
              return (
                <div
                  key={friend.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    margin: "6px 0",
                    cursor: "pointer",
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  }}
                  onClick={() => router.push(`/user/${friend.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
                  }}
                >
                  <Avatar
                    src={friend.avatar_url}
                    alt={friend.name}
                    size={44}
                    style={{
                      border: `2px solid ${brandPrimary || "#1890ff"}`,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <div style={{ marginLeft: 12, flex: 1 }}>
                    <span
                      style={{
                        fontWeight: "600",
                        fontSize: 15,
                        color: "#1f2937",
                        display: "block",
                      }}
                    >
                      {friend.family_name + " " + friend.name}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#4b5563",
                        fontSize: 13,
                        fontWeight: "500",
                        marginTop: 4,
                      }}
                    >
                      <span
                        role="img"
                        aria-label="birthday"
                        style={{ marginRight: 6, fontSize: 16 }}
                      > 
                      </span>
                      <span>
                        {formatted}
                        {age !== null && ` (${age} ${localStrings.Public.YearsOld })`}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "20px",
                      opacity: 0.7,
                      transition: "opacity 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                  > 
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              fontSize: 13,
              color: "#6b7280",
              padding: "12px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
            }}
          >
            {localStrings.Public.NoBirthdays}
          </div>
        )}

        {/* Danh sách bạn bè thông thường */}
        <hr className="border-t-1 border-gray-300 my-3" />
        {friends.length > 0 ? (
          friends.map((user) => (
            <div key={user.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 0",
                  cursor: "pointer",
                  borderRadius: "8px",
                  transition: "background-color 0.3s ease",
                }}
                onClick={() => router.push(`/user/${user?.id}`)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Avatar src={user.avatar_url} alt={user.name} size={36} />
                <span
                  style={{
                    marginLeft: 12,
                    fontWeight: "600",
                    fontSize: 14,
                    color: "#1f2937",
                  }}
                >
                  {user.family_name + " " + user.name}
                </span>
              </div>
              <hr className="border-t-1 border-gray-200 my-1" />
            </div>
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "#6b7280",
              fontSize: 12,
              padding: "12px",
            }}
          >
            {localStrings.Public.AllUsers}
          </div>
        )}
      </div>
    );
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true);
    setStartY(event.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setStartY(0);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isDragging && scrollContainerRef.current) {
      const deltaY = event.clientY - startY;
      if (deltaY > 100) {
        fetchNewFeeds();
        setStartY(event.clientY);
      }
    }
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
                  loader={<Spin indicator={<LoadingOutlined spin />} size="large" />}
                >
                  {newFeeds.map((item, index) => (
                    <div key={item?.id} style={{ width: "100%", maxWidth: "600px" }}>
                      <Post post={item} onDeleteNewFeed={handleDeleteNewFeed}>
                        {item?.parent_post && <Post post={item?.parent_post} isParentPost />}
                      </Post>
                    </div>
                  ))}
                </InfiniteScroll>
              ) : (
                <div className="w-full h-screen flex justify-center items-center">
                  <Empty
                    description={
                      <span style={{ color: "gray", fontSize: 16 }}>{localStrings.Post.NoPosts}</span>
                    }
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex-initial w-[320px] hidden xl:block">{renderFriends()}</div>
        </>
      )}
    </div>
  );
};

export default Homepage;