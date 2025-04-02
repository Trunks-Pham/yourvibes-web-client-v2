"use client";
import {
  Button,
  Form,
  Input,
  Avatar,
  Typography,
  Upload,
  Spin,
  GetProp,
  Image,
  Select,
} from "antd";
import {
  CloseOutlined,
  PictureOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/useAuth";
import { usePostContext } from "@/context/post/usePostContext";
import AddPostViewModel from "../viewModel/AddpostViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import { Privacy } from "@/api/baseApiResponseModel/baseApiResponseModel";
import { UploadFile, UploadProps } from "antd/es/upload";

const { TextArea } = Input;
const { Text } = Typography;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface AddPostScreenProps {
  onPostSuccess?: () => void;
  fetchNewFeeds?: () => void;
  fetchUserPosts?: () => void;
}

const AddPostScreen = ({ onPostSuccess, fetchNewFeeds, fetchUserPosts }: AddPostScreenProps) => {
  const { user, localStrings } = useAuth();
  const savedPost = usePostContext();
  const router = useRouter();
  const {
    postContent,
    setPostContent,
    createPost,
    createLoading,
    privacy,
    setPrivacy,
    handleSubmitPost,
    selectedMediaFiles,
    setSelectedMediaFiles,
    image,
    setImage,
    handleChange,
    handlePreview,
    fileList,
    previewImage,
    previewOpen,
    setPreviewOpen,
    setPreviewImage,
  } = AddPostViewModel(defaultPostRepo, router);
  const pathname = usePathname();

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{localStrings.AddPost.UploadImage}</div>
    </button>
  );

  // Hàm kiểm tra độ dài nội dung hợp lệ
  const isContentLengthValid = () => {
    const contentLength = postContent.trim().length;
    return contentLength >= 2 && contentLength <= 10000;
  };

  const handleSubmit = async () => {
    if (!isContentLengthValid()) { 
      return;
    }

    try {
      await handleSubmitPost();
      if (pathname === "/home" && fetchNewFeeds) {
        fetchNewFeeds();
      } else if (pathname === "/profile" && fetchUserPosts) {
        fetchUserPosts();
      }
      if (onPostSuccess) {
        onPostSuccess();
      }
    } catch (error) { 
    }
  };

  // Tính số ký tự hiện tại
  const currentCharCount = postContent.length;

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
          <Form.Item>
            <TextArea
              placeholder={localStrings.AddPost.WhatDoYouThink}
              autoSize={{ minRows: 3, maxRows: 5 }}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <Text type={currentCharCount > 10000 ? "danger" : "secondary"} style={{ float: "right" }}>
              {currentCharCount}/{localStrings.Post.CharacterLimit}
            </Text>
          </Form.Item>
        </div>
      </div>

      <Upload
        className="pt-4"
        accept=".jpg, .jpeg, .gif, .png, .svg, .mp4, .mov"
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        onPreview={handlePreview}
        beforeUpload={() => false}
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>

      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "10px",
        }}
      >
        <Text>{localStrings.AddPost.PrivacyText}: </Text>
        <Select
          value={privacy}
          onChange={(value) => setPrivacy(value)}
          style={{ width: 120, marginLeft: "10px" }}
        >
          <Select.Option value={Privacy.PUBLIC}>
            {localStrings.Public.Everyone}
          </Select.Option>
          <Select.Option value={Privacy.FRIEND_ONLY}>
            {localStrings.Public.Friend}
          </Select.Option>
          <Select.Option value={Privacy.PRIVATE}>
            {localStrings.Public.Private}
          </Select.Option>
        </Select>

        <Button
          style={{ marginLeft: "auto" }}
          type="primary"
          onClick={handleSubmit}
          disabled={!isContentLengthValid() && selectedMediaFiles.length === 0}
          loading={createLoading}
        >
          {createLoading
            ? createLoading && <Spin style={{ color: "white" }} />
            : localStrings.AddPost.PostNow}
        </Button>
      </div>
    </div>
  );
};

export default AddPostScreen;