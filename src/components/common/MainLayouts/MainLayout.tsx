"use client";

import React, { useState } from "react";
import {
  Layout,
  Menu,
  Grid,
  ConfigProvider,
  Modal,
  Avatar,
  Button,
} from "antd";
import { createElement } from "react";
import {
  FaHome,
  FaBell,
  FaCog,
  FaUser,
  FaFacebookMessenger,
  FaAd,
} from "react-icons/fa";
import { HiTrendingUp } from "react-icons/hi";
import { useAuth } from "@/context/auth/useAuth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchScreen from "@/components/screens/search/views/SearchScreen";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import useColor from "@/hooks/useColor";
import SettingsTab from "@/components/screens/profile/components/SettingTabs";
import NotificationScreen from "@/components/screens/notification/views/Notification";
import { FaPeopleGroup } from "react-icons/fa6";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  position: "fixed",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const { backgroundColor, lightGray } = useColor();
  const { user, localStrings } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const screens = useBreakpoint();
  const [settingModal, setSettingModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const content = {
    nav: [
      {
        link: "/home",
        content: localStrings.Public.Home,
        icon: FaHome,
      },
      {
        link: "/messages",
        content: localStrings.Public.Messages,
        icon: FaFacebookMessenger,
      },
      {
        link: "/trending",
        content: localStrings.Public.Trending,
        icon: HiTrendingUp,
      },
      {
        link: "/people",
        content: localStrings.Public.People,
        icon: FaPeopleGroup,
      },
      {
        link: "/profile",
        content: localStrings.Public.Profile,
        icon: FaUser,
      },
      {
        link: "/notifications",
        content: localStrings.Notification.Notification,
        icon: FaBell,
      },
      {
        link: "/adsManagement",
        content: localStrings.Ads.AdsManagement,
        icon: FaAd,
      },
      {
        link: "/settings",
        content: localStrings.Public.Settings,
        icon: FaCog,
      },
    ],
  };

  const { nav } = content;

  const isActived = (link: string) => {
    const [basePath, queryString] = link.split("?");
    const linkParams = new URLSearchParams(queryString);

    if (pathname !== basePath) return false;

    for (const [key, value] of linkParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }

    return true;
  };

  const handleMenuClick = () => {
    // setVisible(!visible);
    setCollapsed(!collapsed);
  };

  const handleItemClick = (link: string) => {
    if (link === "/settings") {
      setSettingModal(true);
    } else if (link === "/notifications") {
      setNotificationModal(true);
    } else {
      router.push(link);
    }
    setVisible(false);
    setCollapsed(false);
  };

  // Define the header navigation items
  const headerNavItems = [
    { label: "FEED", link: "/home" },
    { label: "PEOPLE", link: "/people" },
    { label: "TRENDING", link: "/trending" },
  ];

  return (
    <Layout>
      <Sider
        trigger={null}
        collapsedWidth={0}
        width={250}
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={(collapsed) => setCollapsed(collapsed)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position:"fixed",
          zIndex: 100,
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="demo-logo-vertical" />
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemActiveBg: lightGray,
                itemSelectedBg: lightGray,
                colorBgContainer: "rgb(244, 244, 244)",
                itemBorderRadius: 5,
                itemMarginBlock: 0,
                itemHeight: 55,
                itemPaddingInline: 0,
                padding: 0,         
              },

            },
          }}
        >
          <Menu
            mode="inline"
            style={{ borderRight: 0 }}
            className="flex flex-col justify-center h-full"
            items={nav.map((item, index) => {
              const actived = isActived(item.link);
              return {
                key: index.toString(),
                label: (
                  <div>
                    <div
                     className="h-4 flex items-center gap-4 w-full h-full px-4 pl-8"

                      style={{
                        backgroundColor: actived ? "#C0C0C0" : "transparent",
                        color: "black",
                      }}
                      onClick={() => {handleItemClick(item.link)
                      }}
                    >
                      {createElement(item.icon, {
                        size: 20,
                      })}
                      <span>{item.content}</span>
                    </div>
                    <div>
                      <hr className="border-t-2 border-gray-300" />
                    </div>
                  </div>
                ),
                style: {
                  padding: 0,
                  cursor: "pointer",
                },
              };
            })}
          />
        </ConfigProvider>
      </Sider>

      <ConfigProvider
        theme={{
          components: {
            Layout: {
              siderBg: "rgb(244, 244, 244)",
            },
          },
        }}
      >
        <Layout>
          <Header
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "#F5F5F5",
              display: "flex",
              justifyContent: "space-between", // Logo trái, User/Avatar phải
              alignItems: "center",
              width: "100%",
              zIndex: 100,
              padding: screens.lg ? "0 50px" : "0 10px", // Giảm padding khi responsive
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            {/* Left Section: Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src="/image/yourvibes_black.png"
                alt="YourVibes"
                style={{ height: "40px", cursor: "pointer" }}
                onClick={() => router.push("/home")}
              />
            </div>

            {/* Center Section: Navigation Tabs (chỉ hiển thị ở giữa khi full-screen) */}
            {screens.lg && (
              <div
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#ccc",
                  borderRadius: "20px",
                  padding: "5px 10px",
                  display: "inline-flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  {headerNavItems.map((item) => {
                    const isActive = isActived(item.link);
                    return (
                      <div
                        key={item.label}
                        onClick={() => handleItemClick(item.link)}
                        style={{
                          padding: "10px 20px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          color: isActive ? "#1DA1F2" : "#000",
                          borderBottom: isActive ? "2px solid #1DA1F2" : "none",
                          transition: "color 0.3s, border-bottom 0.3s",
                          lineHeight: "1.5",
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Right Section: User Name and Avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <div
                className="flex flex-row items-center gap-4 pl-2"
                onClick={handleMenuClick}
                style={{ cursor: "pointer" }}
              >
                <span className="font-bold md:block hidden">
                  {user?.family_name} {user?.name}
                </span>
                <Avatar src={user?.avatar_url} alt={user?.name} size={40} />
              </div>
              {/* <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: "20px", marginRight: "16px" }}
              /> */}
            </div>
          </Header>
          {/* Navigation Tabs khi responsive (dưới Header) */}
          {!screens.lg && (
            <div
              style={{
                width: "100%",
                maxWidth: "600px",
                backgroundColor: "#ccc",
                borderRadius: "20px",
                padding: "5px 10px",
                display: "inline-flex",
                justifyContent: "center",
                margin: "10px auto", // Căn giữa và thêm khoảng cách
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                {headerNavItems.map((item) => {
                  const isActive = isActived(item.link);
                  return (
                    <div
                      key={item.label}
                      onClick={() => handleItemClick(item.link)}
                      style={{
                        padding: "10px 20px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        color: isActive ? "#1DA1F2" : "#000",
                        borderBottom: isActive ? "2px solid #1DA1F2" : "none",
                        transition: "color 0.3s, border-bottom 0.3s",
                        lineHeight: "1.5",
                      }}
                    >
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <Content
            style={{
              marginLeft: screens.lg ? 250 : 0,
            }}
          >
            <div
              style={{
                alignItems: "center",
                marginLeft: screens.lg ? 70 : 0,
              }}
            >
              {children}
            </div>
          </Content>
        </Layout>
      </ConfigProvider>

      {settingModal && (
        <Modal
          open={settingModal}
          onCancel={() => setSettingModal(false)}
          footer={null}
          width={500}
          centered
          title={
            <span className="font-bold">{localStrings.Public.Settings}</span>
          }
        >
          <SettingsTab setSettingModal={setSettingModal} />
        </Modal>
      )}

      {notificationModal && (
        <Modal
          open={notificationModal}
          onCancel={() => setNotificationModal(false)}
          footer={null}
          width={700}
          height={700}
          centered
          title={
            <span className="font-bold">
              {localStrings.Notification.Notification}
            </span>
          }
          bodyStyle={{ maxHeight: "70vh", overflow: "auto" }}
        >
          <NotificationScreen
            setNotificationModal={setNotificationModal}
            notificationModal={notificationModal}
          />
        </Modal>
      )}
    </Layout>
  );
};

export default MainLayout;
