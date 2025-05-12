"use client"
import { useAuth } from "@/context/auth/useAuth"
import { useEffect, useState } from "react";

export const Color = {
  black: "#000000",
  white: "#ffffff",
  darkGray: "#494949",
  lightGray: "#E2E2E2",
  veryLightGray: "#F6F6F6",
  lightPink: "#FFCCFF",
  limeGreen: "#32CD32",
  charcoalBlue: "#262930",
  gunmetal: "#202427",
  steelGray: "#62676B",
  darkSlate: "#31343B",
  grayD: "#2D3037",
  
  blue: "#1890ff",
  blue2: "#40a9ff",
  blue3: "#177ddc",
  blue4: "#40a9ff",
  blue5: "#1f6bb4",
  darkBlue: "#2f3f5c",
  darkBlue2: "#153450",
  lightBlue: "#e0f0ff",
  lightBlue2: "#e6f7ff",
  
  gray: "#62676B",
  gray2: "#E2E2E2",
  gray3: "#f0f2f5",
  gray4: "#f5f5f5",
  gray5: "#fafafa",
  gray6: "#d9d9d9",
  gray7: "#e8e8e8",
  gray8: "#a0a0a0",
  gray9: "#65676B",
  
  darkMode: {
    background1: "#262930",
    background2: "#202427",
    background3: "#141414",
    background4: "#1f1f1f",
    background5: "#2d2d30",
    background6: "#3e3e42",
    background7: "#4e4e52",
    background8: "#2c3033",
    background9: "#31343B",
    border1: "#434343",
    border2: "#3e3e42",
    border3: "#62676B",
  },
  
  warning: "#faad14",
  error: "#ff4d4f",
  error2: "#ff7875", 
  success: "#52c41a",
  success2: "#73d13d",
  
  notification: {
    light: {
      error: {
        bg: "#fff2f0",
        border: "#ffccc7",
        text: "#ff4d4f"
      },
      warning: {
        bg: "#fffbe6",
        border: "#ffe58f",
        text: "#faad14"
      },
      info: {
        bg: "#e6f7ff",
        border: "#91d5ff",
        text: "#1890ff"
      },
      success: {
        bg: "#f6ffed",
        border: "#b7eb8f",
        text: "#52c41a"
      }
    },
    dark: {
      error: {
        bg: "#2a1215",
        border: "#5c2223",
        text: "#ff7875"
      },
      warning: {
        bg: "#2b2111",
        border: "#594214",
        text: "#faad14"
      },
      info: {
        bg: "#111d2c",
        border: "#153450",
        text: "#40a9ff"
      },
      success: {
        bg: "#162312",
        border: "#274916",
        text: "#73d13d"
      }
    }
  }
}

