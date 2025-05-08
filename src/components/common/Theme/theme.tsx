"use client"

import useColor from "@/hooks/useColor"
import { ConfigProvider } from "antd";
import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const {brandPrimary, backGround, backgroundColor } = useColor();

    useEffect(() => {
      document.body.style.backgroundColor = backGround;
  }, [backGround]);

    return (
        <ConfigProvider
        theme={{
          token: { colorPrimary: brandPrimary,
           },
          components: {
            Select: {
              optionSelectedColor: "#fff",
            },
            Notification: {
              colorBgElevated: "#555555", // nền notification
              colorText: brandPrimary,       // màu chữ
              colorBgBlur: "#555555", // nền blur
              colorBgBase: "red", // nền chính
              colorBgContainer: "red", // nền container
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    )
}