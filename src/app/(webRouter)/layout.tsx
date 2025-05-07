"use client";
import { ApiPath } from "@/api/ApiPath";
import { defaultNotificationRepo } from "@/api/features/notification/NotifiCationRepo";
import MainLayout from "@/components/common/MainLayouts/MainLayout";
import { useAuth } from "@/context/auth/useAuth";
import { Button, message, notification, Skeleton } from "antd";
import { Suspense, useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }): React.ReactElement {



  return (
    <Suspense fallback={<Skeleton paragraph={{ rows: 10 }} active />}>
      <div>
        <MainLayout>{children}</MainLayout>
      </div>
    </Suspense>
  );
}