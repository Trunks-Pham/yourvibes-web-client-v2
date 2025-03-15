import React, { useState } from 'react';
import { Input, Button, Typography, Spin } from 'antd'; // Import Spin
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

const ReportScreen = ({ postId, userId, commentId, setShowModal }: ReportScreenProps) => {
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

    if (type !== undefined && reportedId !== undefined) {
      const res = await report({ type, reason: reportReason, reported_id: reportedId });
      if (res?.success) {
        setShowModal(false);
        setReportReason('');
      }
    }
  };

  return (
    <div className="p-2.5">
      {/* Content */}
      <div className="flex-grow p-6">
        <Title level={5} className="text-center">
          {postId
            ? `${localStrings.Report.ReportPost}`
            : userId
            ? `${localStrings.Report.ReportUser}`
            : `${localStrings.Report.ReportComment}`}
        </Title>
        <Text className="block text-gray-500 text-center my-4">
          {localStrings.Report.Note}
        </Text>
        <TextArea
          rows={6}
          className="w-full border rounded-lg p-2"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder={localStrings.Report.placeholder}
        />
      </div>

      {/* Footer */}
      <div className="p-6 bg-white">
        <Button
          type="primary"
          block
          onClick={handleReport}
          disabled={!reportReason.trim()}
        >
          {reportLoading ? <Spin /> : localStrings.Public.ReportFriend} {/* Use Spin for loading */}
        </Button>
      </div>
    </div>
  );
};

export default ReportScreen;
