"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AuthContextType } from "./authContextType";
import { VnLocalizedStrings } from "@/utils/localizedStrings/vietnam";
import { ENGLocalizedStrings } from "@/utils/localizedStrings/english";
import translateLanguage from "../../utils/i18n/translateLanguage";
import { useRouter } from "next/navigation";
import { UserModel } from "../../api/features/authenticate/model/LoginModel";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [localStrings, setLocalStrings] = useState(VnLocalizedStrings);
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [user, setUser] = useState<UserModel | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  const checkLanguage = () => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage === "vi") {
      setLanguage("vi");
      setLocalStrings(VnLocalizedStrings);
    } else {
      setLanguage("en");
      setLocalStrings(ENGLocalizedStrings);
    }
  };

  const changeLanguage = () => {
    const lng = language === "vi" ? "en" : "vi";
    translateLanguage(lng).then(() => {
      localStorage.setItem("language", lng);
      setLanguage(lng);
      setLocalStrings(lng === "vi" ? VnLocalizedStrings : ENGLocalizedStrings);
    });
  };

  const onLogin = (user: any) => {
    localStorage.setItem("user", JSON.stringify(user.user));
    localStorage.setItem("accesstoken", user.access_token);

    // Giải mã access_token để lấy thời gian hết hạn
    const decodedToken: any = jwtDecode(user.access_token);
    const expiresAt = new Date(decodedToken.exp * 1000); // Chuyển đổi từ giây sang mili giây
    document.cookie = `accesstoken=${user.access_token}; path=/; ${
      window.location.protocol === 'http:' 
        ? 'SameSite=Lax' 
        : 'SameSite=None; Secure'
    }; expires=${expiresAt.toUTCString()}`;
    
    

    setIsAuthenticated(true);
    setUser(user.user);
    router.push("/home");
  };

  const onUpdateProfile = (user: any) => {
    localStorage.removeItem("user");
    localStorage.setItem("user", JSON.stringify(user));
    setIsAuthenticated(true);
    setUser(user);
  };

  const onLogout = async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accesstoken");
    document.cookie =
      "accesstoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  const isLoginUser = (userId: string) => {
    return user?.id === userId;
  };

  useEffect(() => {
    checkLanguage();
  }, [language]);

  useEffect(() => {
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem("user");
      const storedAccessToken = localStorage.getItem("accesstoken");

      try {
        if (storedUser && storedAccessToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("user"); // Xóa dữ liệu lỗi nếu có
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        onLogin,
        onLogout,
        localStrings,
        changeLanguage,
        language,
        setLanguage,
        isAuthenticated,
        user,
        onUpdateProfile,
        isLoginUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
