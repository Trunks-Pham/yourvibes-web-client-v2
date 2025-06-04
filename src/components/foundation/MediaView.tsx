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
}

const MediaView: React.FC<MediaViewProps> = React.memo(({ mediaItems }) => {
  const { lightGray } = useColor();
  const videoRefs = useRef<Record<string, React.RefObject<ReactPlayer | null>>>({});
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [userPaused, setUserPaused] = useState<Record<string, boolean>>({});
  const [systemPaused, setSystemPaused] = useState<Record<string, boolean>>({});
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({});

  // IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const updatedVisibility: Record<string, boolean> = {};
        entries.forEach((entry) => {
          const key = entry.target.getAttribute("data-key");
          if (key) {
            const isVisible = entry.intersectionRatio >= 0.4;
            updatedVisibility[key] = isVisible;

            setSystemPaused((prev) => ({
              ...prev,
              [key]: !isVisible, // true nếu nhỏ hơn 40% (tức là cần system pause)
            }));

            if (isVisible) {
              // Khi video cuộn vào lại, reset userPaused để cho phép play tiếp
              setUserPaused((prev) => ({
                ...prev,
                [key]: false,
              }));
            }
          }
        });
        setVisibleMap((prev) => ({ ...prev, ...updatedVisibility }));
      },
      {
        threshold: [0, 0.4, 1],
      }
    );

    Object.entries(containerRefs.current).forEach(([key, el]) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mediaItems]);

  // Effect điều khiển play/pause
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([key, ref]) => {
      const player = ref?.current?.getInternalPlayer?.();
      if (!player || typeof player.pause !== "function" || typeof player.play !== "function") return;

      if (systemPaused[key]) {
        player.pause();
      } else if (!userPaused[key]) {
        player.play().catch(() => {});
      }
    });
  }, [systemPaused, userPaused]);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    customPaging: () => (
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

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      <Slider {...settings}>
        {mediaItems?.map((media, index) => {
          const isVideo = media?.media_url?.endsWith(".mp4") || media?.media_url?.endsWith(".mov");
          const key = media.id || String(index);

          if (isVideo && !videoRefs.current[key]) {
            videoRefs.current[key] = React.createRef<ReactPlayer>();
          }

          return (
            <div
              key={key}
              ref={(el) => { containerRefs.current[key] = el; }}
              data-key={key}
              style={{ width: "100%", height: "100%" }}
            >
              {isVideo ? (
                <ReactPlayer
                  ref={videoRefs.current[key]}
                  url={media?.media_url || ""}
                  controls
                  loop
                  playing={!systemPaused[key] && !userPaused[key]}
                  width="100%"
                  height="100%"
                  style={{ maxWidth: "100%", objectFit: "cover" }}
                  onPause={() =>
                    setUserPaused((prev) => ({ ...prev, [key]: true }))
                  }
                  onPlay={() =>
                    setUserPaused((prev) => ({ ...prev, [key]: false }))
                  }
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
