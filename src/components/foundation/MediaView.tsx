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
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting && entry.intersectionRatio === 1) {
            setPlayingIndex(index);
          }
        });
      },
      {
        threshold: 1.0, // chỉ khi video hiển thị 100%
      }
    );

    videoRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [mediaItems]);

  const settings = {
    dots: true,
    infinite: false,
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

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      <Slider {...settings}>
        {mediaItems?.map((media, index) => {
          const isVideo =
            media?.media_url?.endsWith(".mp4") ||
            media?.media_url?.endsWith(".mov");

          return (
            <div
              key={index}
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              data-index={index}
              style={{ minHeight: "300px" }} // đảm bảo có kích thước
            >
              {isVideo ? (
                <ReactPlayer
                  url={media.media_url}
                  playing={playingIndex === index}
                  controls
                  loop
                  muted
                  width="100%"
                  height="100%"
                />
              ) : (
                <Image
                  src={media.media_url}
                  alt={`media-${index}`}
                  style={{ width: "100%", objectFit: "cover" }}
                  width="100%"
                  preview={false}
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
