import React, { useState } from "react";
import { Avatar, Button, Card, Dropdown, Menu } from "antd";
import { useRouter } from "next/navigation";
import { UsergroupAddOutlined, MoreOutlined } from "@ant-design/icons";

interface FriendSuggestionsProps {
    friendSuggestions?: Array<{
        id: string;
        avatar_url: string;
        family_name: string;
        name: string;
    }>;
}

const mockFriendSuggestions = [
    { id: "1", avatar_url: "https://th.bing.com/th/id/OIP.QZIRZKUSWt1HBifjDRKGzAHaFj?rs=1&pid=ImgDetMain", family_name: "Nguyễn", name: "An" },
    { id: "2", avatar_url: "https://th.bing.com/th/id/OIP.QZIRZKUSWt1HBifjDRKGzAHaFj?rs=1&pid=ImgDetMain", family_name: "Trần", name: "Bình" },
    { id: "3", avatar_url: "https://th.bing.com/th/id/OIP.QZIRZKUSWt1HBifjDRKGzAHaFj?rs=1&pid=ImgDetMain", family_name: "Lê", name: "Cường" },
    { id: "4", avatar_url: "https://th.bing.com/th/id/OIP.QZIRZKUSWt1HBifjDRKGzAHaFj?rs=1&pid=ImgDetMain", family_name: "Phạm", name: "Duy" },
];

const FriendSuggestions: React.FC<FriendSuggestionsProps> = ({ friendSuggestions = mockFriendSuggestions }) => {
    const router = useRouter();

    const menu = (
        <Menu>
            <Menu.Item key="1">Tại sao tôi lại thấy những người bạn này</Menu.Item>
            <Menu.Item key="2">Tôi không muốn thấy những người bạn này</Menu.Item>
        </Menu>
    );

    return (
        <div style={{ width: "100%", padding: "15px", backgroundColor: "#fff", marginTop: "10px", borderRadius: "10px", boxShadow: "0px 2px 5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <UsergroupAddOutlined style={{ fontSize: "18px", marginRight: "8px" }} />
                    <h3 style={{ margin: 0, fontWeight: "bold" }}>Những người bạn có thể biết</h3>
                </div>
                <Dropdown overlay={menu} trigger={["click"]}>
                    <MoreOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
                </Dropdown>
            </div>

            <div style={{ display: "flex", overflowX: "auto", gap: "10px" }}>
                {friendSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} hoverable style={{ width: 150, textAlign: "center", borderRadius: "10px", padding: "10px", flexShrink: 0 }}>
                        <Avatar src={suggestion.avatar_url} size={64} style={{ marginBottom: "10px" }} />
                        <p style={{ fontWeight: "bold", margin: "5px 0" }}>{suggestion.family_name} {suggestion.name}</p>
                        <Button type="primary" block style={{ marginBottom: "5px" }}>Kết Bạn</Button>
                        <Button block>Gỡ</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default FriendSuggestions;
