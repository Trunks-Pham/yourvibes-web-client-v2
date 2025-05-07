"use client"

import useColor from "@/hooks/useColor"
import { ConfigProvider } from "antd";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const {brandPrimary } = useColor();

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