import { UpdateProfileRequestModel } from "@/api/features/profile/model/UpdateProfileModel";
import {
  defaultProfileRepo,
  ProfileRepo,
} from "@/api/features/profile/ProfileRepository";
import { useAuth } from "@/context/auth/useAuth";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const UpdateProfileViewModel = (repo: ProfileRepo) => {
  const [loading, setLoading] = useState(false);
  const { localStrings, onUpdateProfile } = useAuth();
  const router = useRouter();
  const [objectPosition, setObjectPosition] = useState("center");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [newAvatar, setNewAvatar] = useState<{
    url: string;
    name: string;
    type: string;
    file?: File;
  }>({ url: "", name: "", type: "" });
  const [newCapwall, setNewCapwall] = useState<{
    url: string;
    name: string;
    type: string;
    file?: File;
  }>({ url: "", name: "", type: "" });

  //update Profile
  const updateProfile = async (data: UpdateProfileRequestModel) => {
    try {
      setLoading(true);
      const response = await defaultProfileRepo.updateProfile(data);

      if (!response?.error) {
        onUpdateProfile(response?.data);
        message.success(localStrings.UpdateProfile.UpdateSuccess);
        router.push("/profile?tab=info");
        localStorage.setItem("capwallPosition", objectPosition);
        setNewAvatar({ url: "", name: "", type: "" });
        setNewCapwall({ url: "", name: "", type: "" });
        // Lấy dữ liệu từ form và chuẩn bị các trường ảnh
      } else {
        message.error(localStrings.UpdateProfile.UpdateFailed);
      }
    } catch (error: any) {
      console.error(error);
         message.error("Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollPercent = scrollTop / (scrollHeight - clientHeight);
      const positionValue = `${Math.min(
        Math.max(scrollPercent * 100, 0),
        100
      )}%`;
      setObjectPosition(`center ${positionValue}`);
    }
  };

  return {
    loading,
    updateProfile,
    handleScroll,
    scrollContainerRef,
    objectPosition,
    setObjectPosition,
    newAvatar,
    setNewAvatar,
    newCapwall,
    setNewCapwall,
  };
};

export default UpdateProfileViewModel;
