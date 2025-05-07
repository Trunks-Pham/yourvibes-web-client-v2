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
  const { backgroundColor, brandPrimary, brandPrimaryTap, menuItem, borderColor,backgroundAddPost } = useColor();
  const viewModel = AddPostViewModel(defaultPostRepo);
  const pathname = usePathname();
  const whiteSpinner = <LoadingOutlined style={{ fontSize: 24, color: backgroundColor }} />;

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
    <button
      style={{
        color: brandPrimary,
        borderRadius: 4,
        padding: 8,
      }}
      type="button"
    >
      <PlusOutlined style={{ color: brandPrimary }} />
      <div style={{ marginTop: 8, color: brandPrimary }}>
        {localStrings.AddPost.UploadImage}
      </div>
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
    <ConfigProvider
      theme={{
        components: {
          Input: {
            colorBgContainer: menuItem,
            colorText: brandPrimary,
            colorBorder: borderColor,
            colorTextPlaceholder: "gray",
          },
          Select: {
            colorBgContainer: menuItem,
            colorText: brandPrimary,
            colorBorder: borderColor,
            colorBgElevated: menuItem,
            colorPrimary: brandPrimary,
          },
          Upload: {
            colorBorder: borderColor,
            colorText: brandPrimary,
          },
        },
      }}
    >
      <div style={{ padding: "20px", backgroundColor: backgroundColor }}>
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
            <Text strong style={{ color: brandPrimary }}>
              {user?.family_name + " " + user?.name || localStrings.Public.UnknownUser}
            </Text>
            <Form.Item style={{ marginTop: "5px", marginBottom: 0 }}>
              <TextArea
                placeholder={localStrings.AddPost.WhatDoYouThink}
                autoSize={{ minRows: 3, maxRows: 5 }}
                value={viewModel.postContent}
                onChange={(e) => viewModel.setPostContent(e.target.value)}
                style={{
                  backgroundColor: backgroundAddPost,
                  color: brandPrimary,
                  borderColor: borderColor,
                }}
              />
              <Text
                type={currentCharCount > 10000 ? "danger" : "secondary"}
                style={{ float: "right", color: brandPrimaryTap }}
              >
                {currentCharCount}/{localStrings.Post.CharacterLimit}
              </Text>
            </Form.Item>
          </div>
        </div>

        <Upload
          className="pt-4"
          accept=".jpg, .jpeg, .gif, .png, .svg, .mp4, .mov"
          listType="picture-card"
          fileList={viewModel.fileList}
          onChange={viewModel.handleChange}
          onPreview={viewModel.handlePreview}
          beforeUpload={() => false}
          style={{ backgroundColor: menuItem, borderColor: borderColor }}
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

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <Text style={{ color: brandPrimary }}>{localStrings.AddPost.PrivacyText}: </Text>
          <Select
            value={viewModel.privacy}
            onChange={(value) => viewModel.setPrivacy(value)}
            style={{
              width: 120,
              marginLeft: "10px",
              backgroundColor: menuItem,
              color: brandPrimary,
            }}
            dropdownStyle={{
              backgroundColor: menuItem,
              color: brandPrimary,
            }}
            options={[
              { label: localStrings.Public.Everyone, value: Privacy.PUBLIC },
              { label: localStrings.Public.Friend, value: Privacy.FRIEND_ONLY },
              { label: localStrings.Public.Private, value: Privacy.PRIVATE },
            ]}
          />

          <Button
            style={{ marginLeft: "auto", backgroundColor: brandPrimary, borderColor: brandPrimary,  }}
            type="primary"
            onClick={handleSubmit}
            disabled={!isContentLengthValid() && viewModel.selectedMediaFiles.length === 0}
          >
            <div style={{ color: backgroundColor }}>

            {viewModel.createLoading ? <Spin indicator={whiteSpinner} /> : localStrings.AddPost.PostNow}

            </div>
          </Button>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default AddPostScreen;