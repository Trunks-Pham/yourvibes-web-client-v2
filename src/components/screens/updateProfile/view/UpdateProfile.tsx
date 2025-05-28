"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Space,
  Upload,
  message,
  Typography,
  Radio,
  Modal,
  DatePicker,
  Image,
  Avatar,
  Spin,
} from "antd";

import {
  UploadOutlined,
  CameraOutlined,
  CloseOutlined,
  CalendarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/context/auth/useAuth";
import dayjs from "dayjs";
import { defaultProfileRepo } from "@/api/features/profile/ProfileRepository";
import UpdateProfileViewModel from "../viewModel/UpdateProfileViewModel";
import { useRouter } from "next/navigation";

import useColor from "@/hooks/useColor";
import { space } from "postcss/lib/list";
import ProfileViewModel from "../../profile/viewModel/ProfileViewModel";

const { Text } = Typography;

const UpdateProfileScreen = () => {
  const { user, localStrings, changeLanguage, language } = useAuth();
  const { brandPrimaryTap, lightGray, backgroundColor } = useColor();
  const [showObject, setShowObject] = React.useState(false);
  const [updatedForm] = Form.useForm();
  const whiteSpinner = (
    <LoadingOutlined style={{ fontSize: 24, color: backgroundColor }} />
  );
  const {
    updateProfile,
    handleScroll,
    scrollContainerRef,
    objectPosition,
    newAvatar,
    newCapwall,
    setNewAvatar,
    setNewCapwall,
    loading,
  } = UpdateProfileViewModel(defaultProfileRepo);
  const [showPicker, setShowPicker] = useState(false);
  const router = useRouter();
  const {infoUser, fetchUserProfile} = ProfileViewModel();
   useEffect(() => {
     if (user) {
       fetchUserProfile(user?.id as string);
     }
   }, []);
   useEffect(() => {
  if (infoUser) {
    updatedForm.setFieldsValue({
      name: infoUser.name,
      family_name: infoUser.family_name,
      email: infoUser.email,
      birthday:
        infoUser.birthday && dayjs(infoUser.birthday).isValid()
          ? dayjs(infoUser.birthday)
          : dayjs(infoUser.created_at),
      phone_number: infoUser.phone_number,
      biography: infoUser.biography,
    });
  }
}, [infoUser]);

   
  const pickAvatarImage = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      return false;
    }

    setNewAvatar({
      url: URL.createObjectURL(file), // Tạo URL tạm thời từ tệp
      name: file.name, // Tên tệp
      type: file.type,
      file: file, // Loại tệp
    });

    return true; // Trả về true để tệp có thể được tải lên
  };

  const pickCapwallImage = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      return false;
    }

    // Cập nhật trạng thái với thông tin tệp
    setNewCapwall({
      url: URL.createObjectURL(file), // Tạo URL tạm thời từ tệp
      name: file.name,
      type: file.type,
      file: file,
    });

    return true;
  };

