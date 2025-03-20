'use client';

import React, { useState } from 'react';
import { Input, Button, Typography } from 'antd';
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
            type = 1;
            reportedId = postId;
        } else if (userId) {
            type = 0;
            reportedId = userId;
        } else if (commentId) {
            type = 2;
            reportedId = commentId;
        }
    
        if (type !== undefined && reportedId !== undefined && reportReason.trim()) {
            try {
                await report({ 
                    type, 
                    reason: reportReason, 
                    reported_id: reportedId 
                });
                setReportReason('');  
            } catch (error) { 
            }
        }
    };
 
    const getTitleText = () => {
        if (postId) return localStrings.Report.ReportPost;
        if (userId) return localStrings.Report.ReportUser;
        return localStrings.Report.ReportComment;
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