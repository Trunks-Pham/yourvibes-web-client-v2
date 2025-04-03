"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Avatar, Button, Card, Dropdown, Menu, Modal, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import { UsergroupAddOutlined, MoreOutlined } from "@ant-design/icons";
import { defaultNewFeedRepo } from "@/api/features/newFeed/NewFeedRepo";
import { SuggestionUserModel, NewFeedRequestModel } from "@/api/features/newFeed/Model/NewFeedModel";
import { defaultProfileRepo } from "@/api/features/profile/ProfileRepository";
import { useAuth } from "@/context/auth/useAuth";
import { FriendStatus } from "@/api/baseApiResponseModel/baseApiResponseModel"; // Import FriendStatus
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

interface FriendSuggestionsProps {
  postIndex: number;
}

interface FriendSuggestionWithStatus extends SuggestionUserModel {
  friendStatus: FriendStatus;
  hidden?: boolean;
}

const FriendSuggestions: React.FC<FriendSuggestionsProps> = ({ postIndex }) => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWhyModalVisible, setIsWhyModalVisible] = useState(false);
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestionWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [friendRequestLoading, setFriendRequestLoading] = useState<Record<string, boolean>>({});

  const { localStrings } = useAuth();

  const showModal = () => setIsModalVisible(true);
  const handleOk = () => setIsModalVisible(false);
  const handleCancel = () => setIsModalVisible(false);
  const handleWhyModalOk = () => setIsWhyModalVisible(false);
  const handleWhyModalCancel = () => setIsWhyModalVisible(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const requestData: NewFeedRequestModel = { limit: 10, page: 1 };
      const response = await defaultNewFeedRepo.getSuggestion(requestData);
      if (response.code === 20001) {
        const suggestionsWithStatus: FriendSuggestionWithStatus[] = response.data.map(
          (suggestion: SuggestionUserModel) => ({
            ...suggestion,
            friendStatus: suggestion.friend_status || FriendStatus.NotFriend,
            hidden: false,
          })
        );
        setFriendSuggestions(suggestionsWithStatus);
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      message.error(error?.error?.message_detail || error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const sendFriendRequest = async (userId: string) => {
    setFriendRequestLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await defaultProfileRepo.sendFriendRequest(userId);
      if (response.code === 20001) {
        message.success(`${localStrings.Profile.Friend.SendRequestSuccess}`);
        setFriendSuggestions((prev) =>
          prev.map((suggestion) =>
            suggestion.id === userId
              ? { ...suggestion, friendStatus: FriendStatus.SendFriendRequest }
              : suggestion
          )
        );
      } else {
        message.error(response.error?.message_detail || response.message);
      }
    } catch (error: any) {
      message.error(error?.error?.message_detail || error?.message);
    } finally {
      setFriendRequestLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const cancelFriendRequest = async (userId: string) => {
    setFriendRequestLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await defaultProfileRepo.cancelFriendRequest(userId); // Giả sử có API này
      if (response.code === 20001) {
        message.success(`${localStrings.Public.CancelFriendRequest} success`);
        setFriendSuggestions((prev) =>
          prev.map((suggestion) =>
            suggestion.id === userId ? { ...suggestion, friendStatus: FriendStatus.NotFriend } : suggestion
          )
        );
      }
    } catch (error: any) {
      message.error(error?.error?.message_detail || error?.message);
    } finally {
      setFriendRequestLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRemoveSuggestion = (userId: string) => {
    setFriendSuggestions((prev) =>
      prev.map((suggestion) => (suggestion.id === userId ? { ...suggestion, hidden: true } : suggestion))
    );
  };

  const renderFriendButton = useCallback(
    (suggestion: FriendSuggestionWithStatus) => {
      const userId = suggestion.id!;
      switch (suggestion.friendStatus) {
        case FriendStatus.NotFriend:
          return (
            <Button
              type="primary"
              block
              onClick={() => sendFriendRequest(userId)}
              loading={friendRequestLoading[userId]}
            >
              <div className="flex flex-row items-center justify-center">
                <FaUserPlus name="user-plus" size={16} />
                <span style={{ marginLeft: 5 }}>{localStrings.Suggested.AddFriend}</span>
              </div>
            </Button>
          );
        case FriendStatus.IsFriend:
          return (
            <Button type="primary" block disabled>
              <div className="flex flex-row items-center justify-center">
                <FaUserCheck name="user-check" size={16} />
                <span style={{ marginLeft: 5 }}>{localStrings.Public.Friend}</span>
              </div>
            </Button>
          );
        case FriendStatus.SendFriendRequest:
          return (
            <Button
              type="default"
              block
              onClick={() => cancelFriendRequest(userId)}
              loading={friendRequestLoading[userId]}
            >
              <div className="flex flex-row items-center justify-center">
                <RxCross2 name="cross" size={16} />
                <span style={{ marginLeft: 5 }}>{localStrings.Public.CancelFriendRequest}</span>
              </div>
            </Button>
          );
        case FriendStatus.ReceiveFriendRequest:
          return (
            <div style={{ display: "flex", gap: "5px" }}>
              <Button
                type="primary"
                block
                onClick={async () => {
                  await defaultProfileRepo.acceptFriendRequest(userId); // Giả sử có API này
                  setFriendSuggestions((prev) =>
                    prev.map((s) =>
                      s.id === userId ? { ...s, friendStatus: FriendStatus.IsFriend } : s
                    )
                  );
                }}
                loading={friendRequestLoading[userId]}
              >
                {localStrings.Public.AcceptFriendRequest}
              </Button>
              <Button
                type="default"
                block
                onClick={() => defaultProfileRepo.refuseFriendRequest(userId)} // Giả sử có API này
              >
                {localStrings.Public.RefuseFriendRequest}
              </Button>
            </div>
          );
        default:
          return (
            <Button type="primary" block onClick={() => sendFriendRequest(userId)}>
              {localStrings.Suggested.AddFriend}
            </Button>
          );
      }
    },
    [friendRequestLoading, localStrings]
  );

  const handleMenuClick = (e: any) => {
    if (e.key === "1") {
      setIsWhyModalVisible(true);
    } else if (e.key === "2") {
      setFriendSuggestions((prev) => prev.map((s) => ({ ...s, hidden: true })));
      fetchSuggestions();
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">{localStrings.Suggested.Why}</Menu.Item>
      <Menu.Item key="2">{localStrings.Suggested.Dont}</Menu.Item>
    </Menu>
  );

  if (!loading && friendSuggestions.length === 0) return null;
  if (postIndex >= 5) return null;

  return (
    <div
      style={{
        width: "100%",
        padding: "15px",
        backgroundColor: "#fff",
        marginTop: "10px",
        borderRadius: "10px",
        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <UsergroupAddOutlined style={{ fontSize: "18px", marginRight: "8px" }} />
          <h3 style={{ margin: 0, fontWeight: "bold" }}>{localStrings.Suggested.SuggestedFriends}</h3>
        </div>
        <Dropdown overlay={menu} trigger={["click"]}>
          <MoreOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
        </Dropdown>
      </div>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div style={{ display: "flex", overflowX: "auto", gap: "10px" }}>
            {friendSuggestions.map(
              (suggestion) =>
                !suggestion.hidden && (
                  <Card
                    key={suggestion.id}
                    hoverable
                    style={{ width: 150, textAlign: "center", borderRadius: "10px", padding: "10px", flexShrink: 0 }}
                  >
                    <Avatar src={suggestion.avatar_url} size={64} style={{ marginBottom: "10px" }} />
                    <p style={{ fontWeight: "bold", margin: "5px 0" }}>
                      {suggestion.family_name} {suggestion.name}
                    </p>
                    {renderFriendButton(suggestion)}
                    <Button block onClick={() => handleRemoveSuggestion(suggestion.id!)} style={{ marginTop: "5px" }}>
                      {localStrings.Suggested.Hide}
                    </Button>
                  </Card>
                )
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <Button type="link" onClick={showModal} style={{ color: "black" }}>
              {localStrings.Suggested.SeeMore}
            </Button>
          </div>
          <Modal title={localStrings.Suggested.SuggestedFriends} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {friendSuggestions.map(
                (suggestion) =>
                  !suggestion.hidden && (
                    <Card
                      key={suggestion.id}
                      hoverable
                      style={{ width: 150, textAlign: "center", borderRadius: "10px", padding: "10px" }}
                    >
                      <Avatar src={suggestion.avatar_url} size={64} style={{ marginBottom: "10px" }} />
                      <p style={{ fontWeight: "bold", margin: "5px 0" }}>
                        {suggestion.family_name} {suggestion.name}
                      </p>
                      {renderFriendButton(suggestion)}
                      <Button block onClick={() => handleRemoveSuggestion(suggestion.id!)} style={{ marginTop: "5px" }}>
                        {localStrings.Suggested.Hide}
                      </Button>
                    </Card>
                  )
              )}
            </div>
          </Modal>
          <Modal
            title={localStrings.Suggested.Why}
            visible={isWhyModalVisible}
            onOk={handleWhyModalOk}
            onCancel={handleWhyModalCancel}
          >
            <p>{localStrings.Suggested.WhyExplanation}</p>
            <ul>
              <li>{localStrings.Suggested.WhyFactor1}</li>
              <li>{localStrings.Suggested.WhyFactor2}</li>
              <li>{localStrings.Suggested.WhyFactor3}</li>
            </ul>
            <p>{localStrings.Suggested.WhyConclusion}</p>
          </Modal>
        </>
      )}
    </div>
  );
};

export default FriendSuggestions;