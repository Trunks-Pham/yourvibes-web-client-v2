import { useAuth } from "@/context/auth/useAuth";
import React, { useState } from "react";
import ChangPassword from "../viewModel/changePasswordViewModel";
import { defaultProfileRepo } from "@/api/features/profile/ProfileRepository";
import useColor from "@/hooks/useColor";
import { Button, ConfigProvider, Form, Input, message } from "antd";
import { log } from "console";
import ChangePasswordViewModel from "../viewModel/changePasswordViewModel";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

const ChangePassword = ({
  setShowChangePassword,
}: {
  setShowChangePassword: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { localStrings } = useAuth();
  const { loading, changePassword } =
    ChangePasswordViewModel(defaultProfileRepo);
  const [form] = Form.useForm();
  const { backGround, backgroundColor, brandPrimary, brandPrimaryTap } =
    useColor();
  const onFinish = async (values: any) => {
    if (values.oldPassword === values.newPassword) {
      message.error(
        localStrings.Form.TypeMessage.PleaseOldPasswordDifferentNewPassword
      );
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      message.error(localStrings.Form.TypeMessage.ConfirmPasswordTypeMessage);
      return;
    }
    try {
      await changePassword({
        old_password: values.oldPassword,
        new_password: values.newPassword,
      }).then((res) => {
        if (!res?.error) {
          form.resetFields();
          setShowChangePassword(false);
        }
      });
    } catch (error) {
      console.error("Error changing password:", error);
      // Thất bại: Modal vẫn mở, chỉ hiển thị thông báo lỗi
      message.error(
        localStrings.ChangePassword.ChangePasswordFailed ||
          "Failed to change password"
      );
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: brandPrimary,
          colorText: brandPrimary,
        },
        components: {
          Input: {
            colorBgContainer: backGround,
            colorText: brandPrimary,
            colorBorder: brandPrimary,
            colorTextPlaceholder: "gray",
          },
          Button: {
            colorBgContainer: backgroundColor,
            colorPrimary: brandPrimary,
            colorPrimaryHover: brandPrimaryTap,
          },
        },
      }}
    >
      <div>
        <Form
          name="changePassword"
          layout="vertical"
          className="w-full"
          onFinish={onFinish}
          form={form}
        >
          {/* Mật Khẩu cũ */}
          <Form.Item
            name="oldPassword"
            rules={[
              {
                required: true,
                message:
                  localStrings.Form.RequiredMessages.PasswordRequiredMessage,
              },
            ]}
          >
            <Input.Password
              placeholder={localStrings.Form.Label.Password}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ color: "gray" }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: "gray" }} />
                )
              }
            />
          </Form.Item>

          {/* Mật khẩu mới */}
          <Form.Item
            name="newPassword"
            rules={[
              {
                required: true,
                message:
                  localStrings.Form.RequiredMessages.PasswordRequiredMessage,
              },
            ]}
          >
            <Input.Password
              placeholder={localStrings.Form.Label.Password}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ color: "gray" }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: "gray" }} />
                )
              }
            />
          </Form.Item>

          {/* Xác nhận mật khẩu */}
          <Form.Item
            name="confirmPassword"
            rules={[
              {
                required: true,
                message:
                  localStrings.Form.RequiredMessages.PasswordRequiredMessage,
              },
            ]}
          >
            <Input.Password
              placeholder={localStrings.Form.Label.Password}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ color: "gray" }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: "gray" }} />
                )
              }
            />
          </Form.Item>

          {/* Nút Đăng nhập */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full py-2 rounded-md hover:bg-gray-800"
              loading={loading}
            >
              <span style={{ color: backGround }}>
                {localStrings.ChangePassword.ConformChangePassword}
              </span>
            </Button>
          </Form.Item>
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default ChangePassword;
