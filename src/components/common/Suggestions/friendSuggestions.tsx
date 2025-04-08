import React, { useState, useEffect } from "react";
import { Avatar, Button, Card, Dropdown, Menu, Modal, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import { UsergroupAddOutlined, MoreOutlined } from "@ant-design/icons";
import { defaultNewFeedRepo } from "@/api/features/newFeed/NewFeedRepo";
import { SuggestionUserModel, NewFeedRequestModel } from "@/api/features/newFeed/Model/NewFeedModel";
import { defaultProfileRepo } from "@/api/features/profile/ProfileRepository";
import { useAuth } from "@/context/auth/useAuth";

interface FriendSuggestionsProps {
    postIndex: number;
}

interface FriendSuggestionWithStatus extends SuggestionUserModel {
    requestSent?: boolean;
    hidden?: boolean;
}

const FriendSuggestions: React.FC<FriendSuggestionsProps> = ({ postIndex }) => {
    const router = useRouter();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestionWithStatus[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [friendRequestLoading, setFriendRequestLoading] = useState<Record<string, boolean>>({});

    const { localStrings } = useAuth();

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const menu = (
        <Menu>
            <Menu.Item key="1">{localStrings.Suggested.Why}</Menu.Item>
            <Menu.Item key="2">{localStrings.Suggested.Dont}</Menu.Item>
        </Menu>
    );

    useEffect(() => {
        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const requestData: NewFeedRequestModel = {
                    limit: 10,
                    page: 1,
                };
                const response = await defaultNewFeedRepo.getSuggestion(requestData);
                if (response.code === 20001) {
                    const suggestionsWithStatus: FriendSuggestionWithStatus[] = response.data.map(
                        (suggestion: SuggestionUserModel) => ({
                            ...suggestion,
                            requestSent: false,
                            hidden: false,
                        })
                    );
                    setFriendSuggestions(suggestionsWithStatus);
                } else {
                    console.error("Error fetching suggestions:", response.message);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    const handleSendFriendRequest = async (userId: string) => {
        setFriendRequestLoading((prevLoading) => ({ ...prevLoading, [userId]: true }));
        try {
            const response = await defaultProfileRepo.sendFriendRequest(userId);
            if (response.code === 20001) {
                message.success(`${localStrings.Profile.Friend.SendRequestSuccess}`);
                setFriendSuggestions((prevSuggestions) =>
                    prevSuggestions.map((suggestion) =>
                        suggestion.id === userId ? { ...suggestion, requestSent: true } : suggestion
                    )
                );
            } else if (response.code === 50007) {
                message.error(response.error?.message_detail || response.message || "Bạn đã gửi lời mời kết bạn cho người này rồi.");
            } else {
                // Xử lý các lỗi khác từ server
                message.error(response.message || "Có lỗi xảy ra khi gửi lời mời kết bạn.");
            }
        } catch (error: any) {
            // Xử lý lỗi từ Axios (bao gồm lỗi 400)
            console.error("Error sending friend request:", error);
            if (error.response?.status === 400) {
                message.error("Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.");
            } else {
                message.error("Có lỗi xảy ra khi gửi lời mời kết bạn.");
            }
        } finally {
            setFriendRequestLoading((prevLoading) => ({ ...prevLoading, [userId]: false }));
        }
    };

    const handleRemoveSuggestion = (userId: string) => {
        setFriendSuggestions((prevSuggestions) =>
            prevSuggestions.map((suggestion) =>
                suggestion.id === userId ? { ...suggestion, hidden: true } : suggestion
            )
        );
    };

    if (postIndex >= 5) {
        return null;
    }

    return (
        <div style={{ width: "100%", padding: "15px", backgroundColor: "#fff", marginTop: "10px", borderRadius: "10px", boxShadow: "0px 2px 5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
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
                        {friendSuggestions.map((suggestion) => (
                            !suggestion.hidden && (
                                <Card key={suggestion.id} hoverable style={{ width: 150, textAlign: "center", borderRadius: "10px", padding: "10px", flexShrink: 0 }}>
                                    <Avatar src={suggestion.avatar_url} size={64} style={{ marginBottom: "10px" }} />
                                    <p style={{ fontWeight: "bold", margin: "5px 0" }}>{suggestion.family_name} {suggestion.name}</p>
                                    <Button
                                        type="primary"
                                        block
                                        style={{ marginBottom: "5px" }}
                                        loading={friendRequestLoading[suggestion.id!]}
                                        onClick={() => handleSendFriendRequest(suggestion.id!)}
                                        disabled={suggestion.requestSent}
                                    >
                                        {suggestion.requestSent ? `${localStrings.Suggested.FriendRequestSent}` : `${localStrings.Suggested.AddFriend}`}
                                    </Button>
                                    <Button block onClick={() => handleRemoveSuggestion(suggestion.id!)}>{localStrings.Suggested.Hide}</Button>
                                </Card>
                            )
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                        <Button type="link" onClick={showModal} style={{ color: "black" }}>{localStrings.Suggested.SeeMore}</Button>
                    </div>

                    <Modal title="Những người bạn có thể biết" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {friendSuggestions.map((suggestion) => (
                                !suggestion.hidden && (
                                    <Card key={suggestion.id} hoverable style={{ width: 150, textAlign: "center", borderRadius: "10px", padding: "10px" }}>
                                        <Avatar src={suggestion.avatar_url} size={64} style={{ marginBottom: "10px" }} />
                                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>{suggestion.family_name} {suggestion.name}</p>
                                        <Button
                                            type="primary"
                                            block
                                            style={{ marginBottom: "5px" }}
                                            loading={friendRequestLoading[suggestion.id!]}
                                            onClick={() => handleSendFriendRequest(suggestion.id!)}
                                            disabled={suggestion.requestSent}
                                        >
                                            {suggestion.requestSent ? `${localStrings.Suggested.FriendRequestSent}` : `${localStrings.Suggested.AddFriend}`}
                                        </Button>
                                        <Button block onClick={() => handleRemoveSuggestion(suggestion.id!)}>{localStrings.Suggested.Hide}</Button>
                                    </Card>
                                )
                            ))}
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default FriendSuggestions;