const UpdateProfile = async () => {
  try {
    const values = await updatedForm.validateFields(); // Tự động kiểm tra required
    const data = {
      ...values,
      avatar_url: newAvatar?.file,
      capwall_url: newCapwall?.file,
      birthday: (
        dayjs(values.birthday, "DD/MM/YYYY").format("YYYY-MM-DDT00:00:00") + "Z"
      ).toString(),
    };
    updateProfile(data);
  } catch (err) {
    message.error(localStrings.Profile.ErrorRequired);
  }
};


  return (
    <div className="p-2.5">
      <div className="mb-2 flex items-center">
        <Button
          icon={<CloseOutlined />}
          type="text"
          onClick={() => router.back()}
        />
        <Text strong style={{ fontSize: "18px", marginLeft: "10px" }}>
          {localStrings.UpdateProfile.UpdateProfile}
        </Text>
      </div>
      <div className="md:mx-16 xl:mx-32">
        {/* Cove Image */}
        <div className="relative" style={{ backgroundColor: lightGray }}>
          <div
            ref={scrollContainerRef}
            className="w-full md:h-[375px] h-[250px] overflow-y-auto"
          >
            <Image
              src={newCapwall?.url || user?.capwall_url}
              alt="Cover"
              className="w-full md:h-[375px] h-[250px] object-cover object-center"
              width="100%"
              style={{ objectPosition: objectPosition }}
            />
          </div>
          <div className="absolute top-4 left-4">
            <Upload
              showUploadList={false}
              beforeUpload={pickCapwallImage}
              accept=".jpg, .jpeg, .gif, .png, .svg"
            >
              <Button icon={<CameraOutlined />} />
            </Upload>
          </div>
          {newCapwall?.url && (
            <div className="absolute top-4 right-4">
              <Button
                icon={<CloseOutlined />}
                onClick={() => setNewCapwall({ url: "", name: "", type: "" })}
              />
            </div>
          )}
        </div>
        {/* Profile Image */}
        <Row className="mt-[-60px]">
          {/* Avatar */}
          <Col xs={24} md={18}>
            <Row justify={"space-between"}>
              <Col
                xs={24}
                md={10}
                xl={8}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <div className="relative">
                  <Avatar
                    src={newAvatar?.url || user?.avatar_url}
                    alt="Profile"
                    shape="circle"
                    size={{
                      xs: 150,
                      sm: 150,
                      md: 200,
                      lg: 200,
                      xl: 200,
                      xxl: 200,
                    }}
                    style={{
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      border: "2px solid #f0f0f0",
                      cursor: "pointer",
                    }}
                  />
                  <div className="absolute top-2 left-2.5">
                    <Upload
                      showUploadList={false}
                      beforeUpload={pickAvatarImage}
                      accept=".jpg, .jpeg, .gif, .png, .svg"
                    >
                      <Button icon={<CameraOutlined />} />
                    </Upload>
                  </div>
                  {newAvatar?.url && (
                    <div className="absolute top-0 right-0">
                      <Button
                        icon={<CloseOutlined />}
                        onClick={() =>
                          setNewAvatar({ url: "", name: "", type: "" })
                        }
                      />
                    </div>
                  )}
                </div>
              </Col>
              <Col xs={24} md={14} xl={16} className="md:mt-[60px] mt-0 pt-4">
                <div className="md:text-left text-center mt-2">
                  <text className="text-lg font-bold">
                    {`${user?.family_name} ${user?.name}` ||
                      localStrings.Public.Username}
                  </text>
                </div>
              </Col>
            </Row>
          </Col>
          <Col xs={24} md={6} className="md:mt-[60px] mt-0 pt-2 flex items-end">
            <div className="md:block hidden">
              <p>{localStrings.Public.Language}</p>
              <Radio.Group value={language} onChange={changeLanguage}>
                <Space direction="vertical">
                  <Radio value="en">{localStrings.Public.English}</Radio>
                  <Radio value="vi">{localStrings.Public.Vietnamese}</Radio>
                </Space>
              </Radio.Group>
            </div>
          </Col>
        </Row>

        <Form form={updatedForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="family_name"
                label={localStrings.Form.Label.FamilyName}
                rules={[
                  {
                    required: true,
                    message:
                      localStrings.Form.RequiredMessages
                        .FamilyNameRequiredMessage,
                  },
                ]}
              >
                <Input placeholder={localStrings.Form.Label.FamilyName} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label={localStrings.Form.Label.Name}
                rules={[
                  {
                    required: true,
                    message:
                      localStrings.Form.RequiredMessages.NameRequiredMessage,
                  },
                ]}
              >
                <Input placeholder={localStrings.Form.Label.Name} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone_number"
            label={localStrings.Form.Label.Phone}
            rules={[
              {
                required: true,
                message:
                  localStrings.Form.RequiredMessages.PhoneRequiredMessage,
              },
              {
                pattern: /^\d{10}$/,
                message: localStrings.Form.RequiredMessages.PhoneInvalidMessage,
              },
            ]}
          >
            <Input placeholder={localStrings.Form.Label.Phone} />
          </Form.Item>

          <Form.Item
            name="birthday"
            label={localStrings.Form.Label.BirthDay}
            rules={[
              {
                required: true,
                message:
                  localStrings.Form.RequiredMessages.BirthDayRequiredMessage,
              },
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              className="w-full"
              placeholder={localStrings.Form.Label.BirthDay}
              // Gán giá trị ngày sinh từ form
              value={
                updatedForm.getFieldValue("birthday")
                  ? dayjs(updatedForm.getFieldValue("birthday"))
                  : null
              }
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={localStrings.Form.Label.Email}
            rules={[{type: "email" }]}
          >
            <Input
              placeholder={localStrings.Form.Label.Email}
              readOnly
              onFocus={(e) => e.target.blur()}
            />
          </Form.Item>

          <Form.Item name="biography" label={localStrings.Form.Label.Biography}>
            <Input.TextArea placeholder={localStrings.Form.Label.Biography} />
          </Form.Item>
        </Form>
      </div>

      <div className="flex justify-end">
        <Button type="primary" onClick={UpdateProfile}>
          <div style={{ color: backgroundColor }}>
            {loading ? (
              <Spin indicator={whiteSpinner} />
            ) : (
              localStrings.Public.Save
            )}
          </div>
        </Button>
      </div>
    </div>
  );
};

export default UpdateProfileScreen;
