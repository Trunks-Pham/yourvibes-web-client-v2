"use client"

import useColor from "@/hooks/useColor"
import { ConfigProvider } from "antd";
import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const {brandPrimary, backGround } = useColor();

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
          },
        }}
      >
        {children}
      </ConfigProvider>
    )
}