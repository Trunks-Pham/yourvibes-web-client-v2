import React, { useCallback, useEffect, useState } from "react";
import useColor from "@/hooks/useColor";
import Post from "@/components/common/post/views/Post";
import { useAuth } from "@/context/auth/useAuth";
import AdsViewModel from "../viewModel/AdsViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import { DateTransfer, getDayDiffAds } from "@/utils/helper/DateTransfer";
import { CurrencyFormat } from "@/utils/helper/CurrencyFormat";
import dayjs from "dayjs";
import { AdsCalculate } from "@/utils/helper/AdsCalculate";
import { MdDateRange } from "react-icons/md";
import { FaCashRegister, FaAd } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Spin, Button, List, DatePicker, Typography, Modal, Input, message, ConfigProvider } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Text } = Typography;

const Ads = ({ postId }: { postId: string }) => {
  const price = 30000;
  const { brandPrimary, brandPrimaryTap, backgroundColor, menuItem, borderColor, darkGray, colorOnl } = useColor();
  const [method, setMethod] = useState("momo");
  const [showCampaign, setShowCampaign] = useState(false);
  const { language, localStrings } = useAuth();
  const [diffDay, setDiffDay] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const router = useRouter();
  const {
    getPostDetail,
    post,
    loading,
    advertisePost,
    adsLoading,
    getAdvertisePost,
    page,
    ads,
    adsAll,
  } = AdsViewModel(defaultPostRepo);

  // Khởi tạo ngày bắt đầu là hôm nay và ngày kết thúc là hôm nay + 1
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const today = new Date();
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    return nextDay;
  });

  const paymentMethods = [
    {
      id: "momo",
      name: "MoMo",
      image: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
    },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getPostDetail(postId);
      await getAdvertisePost(page, postId);
    } finally {
      setRefreshing(false);
    }
  }, [postId, page]);

  useEffect(() => {
    if (postId) {
      getPostDetail(postId);
      getAdvertisePost(page, postId);
    }
  }, [postId]);

  // Tính toán số ngày giữa startDate và endDate
  useEffect(() => {
    const diffTime = endDate.getTime() - startDate.getTime();
    const dayDiff = Math.ceil(diffTime / (1000 * 3600 * 24));
    setDiffDay(dayDiff > 0 ? dayDiff : 1);
  }, [startDate, endDate]);

  const handleStartDateChange = (selectedDate: dayjs.Dayjs | null) => {
    if (selectedDate) {
      const newStartDate = selectedDate.toDate();
      setStartDate(newStartDate);
      // Đảm bảo endDate không nhỏ hơn startDate
      if (newStartDate > endDate) {
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 1);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (selectedDate: dayjs.Dayjs | null) => {
    if (selectedDate) {
      const newEndDate = selectedDate.toDate();
      setEndDate(newEndDate);
    }
  };

  const chartData = {
    labels: ads?.statistics?.map((stat) => dayjs(stat.aggregation_date).format("HH:mm:ss DD/MM")) || [],
    datasets: [
      {
        label: `${localStrings.Ads.Click}`,
        data: ads?.statistics?.map((stat) => stat.clicks) || [],
        borderColor: brandPrimary,
        backgroundColor: brandPrimary,
        fill: false,
        borderWidth: 3,
      },
      {
        label: `${localStrings.Ads.TotalReach}`,
        data: ads?.statistics?.map((stat) => stat.reach) || [],
        borderColor: colorOnl,
        backgroundColor: colorOnl,
        fill: false,
        borderWidth: 3,
      },
      {
        label: `${localStrings.Ads.TotalImpressions}`,
        data: ads?.statistics?.map((stat) => stat.impression) || [],
        borderColor: brandPrimaryTap,
        backgroundColor: brandPrimaryTap,
        fill: false,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: brandPrimary,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: menuItem,
        titleColor: brandPrimary,
        bodyColor: brandPrimary,
      },
    },
    scales: {
      x: {
        ticks: {
          color: brandPrimary,
        },
        grid: {
          color: borderColor,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: brandPrimary,
        },
        grid: {
          color: borderColor,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: brandPrimary,
      },
    },
  };

  const renderAds = useCallback(() => {
    if (loading) return <Spin style={{ color: brandPrimary }} />;
    const finalPrice = AdsCalculate(diffDay, price) * (1 - discount);
    return (
      <>
        {post?.is_advertisement ? (
          <>
            {/* Advertisement history */}
            <div style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    height: 10,
                    width: 10,
                    backgroundColor: colorOnl,
                    borderRadius: 5,
                    marginRight: 5,
                  }}
                />
                <span
                  style={{
                    fontSize: 16,
                    color: colorOnl,
                  }}
                >
                  {localStrings.Ads.ActiveCampaign}
                </span>
              </div>
              <div style={{ marginTop: 10 }}>
                <div
                  style={{
                    backgroundColor: menuItem,
                    borderRadius: 8,
                    padding: 10,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    className="flex flex-row justify-between items-center"
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: brandPrimary,
                    }}
                  >
                    <span>{localStrings.Ads.Campaign} #1</span>
                    <MdDateRange size={20} color={brandPrimary} />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <span
                      style={{
                        fontSize: 14,
                        color: brandPrimaryTap,
                      }}
                    >
                      <span style={{ fontWeight: "bold", color: brandPrimary }}>
                        {localStrings.Ads.StartDay}:
                      </span>{" "}
                      {DateTransfer(ads?.start_date)}
                    </span>
                    <br />
                    <span
                      style={{
                        fontSize: 14,
                        color: brandPrimaryTap,
                      }}
                    >
                      <span style={{ fontWeight: "bold", color: brandPrimary }}>
                        {localStrings.Ads.EndDay}:
                      </span>{" "}
                      {DateTransfer(ads?.end_date)}
                    </span>
                    <br />
                    <span
                      style={{
                        fontSize: 14,
                        color: brandPrimaryTap,
                      }}
                    >
                      <span style={{ fontWeight: "bold", color: brandPrimary }}>
                        {localStrings.Ads.RemainingTime}:
                      </span>{" "}
                      {ads?.day_remaining} {localStrings.Ads.Day}
                    </span>
                    <br />
                    <span
                      style={{
                        fontSize: 14,
                        color: brandPrimaryTap,
                      }}
                    >
                      <span style={{ fontWeight: "bold", color: brandPrimary }}>
                        {localStrings.Ads.Grant}:
                      </span>{" "}
                      {ads?.bill?.price ? CurrencyFormat(ads?.bill?.price) : "N/A"}
                    </span>
                    <br />
                    <span
                      style={{
                        fontSize: 14,
                        color: brandPrimaryTap,
                      }}
                    >
                      <span style={{ fontWeight: "bold", color: brandPrimary }}>
                        {localStrings.Ads.PaymentMethod}:
                      </span>{" "}
                      {method === "momo" ? "MoMo" : "Khác"}
                    </span>
                    <br />
                    <span
                      style={{
                        fontSize: 14,
                        color: brandPrimaryTap,
                      }}
                    >
                      <span style={{ fontWeight: "bold", color: brandPrimary }}>
                        {localStrings.Ads.Status}:
                      </span>{" "}
                      {ads?.bill?.status ? `${localStrings.Ads.PaymentSuccess}` : `${localStrings.Ads.PaymentFailed}`}
                    </span>
                  </div>
                  {/* Display Total Metrics */}
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <div style={{ marginRight: 20 }}>
                      <span style={{ fontSize: 14, color: brandPrimaryTap }}>{localStrings.Ads.Click}: </span>
                      <span style={{ fontWeight: "bold", color: brandPrimary }}>{ads?.total_clicks || 0} </span>
                    </div>
                    <div style={{ marginRight: 20 }}>
                      <span style={{ fontSize: 14, color: brandPrimaryTap }}>{localStrings.Ads.TotalReach}: </span>
                      <span style={{ fontWeight: "bold", color: brandPrimary }}>{ads?.total_reach || 0} </span>
                    </div>
                    <div>
                      <span style={{ fontSize: 14, color: brandPrimaryTap }}>{localStrings.Ads.TotalImpressions}: </span>
                      <span style={{ fontWeight: "bold", color: brandPrimary }}>{ads?.total_impression || 0} </span>
                    </div>
                  </div>
                  {/* Chart */}
                  {ads?.statistics && ads.statistics.length > 0 ? (
                    <div style={{ marginTop: 20 }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div style={{ marginTop: 20, textAlign: "center" }}>
                      <span style={{ color: brandPrimary }}>{localStrings.Ads.ErrorFetchingStatistics}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Advertisement Information */}
            <div style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10 }}>
              <div>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 5,
                    display: "block",
                    color: brandPrimary,
                  }}
                >
                  {localStrings.Ads.TimeAndBudget}
                </span>
                <span
                  style={{
                    color: brandPrimaryTap,
                    fontSize: 14,
                  }}
                >
                  VAT: 10%
                </span>
                <span
                  style={{
                    color: brandPrimaryTap,
                    fontSize: 14,
                    display: "block",
                  }}
                >
                  {localStrings.Ads.Minimum.replace("{{price}}", `${CurrencyFormat(price)}`)}
                </span>

                <span
                  style={{
                    color: brandPrimaryTap,
                    fontSize: 14,
                    display: "block",
                  }}
                >
                  {localStrings.Ads.LimitDay}
                </span>
              </div>

              {/* Select start date */}
              <div>
                <div className="flex flex-row mt-4 mb-2 items-center">
                  <MdDateRange size={24} color={brandPrimary} />
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      paddingLeft: 10,
                      color: brandPrimary,
                    }}
                  >
                    {localStrings.Ads.StartDay}
                  </span>
                </div>
                <DatePicker
                  format={"DD/MM/YYYY"}
                  value={dayjs(startDate)}
                  onChange={handleStartDateChange}
                  style={{ width: "100%", backgroundColor: menuItem, color: brandPrimary, borderColor: borderColor }}
                  disabledDate={(current) => {
                    if (current && current < dayjs().startOf("day")) {
                      return true;
                    }
                    return false;
                  }}
                />
              </div>

              {/* Select end date */}
              <div>
                <div className="flex flex-row mt-4 mb-2 items-center">
                  <MdDateRange size={24} color={brandPrimary} />
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      paddingLeft: 10,
                      color: brandPrimary,
                    }}
                  >
                    {localStrings.Ads.EndDay}
                  </span>
                </div>
                <DatePicker
                  format={"DD/MM/YYYY"}
                  value={dayjs(endDate)}
                  onChange={handleEndDateChange}
                  style={{ width: "100%", backgroundColor: menuItem, color: brandPrimary, borderColor: borderColor }}
                  disabledDate={(current) => {
                    if (current && current <= dayjs(startDate).endOf("day")) {
                      return true;
                    }
                    // Giới hạn không quá 30 ngày kể từ startDate
                    return current && current > dayjs(startDate).add(30, 'day');
                  }}
                />
              </div>

              {/* Budget */}
              <div className="flex mt-4 mb-2 items-center">
                <FaCashRegister size={24} color={brandPrimary} />
                <span style={{ paddingLeft: 10, color: brandPrimary }}>
                  {localStrings.Ads.BudgetAds} {CurrencyFormat(finalPrice)}{" "}
                  {discount > 0 && (
                    <span style={{ color: colorOnl }}>
                      ({localStrings.Ads.Discount} {discount * 100}%)
                    </span>
                  )}
                </span>
              </div>

              {/* Voucher Input */}
              <div style={{ marginTop: 20 }}>
                <span style={{ fontWeight: "bold", marginRight: 10, color: brandPrimary }}>
                  {localStrings.Ads.Voucher}
                </span>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Input
                    placeholder="voucher"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                    style={{ width: 200, marginRight: 10, backgroundColor: menuItem, color: brandPrimary, borderColor: borderColor }}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ marginTop: 20 }}>
                <span style={{ fontWeight: "bold", marginRight: 10, color: brandPrimary }}>
                  {localStrings.Ads.PaymentMethod}
                </span>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  {paymentMethods.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMethod(item.id)}
                      title={item.name}
                      style={{
                        borderWidth: 1,
                        borderColor: method === item.id ? colorOnl : borderColor,
                        backgroundColor: method === item.id ? `${colorOnl}20` : menuItem,
                        padding: 5,
                        marginRight: 10,
                        borderRadius: 10,
                      }}
                    >
                      <img src={item.image} style={{ width: 50, height: 50 }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* New Advertisement Button */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                <Button
                  type="primary"
                  icon={<FaAd style={{ color: backgroundColor }} />}
                  onClick={() => {
                    advertisePost({
                      post_id: postId,
                      redirect_url: `${window.location.origin}/ads/${postId}`,
                      start_date: dayjs(startDate).format("YYYY-MM-DD") + "T00:00:00Z",
                      end_date: dayjs(endDate).format("YYYY-MM-DD") + "T00:00:00Z",
                      voucher_code: voucher || undefined,
                    });
                  }}
                  style={{
                    borderRadius: 8,
                    backgroundColor: brandPrimary,
                    borderColor: brandPrimary,
                    color: backgroundColor,
                  }}
                  loading={adsLoading}
                >
                  {localStrings.Ads.Ads}
                </Button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }, [postId, adsLoading, ads, loading, post, startDate, endDate, voucher, discount, brandPrimary, brandPrimaryTap, backgroundColor, menuItem, borderColor, colorOnl]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            defaultBg: menuItem,
            defaultColor: brandPrimary,
            defaultBorderColor: borderColor, 
            primaryColor: backgroundColor,
          },
          Input: {
            colorBgContainer: menuItem,
            colorText: brandPrimary,
            colorBorder: borderColor,
            colorTextPlaceholder: darkGray,
          },
          DatePicker: {
            colorBgContainer: menuItem,
            colorText: brandPrimary,
            colorBorder: borderColor,
            colorTextPlaceholder: darkGray,
          },
          Modal: {
            contentBg: backgroundColor,
            headerBg: backgroundColor,
            titleColor: brandPrimary,
            colorText: brandPrimary,
            colorIcon: brandPrimaryTap,
          },
        },
      }}
    >
      <div className="p-2.5 h-[100vh]" style={{ backgroundColor: backgroundColor }}>
        <div className="mb-2 flex items-center">
          <Button
            icon={<CloseOutlined style={{ color: brandPrimary }} />}
            type="text"
            onClick={() => router.push("/profile?tab=info")}
            style={{ backgroundColor: menuItem, borderColor: borderColor }}
          />
          <Text strong style={{ fontSize: "18px", marginLeft: "10px", color: brandPrimary }}>
            {localStrings.Ads.Ads}
          </Text>
        </div>
        <div className="flex items-center xl:items-start xl:flex-row flex-col justify-center">
          <Post post={post} noFooter>
            {post?.parent_post && <Post post={post?.parent_post} isParentPost />}
          </Post>

          <div style={{ maxWidth: 600 }}>
            {renderAds()}
            <div
              onClick={() => setShowCampaign(true)}
              className="cursor-pointer pl-2.5 mt-2.5 font-bold text-[16px]"
              style={{ color: brandPrimary }}
            >
              {localStrings.Ads.ShowCampaign}
            </div>
          </div>
        </div>
        <Modal
          centered
          title={<span style={{ color: brandPrimary }}>{localStrings.Ads.Campaign}</span>}
          open={showCampaign}
          onCancel={() => setShowCampaign(false)}
          footer={null}
          style={{ maxHeight: "70vh", overflowY: "auto" }}
          bodyStyle={{ backgroundColor: backgroundColor }}
        >
          {(adsAll?.length ?? 0) > 0 ? (
            (adsAll ?? []).map((item, index) => (
              <div key={index} style={{ marginTop: 10 }}>
                <div
                  style={{
                    backgroundColor: menuItem,
                    borderRadius: 8,
                    padding: 10,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div
                    className="flex flex-row justify-between items-center"
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: brandPrimary,
                    }}
                  >
                    <span>
                      {localStrings.Ads.Campaign} #{index + 1}
                    </span>
                    <MdDateRange size={20} color={brandPrimary} />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div>
                      <span
                        style={{
                          fontSize: 14,
                          color: brandPrimaryTap,
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: brandPrimary }}>
                          {localStrings.Ads.StartDay}:
                        </span>{" "}
                        {DateTransfer(item?.start_date)}
                      </span>
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: 14,
                          color: brandPrimaryTap,
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: brandPrimary }}>
                          {localStrings.Ads.EndDay}:
                        </span>{" "}
                        {DateTransfer(item?.end_date)}
                      </span>
                    </div>

                    <div>
                      {item?.bill?.status && (
                        <span
                          style={{
                            fontSize: 14,
                            color: brandPrimaryTap,
                          }}
                        >
                          <span style={{ fontWeight: "bold", color: brandPrimary }}>
                            {localStrings.Ads.RemainingTime}:
                          </span>{" "}
                          {item?.day_remaining
                            ? `${item?.day_remaining} ${localStrings.Ads.Day}`
                            : "Đã kết thúc"}
                        </span>
                      )}
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: 14,
                          color: brandPrimaryTap,
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: brandPrimary }}>
                          {localStrings.Ads.Grant}:
                        </span>{" "}
                        {item?.bill?.price ? CurrencyFormat(item?.bill?.price) : "N/A"}
                      </span>
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: 14,
                          color: brandPrimaryTap,
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: brandPrimary }}>
                          {localStrings.Ads.PaymentMethod}:
                        </span>{" "}
                        {method === "momo" ? "MoMo" : "Khác"}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 14,
                          color: brandPrimaryTap,
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: brandPrimary }}>
                          {localStrings.Ads.Status}:
                        </span>{" "}
                        {item?.bill?.status
                          ? localStrings.Ads.PaymentSuccess
                          : localStrings.Ads.PaymentFailed}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 14,
                          color: brandPrimaryTap,
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: brandPrimary }}>
                          {localStrings.Ads.Click}:
                        </span>{" "}
                        {item?.total_clicks || 0}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 14,
                          color: brandPrimaryTap,
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: brandPrimary }}>
                          {localStrings.Ads.TotalReach}:
                        </span>{" "}
                        {item?.total_reach || 0}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 14,
                          color: brandPrimaryTap,
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: brandPrimary }}>
                          {localStrings.Ads.TotalImpressions}:
                        </span>{" "}
                        {item?.total_impression || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: "bold", color: brandPrimary }}>
                {localStrings.Ads.NoCampaign}
              </span>
            </div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Ads;