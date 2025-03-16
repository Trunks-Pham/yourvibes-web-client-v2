'use client';

import React, { useState } from 'react';
import { Input, Button, Typography, message } from 'antd';
import { useAuth } from '@/context/auth/useAuth';
import ReportViewModel from '../ViewModel/reportViewModel';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface ReportScreenProps {
  postId?: string;
  userId?: string;
  commentId?: string;
  setShowModal: (show: boolean) => void;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ postId, userId, commentId, setShowModal }) => {
  const [reportReason, setReportReason] = useState('');
  const { localStrings } = useAuth();
  const { report, reportLoading } = ReportViewModel();

  const handleReport = async () => {
    let type: number | undefined;
    let reportedId: string | undefined;

    if (postId) {
      type = 1; // Post
      reportedId = postId;
    } else if (userId) {
      type = 0; // User
      reportedId = userId;
    } else if (commentId) {
      type = 2; // Comment
      reportedId = commentId;
    }

    if (type !== undefined && reportedId !== undefined && reportReason.trim()) {
      try {
        const res = await report({ type, reason: reportReason, reported_id: reportedId });
        if (res && !res.error) {
          // Success case: Show success message, close modal, and clear reason
          message.success(localStrings.Report.ReportSuccess);
          setShowModal(false);
          setReportReason('');
        } else {
          // Error case handled in ReportViewModel, but we can add a fallback here
          let errorMessage = localStrings.Report.ReportFailed;
          if (type === 0) {
            errorMessage = localStrings.Report.ReportUserFailed;
          } else if (type === 1) {
            errorMessage = localStrings.Report.ReportPostFailed;
          } else if (type === 2) {
            errorMessage = localStrings.Report.ReportCommentFailed;
          }
          message.error(errorMessage);
          setShowModal(false);
        }
      } catch (error) {
        // Error case: Show error message and close modal
        message.error(localStrings.Report.ReportFailed);
        setShowModal(false);
      }
    }
  };

  // Ensure title text is stable and not causing hydration issues
  const getTitleText = () => {
    if (postId) return localStrings?.Report?.ReportPost || 'Report Post';
    if (userId) return localStrings?.Report?.ReportUser || 'Report User';
    return localStrings?.Report?.ReportComment || 'Report Comment';
  };

  return (
    <div className="p-2.5">
      <div className="flex-grow p-6">
        <Title level={5} className="text-center">
          {getTitleText()}
        </Title>
        <Text className="block text-gray-500 text-center my-4">
          {localStrings?.Report?.Note || 'Please provide a reason for your report.'}
        </Text>
        <TextArea
          rows={6}
          className="w-full border rounded-lg p-2"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder={localStrings?.Report?.placeholder || 'Enter your reason here...'}
        />
      </div>

      <div className="p-6 bg-white">
        <Button
          type="primary"
          block
          onClick={handleReport}
          loading={reportLoading}
          disabled={!reportReason.trim()}
        >
          {localStrings?.Public?.ReportFriend || 'Submit Report'}
        </Button>
      </div>
    </div>
  );
};

export default ReportScreen;