const useColor = () => {
  const { theme } = useAuth();
  const [backGround, setBackground] = useState(Color.veryLightGray);
  const [brandPrimary, setBrandPrimary] = useState(Color.black);
  const [brandPrimaryTap, setBrandPrimaryTap] = useState(Color.darkGray);
  const [backgroundColor, setBackgroundColor] = useState(Color.white);
  const [menuItem, setMenuItem] = useState(Color.white);
  const lightGray = Color.lightGray
  const darkGray = Color.darkGray
  const borderBirth = Color.lightPink
  const colorOnl = Color.limeGreen
  const borderColor = Color.steelGray
  const darkSlate = Color.darkSlate
  const [backgroundAddPost, setBackgroundAddPost] = useState(Color.white);

  const [messageBubble, setMessageBubble] = useState({
    sender: {
      background: Color.lightBlue,
      color: Color.black,
      timestampColor: "#003366",
    },
    receiver: {
      background: Color.gray2,
      color: "inherit",
      timestampColor: "rgba(0, 0, 0, 0.85)",
    }
  });

  const [layout, setLayout] = useState({
    background: Color.white,
    siderBg: Color.veryLightGray,
    headerBg: Color.white,
    border: Color.gray2,
    activeItem: Color.gray2,
  });

  const [text, setText] = useState({
    primary: Color.black,
    secondary: "rgba(0, 0, 0, 0.45)",
  });

  const [icons, setIcons] = useState({
    primary: Color.black,
    secondary: "rgba(0, 0, 0, 0.65)",
    action: Color.blue,
    delete: Color.darkBlue,
  });

  const [sidebar, setSidebar] = useState({
    text: Color.black,
    secondaryText: "rgba(0, 0, 0, 0.45)",
  });

  const [avatar, setAvatar] = useState(Color.blue);

  const [button, setButton] = useState({
    defaultBg: Color.white,
    defaultBorder: Color.gray6,
    defaultText: "rgba(0, 0, 0, 0.85)",
    defaultHoverBg: Color.gray5,
    primaryBg: Color.blue,
    primaryText: Color.white,
    primaryHoverBg: Color.blue2
  });

  const [dateSeparator, setDateSeparator] = useState({
    background: Color.gray3,
    line: "rgba(0, 0, 0, 0.1)",
    text: Color.gray9,
  });

  const [search, setSearch] = useState({
    background: Color.white,
    textColor: "rgba(0, 0, 0, 0.85)",
    placeholderColor: "rgba(0, 0, 0, 0.45)",
    borderColor: Color.gray6,
    buttonBackground: Color.white,
    buttonHoverBackground: Color.gray4,
    iconColor: "rgba(0, 0, 0, 0.45)"
  });

  const [indicators, setIndicators] = useState({
    normal: "rgba(0, 0, 0, 0.45)",
    warning: Color.warning,
    error: Color.error
  });

  const [dropdown, setDropdown] = useState({
    background: Color.white,
    itemHover: Color.gray4,
    borderColor: Color.gray6,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    textColor: Color.black,
    dangerColor: Color.error,
    dangerHoverBg: "#fff1f0"
  });

  const [modal, setModal] = useState({
    background: Color.white,
    headerBg: Color.white,
    footerBg: Color.white,
    titleColor: Color.black,
    borderColor: Color.gray7,
    boxShadow: "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)",
    maskBg: "rgba(0, 0, 0, 0.45)"
  });

  const [upload, setUpload] = useState({
    background: Color.gray5,
    hoverBg: Color.gray4,
    borderColor: Color.gray6,
    textColor: "rgba(0, 0, 0, 0.85)",
    iconColor: Color.blue
  });

  const [input, setInput] = useState({
    background: Color.white,
    borderColor: Color.gray6,
    hoverBorderColor: Color.blue2,
    placeholderColor: "rgba(0, 0, 0, 0.45)",
    textColor: "rgba(0, 0, 0, 0.85)"
  });

  const [notification, setNotification] = useState(Color.notification.light);

  useEffect(() => {
    if (theme === "dark") {
      setBrandPrimary(Color.white);
      setBrandPrimaryTap(Color.lightGray);
      setBackgroundColor(Color.gunmetal);
      setBackground(Color.charcoalBlue);
      setMenuItem(Color.darkSlate);
      setBackgroundAddPost(Color.grayD);
      
      setMessageBubble({
        sender: {
          background: Color.darkBlue,
          color: Color.white,
          timestampColor: "rgba(255, 255, 255, 0.9)",
        },
        receiver: {
          background: Color.gray,
          color: Color.white,
          timestampColor: "rgba(255, 255, 255, 0.85)",
        }
      });
      
      setLayout({
        background: Color.charcoalBlue,
        siderBg: Color.gunmetal,
        headerBg: Color.gunmetal,
        border: Color.steelGray,
        activeItem: Color.darkSlate,
      });
      
      setText({
        primary: Color.white,
        secondary: "rgba(255, 255, 255, 0.85)",
      });
      
      setIcons({
        primary: Color.white,
        secondary: "rgba(255, 255, 255, 0.85)",
        action: Color.blue4,
        delete: Color.white,
      });
      
      setSidebar({
        text: Color.white,
        secondaryText: "#e0e0e0",
      });
      
      setAvatar(Color.white);
      
      setButton({
        defaultBg: Color.darkMode.background3,
        defaultBorder: Color.darkMode.border1,
        defaultText: "rgba(255, 255, 255, 0.85)",
        defaultHoverBg: Color.darkMode.background4,
        primaryBg: Color.blue3,
        primaryText: Color.white,
        primaryHoverBg: Color.blue5
      });
      
      setDateSeparator({
        background: Color.charcoalBlue,
        line: "rgba(255, 255, 255, 0.1)",
        text: Color.gray8,
      });
      
      setSearch({
        background: Color.darkMode.background5,
        textColor: "rgba(255, 255, 255, 0.85)",
        placeholderColor: "rgba(255, 255, 255, 0.45)",
        borderColor: Color.darkMode.border2,
        buttonBackground: Color.darkMode.border2,
        buttonHoverBackground: Color.darkMode.background7,
        iconColor: "rgba(255, 255, 255, 0.65)"
      });
      
      setIndicators({
        normal: "rgba(255, 255, 255, 0.65)",
        warning: Color.warning,
        error: Color.error
      });
      
      setDropdown({
        background: Color.gunmetal,
        itemHover: Color.darkMode.background8,
        borderColor: Color.darkMode.border1,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.45)",
        textColor: Color.white,
        dangerColor: Color.error2,
        dangerHoverBg: "#2a1215"
      });
      
      setModal({
        background: Color.gunmetal,
        headerBg: Color.gunmetal,
        footerBg: Color.gunmetal,
        titleColor: Color.white,
        borderColor: Color.darkMode.border1,
        boxShadow: "0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 6px 16px 0 rgba(0, 0, 0, 0.32)",
        maskBg: "rgba(0, 0, 0, 0.65)"
      });
      
      setUpload({
        background: Color.darkMode.background3,
        hoverBg: Color.darkMode.background4,
        borderColor: Color.darkMode.border1,
        textColor: "rgba(255, 255, 255, 0.85)",
        iconColor: Color.blue3
      });
      
      setInput({
        background: Color.darkMode.background3,
        borderColor: Color.darkMode.border1,
        hoverBorderColor: Color.blue3,
        placeholderColor: "rgba(255, 255, 255, 0.45)",
        textColor: "rgba(255, 255, 255, 0.85)"
      });
      
      setNotification(Color.notification.dark);
      
    } else { // light
      setBrandPrimary(Color.black);
      setBrandPrimaryTap(Color.darkGray);
      setBackgroundColor(Color.white);
      setBackground(Color.veryLightGray);
      setMenuItem(Color.lightGray);
      setBackgroundAddPost(Color.white);
      
      setMessageBubble({
        sender: {
          background: Color.lightBlue,
          color: Color.black,
          timestampColor: "#003366",
        },
        receiver: {
          background: Color.gray2,
          color: "inherit",
          timestampColor: "rgba(0, 0, 0, 0.85)",
        }
      });
      
      setLayout({
        background: Color.white,
        siderBg: Color.veryLightGray,
        headerBg: Color.white,
        border: Color.gray2,
        activeItem: Color.gray2,
      });
      
      setText({
        primary: Color.black,
        secondary: "rgba(0, 0, 0, 0.45)",
      });
      
      setIcons({
        primary: Color.black,
        secondary: "rgba(0, 0, 0, 0.65)",
        action: Color.blue,
        delete: Color.darkBlue,
      });
      
      setSidebar({
        text: Color.black,
        secondaryText: "rgba(0, 0, 0, 0.45)",
      });
      
      setAvatar(Color.blue);
      
      setButton({
        defaultBg: Color.white,
        defaultBorder: Color.gray6,
        defaultText: "rgba(0, 0, 0, 0.85)",
        defaultHoverBg: Color.gray5,
        primaryBg: Color.blue,
        primaryText: Color.white,
        primaryHoverBg: Color.blue2
      });
      
      setDateSeparator({
        background: Color.gray3,
        line: "rgba(0, 0, 0, 0.1)",
        text: Color.gray9,
      });
      
      setSearch({
        background: Color.white,
        textColor: "rgba(0, 0, 0, 0.85)",
        placeholderColor: "rgba(0, 0, 0, 0.45)",
        borderColor: Color.gray6,
        buttonBackground: Color.white,
        buttonHoverBackground: Color.gray4,
        iconColor: "rgba(0, 0, 0, 0.45)"
      });
      
      setIndicators({
        normal: "rgba(0, 0, 0, 0.45)",
        warning: Color.warning,
        error: Color.error
      });
      
      setDropdown({
        background: Color.white,
        itemHover: Color.gray4,
        borderColor: Color.gray6,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        textColor: Color.black,
        dangerColor: Color.error,
        dangerHoverBg: "#fff1f0"
      });
      
      setModal({
        background: Color.white,
        headerBg: Color.white,
        footerBg: Color.white,
        titleColor: Color.black,
        borderColor: Color.gray7,
        boxShadow: "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)",
        maskBg: "rgba(0, 0, 0, 0.45)"
      });
      
      setUpload({
        background: Color.gray5,
        hoverBg: Color.gray4,
        borderColor: Color.gray6,
        textColor: "rgba(0, 0, 0, 0.85)",
        iconColor: Color.blue
      });
      
      setInput({
        background: Color.white,
        borderColor: Color.gray6,
        hoverBorderColor: Color.blue2,
        placeholderColor: "rgba(0, 0, 0, 0.45)",
        textColor: "rgba(0, 0, 0, 0.85)"
      });
      
      setNotification(Color.notification.light);
    }
  }, [theme]);

  return {
    theme,
    brandPrimary,
    brandPrimaryTap,
    backgroundColor,
    lightGray,
    borderBirth,
    colorOnl,
    backGround,
    borderColor,
    menuItem,
    darkSlate,
    darkGray,
    backgroundAddPost,

    messageBubble,
    layout,
    text,
    icons,
    sidebar,
    avatar,
    button,
    dateSeparator,
    search,
    indicators,
    dropdown,
    modal,
    upload,
    input,
    notification
  }
}

export default useColor