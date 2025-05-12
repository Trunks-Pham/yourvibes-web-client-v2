"use client";
import { Privacy } from "@/api/baseApiResponseModel/baseApiResponseModel";
import { UserModel } from "@/api/features/authenticate/model/LoginModel";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";
import { useAuth } from "@/context/auth/useAuth";
import useColor from "@/hooks/useColor";
import { Avatar, Col, Flex, Modal, Row, Skeleton, Spin, Empty } from "antd";
import {
  CreditCardFilled,
  LoadingOutlined,
  MailFilled,
  PhoneFilled,
} from "@ant-design/icons";
import React, { useEffect, useState, useRef } from "react";
import { DateTransfer } from "@/utils/helper/DateTransfer";
import { FaGlobe, FaLock } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
import { useRouter } from "next/navigation";
import ModalObjectProfile from "./ModalObjectProfile";
import PostList from "./PostList";
import { PostResponseModel } from "@/api/features/post/models/PostResponseModel";
import ListFriends from "./ListFriends";
import { CustomStatusCode } from "@/utils/helper/CustomStatus";
import UserProfileViewModel from "@/components/screens/profile/viewModel/UserProfileViewModel";

const AboutTab = ({
  user,
  loading,
  profileLoading,
  friendCount,
  friends: initialFriends,
  resultCode,
  posts,
  loadMorePosts,
  fetchUserPosts,
  hasMore,
  setPosts,
}: {
  user: UserModel;
  loading: boolean;
  profileLoading: boolean;
  friendCount: number;
  friends: FriendResponseModel[];
  resultCode: number;
  posts: PostResponseModel[];
  loadMorePosts: () => void;
  fetchUserPosts: () => void;
  hasMore: boolean;
  setPosts: React.Dispatch<React.SetStateAction<PostResponseModel[]>>;
}) => {
  const router = useRouter();
  const { brandPrimaryTap, backgroundColor, colorOnl, brandPrimary, borderColor } = useColor();
  const { isLoginUser, localStrings } = useAuth();
  const { fetchFriends, page, setPage, totalPage, hasMoreFriends, loadingFriends, friends: viewModelFriends } = UserProfileViewModel(user?.id);
  const [showObject, setShowObject] = useState(false);
  const [showFriend, setShowFriend] = useState(false);
  const [friends, setFriends] = useState<FriendResponseModel[]>(initialFriends);
  const [friendsToShow, setFriendsToShow] = useState(8);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Đồng bộ friends với viewModelFriends
  useEffect(() => {
    setFriends(viewModelFriends);
  }, [viewModelFriends]);

  // Cập nhật số lượng bạn bè hiển thị dựa trên kích thước màn hình
  useEffect(() => {
    const updateFriendsToShow = () => {
      if (window.innerWidth >= 798 && window.innerWidth <= 1024) {
        setFriendsToShow(10);
      } else {
        setFriendsToShow(8);
      }
    };
    updateFriendsToShow();
    window.addEventListener("resize", updateFriendsToShow);
    return () => {
      window.removeEventListener("resize", updateFriendsToShow);
    };
  }, []);

  // Gọi fetchFriends khi mở modal
  useEffect(() => {
    if (showFriend && !friends.length && !loadingFriends && user.id) {
      fetchFriends(1); // Tải lại trang đầu tiên nếu danh sách rỗng
    }
  }, [showFriend, friends, loadingFriends, fetchFriends, user?.id]);

  // Thiết lập IntersectionObserver để tải thêm bạn bè khi cuộn
  useEffect(() => {
    if (!showFriend || !hasMoreFriends || loadingFriends) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(page + 1);
          fetchFriends(page + 1); // Tải trang tiếp theo
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }
    };
  }, [showFriend, hasMoreFriends, loadingFriends, page, fetchFriends, setPage]);

  const renderPrivacyIcon = () => {
    switch (user?.privacy) {
      case Privacy.PUBLIC:
        return <FaGlobe size={16} color={brandPrimaryTap} />;
      case Privacy.FRIEND_ONLY:
        return <IoMdPeople size={20} color={brandPrimaryTap} />;
      case Privacy.PRIVATE:
        return <FaLock name="lock-closed" size={17} color={brandPrimaryTap} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-4 lg:mx-16 xl:mx-32">
      <Row gutter={[16, 16]} align={"top"} justify={"center"}>
        <Col xs={24} xl={8} className="w-full xl:sticky xl:top-20" style={{ position: "sticky" }}>
          {profileLoading ? (
            <Skeleton active />
          ) : (
            <div
              className="w-full mx-auto max-w-[600px] flex flex-col px-5 rounded-md"
              style={{ backgroundColor: backgroundColor, border: `1px solid ${borderColor}` }}
            >
              {/* Detail */}
              <div className="py-2" style={{ color: brandPrimary }}>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-lg">{localStrings.Public.Detail}</span>
                    {isLoginUser(user?.id as string) && (
                      <div>
                        <div className="flex flex-row items-center">
                          <span className="pr-2">{renderPrivacyIcon()}</span>
                          <button onClick={() => setShowObject(true)}>
                            <AiFillEdit size={24} className="pr-2" />
                          </button>
                        </div>
                        <Modal
                          centered
                          title={localStrings.ObjectProfile.ProfilePrivacy}
                          open={showObject}
                          onCancel={() => setShowObject(false)}
                          footer={null}
                        >
                          <ModalObjectProfile closedModalObject={() => setShowObject(false)} />
                        </Modal>
                      </div>
                    )}
                  </div>
                  {resultCode === CustomStatusCode.Success ? (
                    <div>
                      {/* Email */}
                      <div className="flex flex-row mb-2">
                        <MailFilled />
                        <span className="ml-2">
                          {localStrings.Public.Mail}: <span className="font-bold">{user?.email}</span>
                        </span>
                      </div>
                      {/* Phone */}
                      <div className="flex flex-row mb-2">
                        <PhoneFilled />
                        <span className="ml-2">
                          {localStrings.Public.Phone}: <span className="font-bold">{user?.phone_number}</span>
                        </span>
                      </div>
                      {/* Birthday */}
                      <div className="flex flex-row mb-2">
                        <CreditCardFilled />
                        <span className="ml-2">
                          {localStrings.Public.Birthday}: <span className="font-bold">{DateTransfer(user?.birthday)}</span>
                        </span>
                      </div>
                      {/* Created At */}
                      <div className="flex flex-row mb-2">
                        <CreditCardFilled />
                        <span className="ml-2">
                          {localStrings.Public.Active}: <span className="font-bold">{DateTransfer(user?.created_at)}</span>
                        </span>
                      </div>
                    </div>
                  ) : resultCode === CustomStatusCode.UserPrivateAccess ? (
                    <span className="text-center">
                      {`${user?.family_name || ""} ${user?.name || ""} ${localStrings.Public.HideInfo}`}
                    </span>
                  ) : resultCode === CustomStatusCode.UserFriendAccess ? (
                    <span className="text-center">
                      {`${user?.family_name || ""} ${user?.name || ""} ${localStrings.Public.HideInfo} ${localStrings.Public.FriendOnly}`}
                    </span>
                  ) : null}
                </div>
              </div>
              <hr />
              {/* Friends */}
              <div className="py-2 flex-1">
                <div className="flex mb-2">
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-lg" style={{ color: brandPrimary }}>
                      {localStrings.Public.Friend}
                    </span>
                    <span className="text-sm" style={{ color: brandPrimary }}>
                      {friendCount}
                      <span className="ml-1">{localStrings.Public.Friend}</span>
                    </span>
                  </div>
                  <div className="cursor-pointer">
                    <span style={{ color: brandPrimaryTap }} onClick={() => router.push("#")}>
                      {localStrings.Public.FriendFind}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-5 xl:grid-cols-4 gap-2">
                  {friends &&
                    friends.slice(0, friendsToShow).map((friend, index) => (
                      <div
                        key={index}
                        className="mb-2 mx-1 flex flex-col items-center text-center"
                        style={{ color: brandPrimary }}
                        onClick={() => router.push(`/user/${friend?.id}`)}
                      >
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <Avatar
                            src={friend.avatar_url}
                            alt={friend.name}
                            size={50}
                            style={{
                              boxShadow: "0 2px 4px rgba(186, 141, 167, 0.1)",
                            }}
                          />
                          {friend.active_status && (
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
                        <div className="mt-2 truncate w-full" style={{ whiteSpace: "nowrap" }}>
                          {friend?.family_name} {friend?.name}
                        </div>
                      </div>
                    ))}
                </div>
                <div
                  className="flex justify-center cursor-pointer"
                  onClick={() => setShowFriend(true)}
                  style={{ color: brandPrimaryTap }}
                >
                  {localStrings.Public.FriendView}
                </div>
                <Modal
                  bodyStyle={{ maxHeight: "70vh", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
                  title={<span className="text-xl font-bold">{localStrings.ListFriends.ListFriends}</span>}
                  open={showFriend}
                  onCancel={() => setShowFriend(false)}
                  footer={null}
                  centered
                  width={1000}
                >
                  {loadingFriends && !friends.length ? (
                    <div className="flex justify-center py-4">
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    </div>
                  ) : friends.length === 0 ? (
                    <Empty description={localStrings.Public.AllUsers} />
                  ) : (
                    <ListFriends
                      friends={friends}
                      page={page}
                      setPage={setPage}
                      totalPage={totalPage}
                      fetchFriends={fetchFriends}
                      loadingFriends={loadingFriends}
                    />
                  )}
                  {hasMoreFriends && (
                    <div ref={loadMoreRef} className="flex justify-center py-4">
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    </div>
                  )}
                </Modal>
              </div>
            </div>
          )}
        </Col>

        <Col xs={24} xl={16} className="w-full">
          <PostList
            loading={loading}
            posts={posts}
            loadMorePosts={loadMorePosts}
            user={user}
            fetchUserPosts={fetchUserPosts}
            hasMore={hasMore}
            setPosts={setPosts}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AboutTab;