"use client";
import {
  Button,
  Form,
  Input,
  Avatar,
  Typography,
  Upload,
  Spin,
  Image,
  Select,
  ConfigProvider,
} from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/useAuth";
import { usePostContext } from "@/context/post/usePostContext";
import AddPostViewModel from "../viewModel/AddpostViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import { Privacy } from "@/api/baseApiResponseModel/baseApiResponseModel";
import { useEffect } from "react";
import useColor from "@/hooks/useColor";

const { TextArea } = Input;
const { Text } = Typography;

interface AddPostScreenProps {
  onPostSuccess?: () => void;
  fetchNewFeeds?: () => void;
  fetchUserPosts?: () => void;
}

const AddPostScreen = ({ onPostSuccess, fetchNewFeeds, fetchUserPosts }: AddPostScreenProps) => {
  const { user, localStrings } = useAuth();
  const savedPost = usePostContext();
  const router = useRouter();
  const {backgroundColor, brandPrimary, brandPrimaryTap} = useColor();
  const viewModel = AddPostViewModel(defaultPostRepo);
  const pathname = usePathname();
  const whiteSpinner = <LoadingOutlined style={{ fontSize: 24, color: "white" }} />;
  const PostUpdateObserver = {
    update: () => {
      if (pathname === "/home" && fetchNewFeeds) {
        fetchNewFeeds();
      } else if (pathname === "/profile" && fetchUserPosts) {
        fetchUserPosts();
      }
      if (onPostSuccess) {
        onPostSuccess();
      }
    }
  };

  useEffect(() => {
    viewModel.registerObserver(PostUpdateObserver);
  }, [viewModel]);

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{localStrings.AddPost.UploadImage}</div>
    </button>
  );

  const isContentLengthValid = () => {
    const contentLength = viewModel.postContent.trim().length;
    return contentLength >= 2 && contentLength <= 10000;
  };

  const handleSubmit = async () => {
    if (!isContentLengthValid() && viewModel.fileList.length === 0) {
      return;
    }
    await viewModel.handleSubmitPost();
  };

  const currentCharCount = viewModel.postContent.length;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <Avatar
          src={
            user?.avatar_url ||
            "https://res.cloudinary.com/dfqgxpk50/image/upload/v1712331876/samples/look-up.jpg"
          }
          size={{ xs: 40, sm: 40, md: 50, lg: 50, xl: 50, xxl: 50 }}
        />
        <div style={{ marginLeft: "10px", flex: 1 }}>
          <Text strong>
            {user?.family_name + " " + user?.name ||
              localStrings.Public.UnknownUser}
          </Text>
          <Form.Item style={{ marginTop: "5px", marginBottom: 0 }}>
          <>
  <style>
    {`
      textarea.ant-input::placeholder {
        color: gray;
      }
    `}
  </style>

  <TextArea
    placeholder={localStrings.AddPost.WhatDoYouThink}
    autoSize={{ minRows: 3, maxRows: 5 }}
    value={viewModel.postContent}
    onChange={(e) => viewModel.setPostContent(e.target.value)}
    style={{
      backgroundColor: backgroundColor,
    }}
  />
</>
            <Text type={currentCharCount > 10000 ? "danger" : "secondary"} style={{ float: "right" }}>
              {currentCharCount}/{localStrings.Post.CharacterLimit}
            </Text>
          </Form.Item>
        </div>
      </div>

<ConfigProvider
  theme={{
    components: {
      Upload: {
        lineType: "none",
      }}
  }}>
     <Upload
        className="pt-4"
        accept=".jpg, .jpeg, .gif, .png, .svg, .mp4, .mov"
        listType="picture-card"
        fileList={viewModel.fileList}
        onChange={viewModel.handleChange}
        onPreview={viewModel.handlePreview}
        beforeUpload={() => false}
      >
        {viewModel.fileList.length >= 8 ? null : uploadButton}
      </Upload>

      {viewModel.previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: viewModel.previewOpen,
            onVisibleChange: (visible) => viewModel.setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && viewModel.setPreviewImage(""),
          }}
          src={viewModel.previewImage}
        />
      )}
  </ConfigProvider>
     

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "10px",
        }}
      >
        <Text>{localStrings.AddPost.PrivacyText}: </Text>
        <ConfigProvider
  theme={{
    token: {
      colorBgContainer: backgroundColor,     // màu nền của Select
      colorText: brandPrimary,               // màu chữ
      colorPrimary: brandPrimary,            // màu khi focus / hover
      colorBgElevated: backgroundColor, // Nền của dropdown    
    },
  }}
>
<Select
  value={viewModel.privacy}
  onChange={(value) => viewModel.setPrivacy(value)}
  style={{
    width: 120,
    marginLeft: "10px",  
  }}
  dropdownStyle={{
    backgroundColor: backgroundColor, // nền dropdown
    color: brandPrimary,              // chữ dropdown
  }}
  options={[
    { label: localStrings.Public.Everyone, value: Privacy.PUBLIC },
    { label: localStrings.Public.Friend, value: Privacy.FRIEND_ONLY },
    { label: localStrings.Public.Private, value: Privacy.PRIVATE },
  ]}
/>


</ConfigProvider>

        <Button
          style={{ marginLeft: "auto" }}
          type="primary"
          onClick={handleSubmit}
          disabled={!isContentLengthValid() && viewModel.selectedMediaFiles.length === 0}
        >
          {viewModel.createLoading ? <Spin indicator={whiteSpinner} /> : localStrings.AddPost.PostNow}
        </Button>
      </div>
    </div>
  );
};

export default AddPostScreen;