"use client";
import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Spin,
  ConfigProvider,
  Switch,
} from "antd";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import LoginViewModel from "../viewModel/loginViewModel";
import { AuthenRepo } from "@/api/features/authenticate/AuthenRepo";
import "antd/dist/reset.css";
import { useAuth } from "@/context/auth/useAuth";
import { useState } from "react";
import useColor from "@/hooks/useColor";
import { EyeInvisibleOutlined, EyeOutlined} from '@ant-design/icons';

const LoginPage = () => {
  const { localStrings, changeLanguage, theme, changeTheme } = useAuth();
  const router = useRouter();
  const { backgroundColor, brandPrimary, brandPrimaryTap,borderColor } = useColor();
  const loginViewModel = LoginViewModel(new AuthenRepo());
  const {
    login,
    loading,
    getGoogleLoginUrl,
    googleLoading,
    addObserver,
    removeObserver,
  } = loginViewModel;
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLanguageChange = () => {
    changeLanguage();
  };

  const handleGoogleLoginClick = () => {
    setIsLoggingIn(true);
    router.push(getGoogleLoginUrl);
  };

  useEffect(() => {
    const loginObserver = {
      onLoginStateChanged: (isLoading: boolean, error?: string) => {
        setIsLoggingIn(isLoading);
        if (isLoading) {
          message.loading({
            content: `${localStrings.Public.LoginLoading}`,
            key: "login",
            duration: 0,
          });
        } else {
          message.destroy("login");
          if (error) {
            message.error(error);
          }
        }
      },
      onLoginSuccess: (data: any) => {
        setIsLoggingIn(false);
      },
    };

    addObserver(loginObserver);
    return () => removeObserver(loginObserver);
  }, [addObserver, removeObserver, localStrings, router]);

  const onFinish = async (values: any) => {
    await login(values);
  };

  return (
          <ConfigProvider 
            theme={{token: {
              colorPrimary: brandPrimary,
              colorText: brandPrimary,
            },
              components: {
                Input: {
                  colorBgContainer: backgroundColor,
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
    <Row className="min-h-screen" align={"middle"} justify={"center"}>
      <Col xs={0} lg={10} className="h-fit">
        <div className="flex justify-center">
          <img
           src={theme === "light" ? "/image/yourvibes_black.png" : "/image/yourvibes _white.png"} 
            alt="YourVibes"
            className="font-cursive text-black"
            width={300}
          />
        </div>
      </Col>
      <Col xs={20} lg={10} className="h-fit">
        <div className="flex justify-end mb-2">
          <div className="text-brandPrimary" style={{ color: brandPrimary }}>
            {localStrings.Public.Theme}{" "}
            {theme === "light"
              ? localStrings.Public.LightMode
              : localStrings.Public.DarkMode}{" "}
            <Switch
              defaultChecked
              onChange={(checked) => changeTheme?.(checked ? "dark" : "light")}
            />
          </div>
        </div>
        <Row justify="center" align={"middle"} className="w-full h-full">
          <div
            className="w-full p-6 borderrounded-lg shadow-lg "
            style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: backgroundColor, border: `1px solid ${borderColor}`, borderRadius: "8px" }}
          >
            <Spin spinning={isLoggingIn} tip={localStrings.Public.LoginLoading}>
              <Form
                name="login"
                layout="vertical"
                onFinish={onFinish}
                className="w-full"
                disabled={isLoggingIn}
              >
                <Col span={24} className="h-fit pb-4">
                  <div className="flex justify-center">
                    <img
                       src={theme === "light" ? "/image/yourvibes_black.png" : "/image/yourvibes _white.png"} 
                      alt="YourVibes"
                      className="font-cursive text-black w-[60%] sm:w-[50%] md:w-[40%] lg:hidden block"
                    />
                  </div>
                </Col>
                
                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      message:
                        localStrings.Form.RequiredMessages.EmailRequiredMessage,
                    },
                    {
                      type: "email",
                      message: localStrings.Form.TypeMessage.EmailTypeMessage,
                    },
                  ]}
                >
                  <Input
                    placeholder="Email"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message:
                        localStrings.Form.RequiredMessages
                          .PasswordRequiredMessage,
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
                <div className="mb-4 text-center text-xs">
                  <a
                    href="/forgotPassword"
                    className="text-blue-500 hover:underline"
                  >
                    {localStrings.Login.ForgotPasswordText}
                  </a>
                </div>
                <Form.Item>
            
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="w-full py-2 rounded-md"
                      loading={loading}
                      disabled={isLoggingIn}
                    >
                      <span style={{ color: backgroundColor }}>
                        {localStrings.Login.LoginButton}
                      </span>
                    </Button>
                </Form.Item>
                <div className="text-center text-sm">
                  <span>
                    {localStrings.Login.DontHaveAccout}{" "}
                    <a
                      href="/register"
                      className="text-blue-500 hover:underline"
                    >
                      {localStrings.Login.SignUpNow}
                    </a>
                  </span>
                </div>
                <div className="mt-4 text-center text-sm font-semibold">
                  {localStrings.Login.Or}
                </div>
                <div className="mt-4 text-center">
                  <Button
                    type="default"
                    icon={<FcGoogle />}
                    className="w-full flex items-center justify-center"
                    onClick={handleGoogleLoginClick}
                    loading={googleLoading}
                    disabled={isLoggingIn}
                  >
                    Google
                  </Button>
                </div>
              </Form>
            </Spin>
            <Button
              type="primary"
              onClick={handleLanguageChange}
              className="w-full mt-4 py-2 rounded-md hover:bg-gray-800"
              disabled={isLoggingIn}
              >
               <span style={{ color: backgroundColor }}>

              {localStrings.Login.changeLanguage}
               </span>
            </Button>
          </div>
        </Row>
      </Col>
    </Row>
              </ConfigProvider>
  );
};

export default LoginPage;
