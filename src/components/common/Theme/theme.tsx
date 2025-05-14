"use client"

import useColor from "@/hooks/useColor"
import { ConfigProvider } from "antd";
import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const {brandPrimary, backGround, backgroundColor, borderColor } = useColor();

    useEffect(() => {
      document.body.style.backgroundColor = backGround;
  }, [backGround]);

    return (
        <ConfigProvider
        theme={{
          token: {   colorPrimary: brandPrimary,
          colorBorder: borderColor,
          colorBgBase: borderColor,
           },
          components: {
            Select: {
              optionSelectedColor: brandPrimary,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    )
}