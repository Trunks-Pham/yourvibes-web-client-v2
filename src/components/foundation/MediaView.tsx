import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useColor from "@/hooks/useColor";
import { PostMediaModel } from "@/api/features/post/models/PostResponseModel";
import ReactPlayer from "react-player";
import { Image } from "antd";

interface MediaViewProps {
  mediaItems: PostMediaModel[];
  isVisible?: boolean;
}

const MediaView: React.FC<MediaViewProps> = React.memo(({ mediaItems, isVisible = true }) => {
  const { brandPrimary, lightGray } = useColor();
  const videoRefs = useRef<Record<string, React.RefObject<ReactPlayer | null>>>({});
  const [playingState, setPlayingState] = useState<Record<string, boolean>>({});

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    customPaging: (i: number) => (
      <div
        style={{
          backgroundColor: lightGray,
          width: 10,
          height: 10,
          borderRadius: "50%",
        }}
      />
    ),
    dotsClass: "slick-dots",
  };

  // Cập nhật trạng thái playing khi isVisible thay đổi (chỉ nếu người dùng chưa dừng thủ công)
  useEffect(() => {
    mediaItems.forEach((media, index) => {
      const key = media.id || String(index);
      setPlayingState((prev) => ({
        ...prev,
        [key]: isVisible, // auto-play nếu isVisible
      }));
    });
  }, [isVisible, mediaItems]);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      <Slider {...settings}>
        {mediaItems?.map((media, index) => {
          const isVideo =
            media?.media_url?.endsWith(".mp4") ||
            media?.media_url?.endsWith(".mov");

          const key = media.id || String(index);
          if (isVideo && !videoRefs.current[key]) {
            videoRefs.current[key] = React.createRef<ReactPlayer>();
          }

          return (
            <div key={key}>
              {isVideo ? (
                <ReactPlayer
                  ref={videoRefs.current[key]}
                  url={media?.media_url || ""}
                  controls
                  loop
                  playing={playingState[key] ?? isVisible}
                  width="100%"
                  height="100%"
                  style={{ maxWidth: "100%", objectFit: "cover" }}
                  onPause={() => {
                    setPlayingState((prev) => ({
                      ...prev,
                      [key]: false,
                    }));
                  }}
                  onPlay={() => {
                    setPlayingState((prev) => ({
                      ...prev,
                      [key]: true,
                    }));
                  }}
                />
              ) : (
                <Image
                  src={media?.media_url || ""}
                  alt={`media-${index}`}
                  style={{ width: "100%", objectFit: "cover" }}
                  width="100%"
                  preview={{ mask: null }}
                  className="hover:cursor-pointer"
                />
              )}
            </div>
          );
        })}
      </Slider>
    </div>
  );
});

export default MediaView;
