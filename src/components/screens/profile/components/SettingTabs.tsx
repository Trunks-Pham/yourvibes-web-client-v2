"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Sử dụng `next/navigation` thay vì `next/router
import { Button, ConfigProvider, Modal, Radio, Space, Switch } from "antd";
import { useAuth } from "@/context/auth/useAuth";
import ChangePassword from "../../changePassword/views/changePassword";
import useColor from "@/hooks/useColor";

const SettingsTab = ({
  setSettingModal,
}: {
  setSettingModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const {
    onLogout,
    changeLanguage,
    language,
    localStrings,
    theme,
    changeTheme,
  } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const { backgroundColor, brandPrimary, brandPrimaryTap } = useColor();

  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleOk = () => {
    setSettingModal(false);
    setShowLogout(false);
    onLogout();
  };

  const handleLogout = () => {
    setShowLogout(true);
  };

  const handleProfileEdit = () => {
    setSettingModal(false);
    router.push("/updateProfile");
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorBgContainer: backgroundColor,
            colorPrimary: brandPrimary,
            colorPrimaryHover: brandPrimaryTap,
          },
        },
      }}
    >
      <div className="flex flex-col space-y-4 p-5 justify-center items-center">
        <Button
          className="w-full text-brandPrimary border-none"
          onClick={handleProfileEdit}
        >
          {localStrings.Public.EditProfile}
        </Button>

        <Button
          className="w-full text-brandPrimary border-none"
          onClick={() => {
            setShowChangePassword(true);
          }}
        >
          {localStrings.Public.ChangePassword}
        </Button>
        {/* //modal change password  */}
        <Modal
          centered
          title={localStrings.Public.ChangePassword}
          open={showChangePassword}
          onCancel={() => {
            setShowChangePassword(false);
          }}
          footer={null}
        >
          <ChangePassword setShowChangePassword={setShowChangePassword} />
        </Modal>
        <div className="text-brandPrimary">
          {localStrings.Public.Language}{" "}
          {language === "vi"
            ? localStrings.Public.Vietnamese
            : localStrings.Public.English}{" "}
          <Switch style={{marginLeft:5}} defaultChecked onChange={changeLanguage} />
        </div>

        <div className="text-brandPrimary">
          {localStrings.Public.Theme}{" "}
          {theme === "light"
            ? localStrings.Public.LightMode
            : localStrings.Public.DarkMode}
          <Switch
          style={{marginLeft:5}}
            checked={theme === "dark"}
            onChange={(checked) => changeTheme?.(checked ? "dark" : "light")}
          />
        </div>

        <Button
          className="w-full text-brandPrimary border-none"
          onClick={handleLogout}
        >
          {localStrings.Public.LogOut}
        </Button>
        {/* //modal logout  */}
        <Modal
          centered
          title={localStrings.Public.Confirm}
          open={showLogout}
          onOk={handleOk}
          onCancel={() => setShowLogout(false)}
          okText={localStrings.Public.Confirm}
          cancelText={localStrings.Public.Cancel}
        >
          <div>
            <text>{localStrings.Public.LogoutConfirm}</text>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default SettingsTab;
