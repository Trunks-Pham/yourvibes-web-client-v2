import { PostProvider } from "@/context/post/usePostContext";
import { AuthProvider } from "../context/auth/useAuth";
import { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import { ConfigProvider } from "antd";
import { WebSocketProvider } from "@/context/socket/useSocket";
import useColor from "@/hooks/useColor";
import ThemeProvider from "@/components/common/Theme/theme";

export const metadata: Metadata = {
  title: "YourVibes",
  description: "...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AntdRegistry>
        <AuthProvider>
          <WebSocketProvider>
            <PostProvider>
              <ThemeProvider>
                <body>{children}</body>
              </ThemeProvider>
            </PostProvider>
          </WebSocketProvider>
        </AuthProvider>
      </AntdRegistry>
    </html>
  );
}
