"use client";

import { useMessagesViewModel } from '../viewModel/MessagesViewModel';
import { defaultMessagesRepo } from '@/api/features/messages/MessagesRepo';
import { ConversationResponseModel } from '@/api/features/messages/models/ConversationModel';
import { MessageResponseModel } from '@/api/features/messages/models/MessageModel';
import { defaultProfileRepo } from '@/api/features/profile/ProfileRepository';
import { FriendResponseModel } from '@/api/features/profile/model/FriendReponseModel';
import { useAuth } from '@/context/auth/useAuth';
import { useWebSocket } from '@/context/socket/useSocket';
import useColor from '@/hooks/useColor';
import { EllipsisOutlined, DeleteOutlined, InboxOutlined, SendOutlined, SearchOutlined, ArrowLeftOutlined, PlusOutlined, SmileOutlined, CloseOutlined, CommentOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Empty, Layout, Skeleton, Typography, Popover, Menu, Dropdown, Popconfirm, Input, Button, Upload, Modal, Form, List, Avatar, Spin, message, Checkbox, Tabs } from 'antd';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState  } from 'react';

interface AddMemberModalProps {
  visible: boolean;
  onCancel: () => void;
  onAddMembers: (userIds: string[]) => Promise<any>;
  conversationId: string | undefined;
  existingMemberIds: string[];
  existingMembers: FriendResponseModel[];
  userRole?: number | null;
  onRefreshConversation?: () => void;
}

interface ConversationMember extends FriendResponseModel {
  conversation_role?: number;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ 
  visible, 
  onCancel, 
  onAddMembers,
  conversationId,
  existingMemberIds,
  existingMembers,
  userRole,
  onRefreshConversation
}) => {
  const { user, localStrings, theme } = useAuth();
  const { 
    brandPrimary, 
    avatar, 
    text, 
    layout, 
    notification,
    button
  } = useColor();
  const [friends, setFriends] = useState<FriendResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("addMembers");
  const [existingMembersWithRole, setExistingMembersWithRole] = useState<ConversationMember[]>([]);
  
  const avatarBackground = avatar;
  const primaryTextColor = text.primary;
  const secondaryTextColor = text.secondary;
  const borderColor = layout.border;
  
  const modalBackground = theme === 'dark' ? layout.siderBg : '#ffffff';
  const modalTitleColor = theme === 'dark' ? '#ffffff' : '#000000';
  const modalHeaderBg = theme === 'dark' ? layout.headerBg : '#ffffff';
  const cancelButtonBg = theme === 'dark' ? '#2d2d30' : '#fff';
  const cancelButtonText = theme === 'dark' ? '#ffffff' : '#000000';
  const cancelButtonBorder = theme === 'dark' ? '#6e6e6e' : '#d9d9d9';
  const addButtonText = theme === 'dark' ? '#9e9999' : '#9e9999';
  const listItemHoverBg = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const listItemSelectedBg = theme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.05)';
  const listBackground = theme === 'dark' ? '#1f1f1f' : '#ffffff';
  const warningBgColor = notification.warning.bg;
  const warningBorderColor = notification.warning.border;
  const warningTextColor = notification.warning.text;
  const infoBgColor = notification.info.bg;
  const infoBorderColor = notification.info.border;
  const infoTextColor = notification.info.text;
  const tabBgColor = theme === 'dark' ? layout.siderBg : '#ffffff';
  const tabActiveColor = theme === 'dark' ? button.primaryBg : button.primaryBg;
  const checkboxColor = theme === 'dark' ? button.primaryBg : button.primaryBg;
  const ownerBadgeBg = theme === 'dark' ? button.primaryBg : button.primaryBg;
  const memberBadgeBg = theme === 'dark' ? '#333' : '#f5f5f5';
  const memberBadgeText = theme === 'dark' ? '#e0e0e0' : '#555';

  useEffect(() => {
    if (visible && user?.id) {
      fetchFriends();
    }
  }, [visible, user?.id]);

  useEffect(() => {
    if (visible) {
      setSelectedFriends([]);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && conversationId) {
      fetchExistingMembersWithRole(conversationId);
    }
  }, [visible, conversationId]);

  const fetchExistingMembersWithRole = async (conversationId: string) => {
    try {
      const membersWithRoles = await Promise.all(
        existingMembers.map(async (member) => {
          try {
            if (!member.id) return member as ConversationMember;
            
            const roleResponse = await defaultMessagesRepo.getConversationDetailByID({
              userId: member.id,
              conversationId: conversationId
            });
            
            const conversationRole = roleResponse.data?.conversation_role;
            
            const memberWithRole: ConversationMember = {
              ...member,
              conversation_role: conversationRole
            };
            
            return memberWithRole;
          } catch (error) {
            console.error(`Error fetching role for user ${member.id}:`, error);
            return member as ConversationMember;
          }
        })
      );
      
      setExistingMembersWithRole(membersWithRoles);
    } catch (error) {
      console.error("Error fetching members with roles:", error);
    }
  };

  const handleTransferOwnership = async (userId: string) => {
    if (!conversationId || userRole !== 0) return;
    
    Modal.confirm({
      title: localStrings.Messages.TransferOwnership,
      content: localStrings.Messages.ConfirmTransferOwnership,
      okText: localStrings.Messages.Confirm,
      cancelText: localStrings.Public.Cancel,
      onOk: async () => {
        try {
          setAdding(true);
          await defaultMessagesRepo.updateConversationDetailRole({
            conversation_id: conversationId,
            user_id: userId
          });
          message.success(localStrings.Messages.OwnershipTransferredSuccessfully);
          
          if (onRefreshConversation) {
            onRefreshConversation();
          }
          
          onCancel(); 
        } catch (error) {
          console.error('Error transferring ownership:', error);
          message.error(localStrings.Messages.FailedToTransferOwnership);
        } finally {
          setAdding(false);
        }
      }
    });
  };

  const fetchFriends = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await defaultProfileRepo.getListFriends({
        user_id: user.id,
        limit: 50,
        page: 1
      });
      
      if (response.data) {
        const availableFriends = (response.data as FriendResponseModel[])
          .filter(friend => !existingMemberIds.includes(friend.id || ''));
        setFriends(availableFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      message.error(localStrings.Messages.ErrorFetchingFriends);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(prev => prev.filter(id => id !== friendId));
    } else {
      setSelectedFriends(prev => [...prev, friendId]);
    }
  };

  const handleAddMembers = async () => {
    if (!conversationId) {
      message.error(localStrings.Public.Error);
      return;
    }
    
    if (selectedFriends.length === 0) {
      message.warning(localStrings.Messages?.SelectAtLeastOneFriend);
      return;
    }
    
    setAdding(true);
    
    try {
      await onAddMembers(selectedFriends);
      message.success(localStrings.Messages.MembersAdded);
      onCancel();
    } catch (error) {
      console.error("Error adding members:", error);
      message.error(localStrings.Public.Error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!conversationId || userRole !== 0) return;
    
    if (userId === user?.id) {
      message.warning(localStrings.Messages.CannotRemoveYourself);
      return;
    }
    
    const member = existingMembers.find(m => m.id === userId);
    const memberName = member ? `${member.family_name || ''} ${member.name || ''}`.trim() : '';
    
    Modal.confirm({
      title: localStrings.Messages.RemoveMember,
      content: `${localStrings.Messages.ConfirmRemoveMember} ${memberName}?`,
      okText: localStrings.Messages.Remove,
      cancelText: localStrings.Public.Cancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try { 
          const response = await defaultMessagesRepo.deleteConversationDetail({
            user_id: userId,
            conversation_id: conversationId
          });
          
          if (response.error?.code) {
            throw new Error(response.error.message);
          }
          else {
            message.success(localStrings.Messages.MemberRemovedSuccessfully);

            if (onRefreshConversation) {
              onRefreshConversation();
            }
            
          }

        } catch (error) {
          console.error('Network error:', error);
          message.error(localStrings.Messages.FailedToRemoveMember);
        }
      }
    });
  };

  const isOneOnOneConversation = existingMembers.length === 2;

  const tabItems = [
    {
      key: 'addMembers',
      label: <span style={{ color: primaryTextColor }}>{localStrings.Messages.AddMembers}</span>,
      children: (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 24 }}>
              <Spin />
            </div>
          ) : (
            <List
              style={{ 
                maxHeight: 300, 
                overflow: "auto", 
                border: `1px solid ${borderColor}`, 
                borderRadius: 4,
                padding: "8px 0",
                backgroundColor: listBackground
              }}
              dataSource={friends}
              renderItem={friend => (
                <List.Item 
                  key={friend.id}
                  onClick={() => toggleFriendSelection(friend.id!)}
                  style={{ 
                    cursor: "pointer", 
                    padding: "8px 16px",
                    background: selectedFriends.includes(friend.id!) ? listItemSelectedBg : "transparent"
                  }}
                  className="friend-list-item"
                >
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <Checkbox 
                      checked={selectedFriends.includes(friend.id!)}
                      onChange={() => toggleFriendSelection(friend.id!)}
                    />
                    <Avatar 
                      src={friend.avatar_url} 
                      style={{ 
                        marginLeft: 8,
                        backgroundColor: !friend.avatar_url ? avatarBackground : undefined 
                      }}
                    >
                      {!friend.avatar_url && (friend.name?.charAt(0) || "").toUpperCase()}
                    </Avatar>
                    <span style={{ marginLeft: 12, color: primaryTextColor }}>
                      {`${friend.family_name || ''} ${friend.name || ''}`}
                    </span>
                    {friend.active_status && (
                      <span style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        backgroundColor: '#52c41a', 
                        marginLeft: 8 
                      }} />
                    )}
                  </div>
                </List.Item>
              )}
              locale={{ 
                emptyText: <div style={{ color: secondaryTextColor }}>{localStrings.Messages.NoFriendsToAdd}</div> 
              }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'currentMembers',
      label: <span style={{ color: primaryTextColor }}>{localStrings.Messages.CurrentMembers}</span>,
      children: (
        <div>
          {userRole === 0 && (
            <div style={{ 
              padding: "8px", 
              background: warningBgColor, 
              borderRadius: "4px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              border: `1px solid ${warningBorderColor}`
            }}>
              <span style={{ color: warningTextColor }}>
                {localStrings.Messages.OwnerCannotLeaveNote}
              </span>
            </div>
          )}
          
          {/* One-on-one conversation note */}
          {isOneOnOneConversation && userRole === 0 && (
            <div style={{ 
              padding: "8px", 
              background: infoBgColor, 
              borderRadius: "4px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              border: `1px solid ${infoBorderColor}`
            }}>
              <span style={{ color: infoTextColor }}>
                {localStrings.Messages.OneOnOneChatNote}
              </span>
            </div>
          )}
          
          <List
            style={{ 
              maxHeight: 300, 
              overflow: "auto", 
              border: `1px solid ${borderColor}`, 
              borderRadius: 4,
              padding: "8px 0",
              backgroundColor: listBackground
            }}
            dataSource={existingMembers}
            renderItem={(member: ConversationMember) => {
              const memberRole = member.conversation_role;
              const isCurrentUser = member.id === user?.id;
              const canTransferOwnership = userRole === 0 && memberRole !== 0 && !isCurrentUser;
              const canRemoveMember = userRole === 0 && !isCurrentUser && !isOneOnOneConversation;
      
              return (
                <List.Item 
                  key={member.id}
                  style={{ padding: "8px 16px" }}
                >
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    width: "100%",
                    justifyContent: "space-between" 
                  }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar 
                        src={member.avatar_url} 
                        style={{ 
                          marginLeft: 8,
                          backgroundColor: !member.avatar_url ? avatarBackground : undefined  
                        }}
                      >
                        {!member.avatar_url && (member.name?.charAt(0) || "").toUpperCase()}
                      </Avatar>
                      <span style={{ marginLeft: 12, color: primaryTextColor }}>
                        {`${member.family_name || ''} ${member.name || ''}`}
                        {member.id === user?.id ? ` (${localStrings.Messages.You})` : ''}
                      </span>
                      {memberRole !== undefined && (
                        <span style={{ 
                          marginLeft: 12,
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor: memberRole === 0 ? ownerBadgeBg : memberBadgeBg,
                          color: memberRole === 0 ? 'white' : memberBadgeText
                        }}>
                          {memberRole === 0 ? 'Owner' : 'Member'}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {canTransferOwnership && (
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => handleTransferOwnership(member.id!)}
                        >
                          {localStrings.Messages.MakeOwner}
                        </Button>
                      )}
                      {canRemoveMember && (
                        <Button 
                          type="link" 
                          size="small"
                          danger
                          onClick={() => handleRemoveMember(member.id!)}
                        >
                          {localStrings.Messages.Remove}
                        </Button>
                      )}
                    </div>
                  </div>
                </List.Item>
              );
            }}
            locale={{ 
              emptyText: <div style={{ color: secondaryTextColor }}>{localStrings.Messages.NoMembersInConversation}</div> 
            }}
          />
        </div>
      ),
    },
  ];

return (
    <Modal
      open={visible}
      title={<span style={{ color: modalTitleColor }}>{localStrings.Messages.ManageMembers}</span>}
      onCancel={onCancel}
      okText={localStrings.Messages.Add}
      cancelText={localStrings.Public.Cancel}
      onOk={handleAddMembers}
      confirmLoading={adding}
      okButtonProps={{ 
        disabled: selectedFriends.length === 0 || activeTab === "currentMembers",
        style:{
          color: theme === 'dark' ? addButtonText : addButtonText,
          fontWeight: 600,
        }
      }}
      styles={{ 
        content: { 
          backgroundColor: modalBackground,
        },
        header: {
          backgroundColor: modalHeaderBg,
          borderBottom: `1px solid ${borderColor}`
        },
        footer: {
          backgroundColor: modalBackground,
          borderTop: `1px solid ${borderColor}`
        },
        mask: {
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)'
        }
      }}
      cancelButtonProps={{
        style: {
          backgroundColor: cancelButtonBg,
          color: cancelButtonText,
          borderColor: cancelButtonBorder
        }
      }}
      closeIcon={<CloseOutlined style={{ color: primaryTextColor }} />}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
        style={{
          color: primaryTextColor,
          backgroundColor: tabBgColor
        }}
      />
      <style>{`
        .friend-list-item:hover {
          background-color: ${listItemHoverBg} !important;
        }
        .ant-modal .ant-form-item-label > label {
          color: ${primaryTextColor};
        }
        .ant-checkbox-wrapper {
          color: ${primaryTextColor};
        }
        .ant-list-empty-text {
          color: ${secondaryTextColor};
        }
        .ant-modal-content {
          background-color: ${modalBackground};
        }
        .ant-modal-title {
          color: ${modalTitleColor};
          background-color: ${modalHeaderBg};
        }
        .ant-tabs-tab {
          color: ${secondaryTextColor} !important;
        }
        .ant-tabs-tab:hover {
          color: ${tabActiveColor} !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: ${tabActiveColor} !important;
        }
        .ant-tabs-ink-bar {
          background: ${tabActiveColor} !important;
        }
        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: ${checkboxColor};
          border-color: ${checkboxColor};
        }
        .ant-checkbox-wrapper:hover .ant-checkbox-inner,
        .ant-checkbox:hover .ant-checkbox-inner,
        .ant-checkbox-input:focus + .ant-checkbox-inner {
          border-color: ${checkboxColor};
        }
      `}</style>
    </Modal>
  );
};

interface DateSeparatorProps {
  date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const { dateSeparator } = useColor();

  return (
    <div 
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "16px 0",
        position: "relative",
        width: "100%"
      }}
    >
      <div 
        style={{
          width: "100%",
          height: "1px",
          backgroundColor: dateSeparator.line,
          position: "absolute",
          zIndex: 1
        }}
      />
      <div 
        style={{
          backgroundColor: dateSeparator.background,
          padding: "4px 12px",
          borderRadius: "16px",
          fontSize: "12px",
          color: dateSeparator.text,
          position: "relative",
          zIndex: 2
        }}
      >
        {date}
      </div>
    </div>
  );
};

const { Dragger } = Upload;

interface EditConversationModalProps {
  visible: boolean;
  onCancel: () => void;
  onUpdateConversation: (name: string, image?: File | string) => Promise<any>;
  currentConversation: ConversationResponseModel | null;
}

const EditConversationModal: React.FC<EditConversationModalProps> = ({ 
  visible, 
  onCancel, 
  onUpdateConversation,
  currentConversation
}) => {
  const { localStrings, theme } = useAuth();
  const { 
    brandPrimary, 
    text, 
    modal, 
    upload, 
    input, 
    button 
  } = useColor();
  
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);
  const [conversationImage, setConversationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const primaryTextColor = text.primary;
  const secondaryTextColor = text.secondary;
  const modalBackground = modal.background;
  const modalHeaderBg = modal.headerBg;
  const modalFooterBg = modal.footerBg;
  const modalTitleColor = modal.titleColor;
  const modalBorderColor = modal.borderColor;
  const uploadBg = upload.background;
  const uploadHoverBg = upload.hoverBg;
  const uploadBorderColor = upload.borderColor;
  const uploadTextColor = upload.textColor;
  const uploadIconColor = upload.iconColor;
  const inputBg = input.background;
  const inputBorderColor = input.borderColor;
  const inputTextColor = input.textColor;
  const inputPlaceholderColor = input.placeholderColor;
  
  const defaultButtonBg = button.defaultBg;
  const defaultButtonBorder = button.defaultBorder;
  const defaultButtonText = button.defaultText;

  useEffect(() => {
    if (visible && currentConversation) {
      form.setFieldsValue({
        name: currentConversation.name
      });
      
      if (currentConversation.image) {
        setImagePreview(currentConversation.image);
      } else {
        setImagePreview(null);
      }
    }
  }, [visible, currentConversation, form]);

  const handleImageUpload = (info: any) => {
    const file = info.file;
    
    if (!file) {
      console.error("Không tìm thấy file:", info);
      return false;
    }
    
    const isImage = file.type.startsWith('image/');
    const isLt5M = file.size / 1024 / 1024 < 5;
    
    if (!isImage) {
      message.error(localStrings.Messages.OnlyImageFiles);
      return false;
    }
    
    if (!isLt5M) {
      message.error(localStrings.Messages.ImageMustSmallerThan5M);
      return false;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setImagePreview(previewUrl);
    };
    reader.readAsDataURL(file);
    
    setConversationImage(file);
    return false; 
  };

  const removeImage = () => {
    setConversationImage(null);
    setImagePreview(null);
  };

  const handleUpdateConversation = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setUpdating(true);
      
      let imageToSend: File | string | undefined = undefined;
      
      if (conversationImage) {
        imageToSend = conversationImage;
      } else if (imagePreview && (!currentConversation?.image || imagePreview !== currentConversation.image)) {
        imageToSend = imagePreview;
      }
      
      await onUpdateConversation(values.name, imageToSend);
      
      form.resetFields();
      setConversationImage(null);
      setImagePreview(null);
      
      onCancel();
    } catch (error) {
      console.error("Error updating conversation:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
      <Modal
        open={visible}
        title={<span style={{ color: modalTitleColor }}>{localStrings.Messages.EditConversation}</span>}
        onCancel={onCancel}
        footer={[
          <Button 
            key="cancel" 
            onClick={onCancel}
            style={{
              backgroundColor: defaultButtonBg,
              color: defaultButtonText,
              borderColor: defaultButtonBorder
            }}
          >
            {localStrings.Public.Cancel}
          </Button>,
          <Button 
            key="update" 
            type="primary" 
            onClick={handleUpdateConversation} 
            loading={updating}
          >
            {localStrings.Messages.Update}
          </Button>
        ]}
        styles={{ 
          content: { 
            backgroundColor: modalBackground,
          },
          header: {
            backgroundColor: modalHeaderBg,
            borderBottom: `1px solid ${modalBorderColor}`,
            color: modalTitleColor
          },
          footer: {
            backgroundColor: modalFooterBg,
            borderTop: `1px solid ${modalBorderColor}`
          },
          mask: {
            backgroundColor: modal.maskBg
          }
        }}
        closeIcon={<CloseOutlined style={{ color: primaryTextColor }} />}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="name" 
            label={<span style={{ color: primaryTextColor }}>{localStrings.Messages.ConversationName}</span>}
            rules={[{ required: true, message: localStrings.Messages.ConversationNameRequired}]}
          >
            <Input 
              placeholder={localStrings.Messages.GroupName} 
              style={{
                backgroundColor: inputBg,
                borderColor: inputBorderColor,
                color: inputTextColor
              }}
            />
          </Form.Item>
          
          {/* Image Upload Section */}
          <Form.Item 
            name="image" 
            label={<span style={{ color: primaryTextColor }}>{localStrings.Messages?.ConversationImage}</span>}
          >
            <Dragger
              name="avatar"
              multiple={false}
              showUploadList={false}
              beforeUpload={() => false}
              onChange={(info) => {
                handleImageUpload(info);
              }}
              accept="image/*"
              style={{
                backgroundColor: uploadBg,
                borderColor: uploadBorderColor
              }}
            >
              {imagePreview ? (
                <div style={{ 
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Conversation" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      objectFit: 'contain' 
                    }} 
                  />
                  <Button 
                    type="text" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    style={{ 
                      position: 'absolute', 
                      top: 5, 
                      right: 5, 
                      zIndex: 10,
                      background: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                      color: primaryTextColor
                    }}
                  >
                    {localStrings.Messages.Remove}
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: uploadIconColor }} />
                  </p>
                  <p className="ant-upload-text" style={{ color: uploadTextColor }}>
                    {localStrings.Messages?.ClickOrDragImageToUpload}
                  </p>
                  <p className="ant-upload-hint" style={{ color: secondaryTextColor }}>
                    {localStrings.Messages?.SupportSingleImageUpload}
                  </p>
                </div>
              )}
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    );
};

interface MessageItemProps {
  message: MessageResponseModel;
  onDelete: (messageId: string) => void;
  onReply: (message: MessageResponseModel) => void;
}

const MessageItem = React.memo<MessageItemProps>(({ message, onDelete, onReply }) => {
  const { user, localStrings, theme } = useAuth();
  const { brandPrimary, lightGray, messageBubble, icons, avatar, button } = useColor();
  const [hovering, setHovering] = useState(false);
  
  const isMyMessage = message.user_id === user?.id;
  
  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleDelete = () => {
    if (message.id) {
      onDelete(message.id);
    }
  };

  const messageBackground = isMyMessage 
    ? messageBubble.sender.background 
    : messageBubble.receiver.background;
    
  const messageColor = isMyMessage 
    ? messageBubble.sender.color 
    : messageBubble.receiver.color;

  const timestampColor = isMyMessage 
    ? messageBubble.sender.timestampColor 
    : messageBubble.receiver.timestampColor;  
    
  const avatarBackground = !message.user?.avatar_url 
    ? avatar 
    : undefined;
    
  const deleteButtonBackground = button.defaultBg;
  const deleteIconColor = icons.delete;
  
  const menuItems = [
    {
      key: "delete",
      label: (
        <Popconfirm
          title={localStrings.Messages.ConfirmDeleteMessage}
          onConfirm={handleDelete}
          okText={localStrings.Public.Yes}
          cancelText={localStrings.Public.No}
        >
          <span>
            <DeleteOutlined style={{ marginRight: 8 }} />
            {localStrings.Public.Delete}
          </span>
        </Popconfirm>
      ),
      style: { padding: "8px 16px" }
    }
  ];
  
  return (
      <div 
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{ 
          width: "100%", 
          display: "flex", 
          alignItems: isMyMessage ? "flex-end" : "flex-start",
          justifyContent: isMyMessage ? "flex-end" : "flex-start",
          marginBottom: "16px",
          flexDirection: "column"
        }}
      >
        <div style={{ 
          width: "100%",
          display: "flex", 
          alignItems: "center", 
          justifyContent: isMyMessage ? "flex-end" : "flex-start"
        }}>
          {/* Delete button - only shown for the user's own messages */}
          {isMyMessage && hovering && !message.isTemporary && (
            <div style={{ display: "flex", alignItems: "center", marginRight: "8px" }}>
              <Popconfirm
                title={localStrings.Messages.ConfirmDeleteMessage}
                onConfirm={handleDelete}
                okText={localStrings.Public.Yes}
                cancelText={localStrings.Public.No}
                trigger="click"
              >
                <div
                  style={{
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: "50%",
                    background: deleteButtonBackground
                  }}
                >
                  <DeleteOutlined style={{ fontSize: 16, color: deleteIconColor }} />
                </div>
              </Popconfirm>
            </div>
          )}
          
          {/* Reply button - show on hover for any message */}
          {hovering && !message.isTemporary && (
            <div style={{ 
              display: "flex", 
              alignItems: "center",
              marginRight: isMyMessage ? "0" : "8px",
              marginLeft: isMyMessage ? "8px" : "0",
              order: isMyMessage ? -1 : 1  
            }}>
              <div
                style={{
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: "50%",
                  background: deleteButtonBackground
                }}
                onClick={() => onReply(message)}
              >
                <CommentOutlined style={{ fontSize: 16, color: icons.action }} />
              </div>
            </div>
          )}
          
          {/* Avatar - only shown for messages from others */}
          {!isMyMessage && (
            <Avatar 
              src={message.user?.avatar_url} 
              size={32}
              style={{ 
                marginRight: "8px", 
                flexShrink: 0,
                backgroundColor: avatarBackground
              }}
            >
              {!message.user?.avatar_url && message.user?.name?.charAt(0)}
            </Avatar>
          )}
          
          {/* Message bubble */}
          <div style={{
            maxWidth: "50%",
            padding: "8px 12px",
            borderRadius: "12px",
            background: messageBackground,
            color: messageColor,
            overflow: "hidden",
            wordWrap: "break-word",
            border: message.fromServer ? "none" : "1px solid rgba(0,0,0,0.1)"
          }}>
            {/* Sender name - only shown for messages from others */}
            {!isMyMessage && (
              <div style={{ 
                fontSize: 12, 
                marginBottom: 2, 
                fontWeight: "bold", 
                color: messageColor
              }}>
                {`${message.user?.family_name || ''} ${message.user?.name || ''}`}
              </div>
            )}
            
            {/* If this is a reply message, show the original message */}
            {message.parent_id && message.parent_content && (
              <div style={{
                padding: "4px 8px",
                marginBottom: "6px",
                borderRadius: "6px",
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderLeft: `3px solid ${icons.action}`,
                fontSize: "12px",
                color: theme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.65)',
                maxHeight: "60px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {message.parent_content}
              </div>
            )}
            
            {/* Message content */}
            <div style={{ 
              whiteSpace: "pre-wrap", 
              wordBreak: "break-word", 
              color: messageColor
            }}>
              {message.content}
            </div>
            
            {/* Timestamp */}
            <div style={{ fontSize: 10, textAlign: "right", marginTop: 4 }}>
              {message.isTemporary ? (
                <span>
                </span>
              ) : (
                <span style={{ 
                  color: timestampColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}>
                  {formatMessageTime(message.created_at || '')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
});


interface NewConversationModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreateConversation: (name: string, image?: File | string, userIds?: string[]) => Promise<any>;
  onConversationCreated?: (conversation: ConversationResponseModel) => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ 
  visible, 
  onCancel, 
  onCreateConversation,
  onConversationCreated, 
}) => {
  const { user, localStrings, theme } = useAuth();
  const { 
    brandPrimary, 
    avatar, 
    text, 
    layout, 
    notification,
    input
  } = useColor();
  
  const [form] = Form.useForm();
  const [friends, setFriends] = useState<FriendResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [conversationImage, setConversationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const avatarBackground = avatar;
  const primaryTextColor = text.primary;
  const secondaryTextColor = text.secondary;
  const borderColor = layout.border;
  
  const modalBackground = theme === 'dark' ? layout.siderBg : '#ffffff';
  const modalTitleColor = theme === 'dark' ? '#ffffff' : '#000000';
  const modalHeaderBg = theme === 'dark' ? layout.headerBg : '#ffffff';
  const inputBackground = theme === 'dark' ? '#2d2d30' : '#ffffff';
  const inputBorder = theme === 'dark' ? '#3e3e42' : '#d9d9d9';
  const inputPlaceholderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
  const cancelButtonBg = theme === 'dark' ? '#2d2d30' : '#fff';
  const cancelButtonText = theme === 'dark' ? '#ffffff' : '#000000';
  const cancelButtonBorder = theme === 'dark' ? '#6e6e6e' : '#d9d9d9';
  const createButtonText = theme === 'dark' ? '#9e9999' : '#9e9999'
  const listItemHoverBg = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const listItemSelectedBg = theme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.05)';
  const listBackground = theme === 'dark' ? '#1f1f1f' : '#ffffff';
  const warningTextColor = theme === 'dark' ? notification.warning.text : notification.warning.text;

  useEffect(() => {
    if (visible && user?.id) {
      fetchFriends();
    }
  }, [visible, user?.id]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedFriends([]);
      setConversationImage(null);
      setImagePreview(null);
    }
  }, [visible]);

  const fetchFriends = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await defaultProfileRepo.getListFriends({
        user_id: user.id,
        limit: 50,
        page: 1
      });
      
      if (response.data) {
        setFriends(response.data as FriendResponseModel[]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      message.error(localStrings.Messages.ErrorFetchingFriends);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
      try {
        await form.validateFields();
        const values = form.getFieldsValue();
        
        if (selectedFriends.length === 0) {
          message.warning({
            content: localStrings.Messages.SelectAtLeastOneFriend,
            style: {
              backgroundColor: notification.warning.bg,
              border: `1px solid ${notification.warning.border}`,
              color: notification.warning.text,
              borderRadius: '4px',
              padding: '10px 16px'
            }
          });
          return;
        }
        
        if (values.name && values.name.length > 30) {
          message.error({
            content: localStrings.Messages.GroupNameTooLong,
            style: {
              backgroundColor: notification.error.bg,
              border: `1px solid ${notification.error.border}`,
              color: notification.error.text,
              borderRadius: '4px',
              padding: '10px 16px'
            }
          });
          return;
        }
        
        if (selectedFriends.length > 1 && !values.name) {
          form.setFields([{
            name: 'name',
            errors: [localStrings.Messages.GroupNameRequired]
          }]);
          return;
        }
        
        setCreating(true);
        
        const selectedUsers = selectedFriends.map(id => 
          friends.find(friend => friend.id === id)
        ).filter(Boolean) as FriendResponseModel[];
        
        let conversationName = values.name;
        if (!conversationName && selectedUsers.length === 1) {
          conversationName = selectedUsers
            .map(user => `${user.family_name || ''} ${user.name || ''}`.trim())
            .join(", ");
        }
        
        const userIdsToAdd = [
          ...(user?.id ? [user.id] : []), 
          ...selectedFriends
        ];
        
        try {
          const newConversation = await onCreateConversation(
            conversationName, 
            conversationImage || undefined, 
            userIdsToAdd
          );
          
          if (newConversation && newConversation.id) {
            message.success({
              content: localStrings.Messages.ConversationCreated,
              style: {
                backgroundColor: notification.success.bg,
                border: `1px solid ${notification.success.border}`,
                color: notification.success.text,
                borderRadius: '4px',
                padding: '10px 16px'
              }
            });
            
            form.resetFields();
            setSelectedFriends([]);
            setConversationImage(null);
            setImagePreview(null);

            if (onConversationCreated) {
              onConversationCreated(newConversation);
            }
            
            onCancel();
          }
        } catch (error: any) {
          console.error("Error creating conversation:", error);
          
          if (error?.error?.code === 50004 && error.error.message_detail?.includes("Name: the length must be between")) {
            message.error({
              content: localStrings.Messages.GroupNameTooLong,
              style: {
                backgroundColor: notification.error.bg,
                border: `1px solid ${notification.error.border}`,
                color: notification.error.text,
                borderRadius: '4px',
                padding: '10px 16px'
              }
            });
          } 
          else if (error?.error?.code === 50028 && error.error.message === "Conversation has already exist") {
            const existingConversationId = error.error.message_detail;
            
            message.info({
              content: localStrings.Messages.ConversationAlreadyExists,
              style: {
                backgroundColor: notification.info.bg,
                border: `1px solid ${notification.info.border}`,
                color: notification.info.text,
                borderRadius: '4px',
                padding: '10px 16px'
              }
            });
            
            onCancel();
            
            if (onConversationCreated && existingConversationId) {
              const tempConversation: ConversationResponseModel = {
                id: existingConversationId
              };
              
              setTimeout(() => {
                onConversationCreated(tempConversation);
              }, 500);
            }
          } else {
            message.error({
              content: error?.error?.message || localStrings.Messages.GroupCreationFailed,
              style: {
                backgroundColor: notification.error.bg,
                border: `1px solid ${notification.error.border}`,
                color: notification.error.text,
                borderRadius: '4px',
                padding: '10px 16px'
              }
            });
          }
        } finally {
          setCreating(false);
        }
      } catch (error) {
        console.error("Error in form validation:", error);
      }
    };

  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(prev => prev.filter(id => id !== friendId));
    } else {
      setSelectedFriends(prev => [...prev, friendId]);
    }
  };

  useEffect(() => {
    if (selectedFriends.length > 1) {
      const nameField = form.getFieldValue('name');
      if (!nameField) {
        form.setFields([{
          name: 'name',
          errors: undefined 
        }]);
      }
    }
  }, [selectedFriends.length, form]);

  return (
      <Modal
        open={visible}
        title={<span style={{ color: modalTitleColor }}>{localStrings.Messages.NewConversation}</span>}
        onCancel={onCancel}
        footer={[
          <Button 
            key="cancel" 
            onClick={onCancel}
            style={{
              backgroundColor: cancelButtonBg,
              color: cancelButtonText,
              borderColor: cancelButtonBorder
            }}
          >
            {localStrings.Public.Cancel}
          </Button>,
          <Button 
            key="create" 
            type="primary" 
            onClick={handleCreateConversation} 
            loading={creating}
            disabled={selectedFriends.length === 0}
            style={{
              color: createButtonText,
              fontWeight: 600,
            }}
          >
            {localStrings.Messages.Create}
          </Button>
        ]}
        styles={{ 
          content: { 
            backgroundColor: modalBackground,
          },
          header: {
            backgroundColor: modalHeaderBg,
            borderBottom: `1px solid ${borderColor}`
          },
          footer: {
            backgroundColor: modalBackground,
            borderTop: `1px solid ${borderColor}`
          },
          mask: {
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)'
          }
        }}
        closeIcon={<CloseOutlined style={{ color: primaryTextColor }} />}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="name" 
            label={<span style={{ color: primaryTextColor }}>{localStrings.Messages.ConversationName}</span>}
            rules={[{/* rules */}]}
          >
            <Input 
              placeholder={
                selectedFriends.length > 1 
                  ? localStrings.Messages.GroupNameRequired 
                  : localStrings.Messages.OptionalGroupName
              } 
              style={{
                backgroundColor: inputBackground,
                color: primaryTextColor,
                borderColor: inputBorder
              }}
            />
          </Form.Item>

          {selectedFriends.length > 1 && (
            <div style={{ marginBottom: 16, color: warningTextColor }}>
              {localStrings.Messages.GroupNameRequiredNote}
            </div>
          )}
          
          {/* Friends List Section */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, color: primaryTextColor }}>
              {localStrings.Public.Messages}
            </label>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : (
              <List
                style={{ 
                  maxHeight: 300, 
                  overflow: "auto", 
                  border: `1px solid ${borderColor}`, 
                  borderRadius: 4,
                  padding: "8px 0",
                  backgroundColor: listBackground
                }}
                dataSource={friends}
                renderItem={friend => (
                  <List.Item 
                    key={friend.id}
                    onClick={() => toggleFriendSelection(friend.id!)}
                    style={{ 
                      cursor: "pointer", 
                      padding: "8px 16px",
                      background: selectedFriends.includes(friend.id!) ? listItemSelectedBg : "transparent",
                    }}
                    className="friend-list-item"
                  >
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Checkbox 
                        checked={selectedFriends.includes(friend.id!)}
                        onChange={() => toggleFriendSelection(friend.id!)}
                      />
                      <Avatar 
                        src={friend.avatar_url} 
                        style={{ 
                          marginLeft: 8,
                          backgroundColor: !friend.avatar_url ? avatarBackground : undefined 
                        }}
                      >
                        {!friend.avatar_url && (friend.name?.charAt(0) || "").toUpperCase()}
                      </Avatar>
                      <span style={{ marginLeft: 12, color: primaryTextColor }}>
                        {`${friend.family_name || ''} ${friend.name || ''}`}
                      </span>
                    </div>
                  </List.Item>
                )}
                locale={{ 
                  emptyText: <div style={{ color: secondaryTextColor }}>{localStrings.Messages.NoFriendsFound}</div> 
                }}
              />
            )}
          </div>
        </Form>
        <style>{`
          .friend-list-item:hover {
            background-color: ${listItemHoverBg} !important;
          }
          .ant-modal .ant-form-item-label > label {
            color: ${primaryTextColor};
          }
          .ant-checkbox-wrapper {
            color: ${primaryTextColor};
          }
          .ant-list-empty-text {
            color: ${secondaryTextColor};
          }
          .ant-input::placeholder {
            color: ${inputPlaceholderColor};
          }
          .ant-modal-content {
            background-color: ${modalBackground};
          }
          .ant-modal-title {
            color: ${modalTitleColor};
            background-color: ${modalHeaderBg};
          }
        `}</style>
      </Modal>
    );
};

const { Header, Content, Sider } = Layout;
const { Search } = Input;
const { Text, Title } = Typography;
const { SubMenu, Item } = Menu;

const MessagesFeature: React.FC = () => {
  const { user, localStrings, theme } = useAuth();
  const { 
    layout, 
    text, 
    avatar, 
    icons, 
    sidebar, 
    button, 
    search, 
    dropdown, 
    modal, 
    input, 
    indicators, 
    messageBubble,
    notification,
  } = useColor();
  
  const searchParams = useSearchParams();
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [existingMembers, setExistingMembers] = useState<FriendResponseModel[]>([]);
  const [userRole, setUserRole] = useState<number | null>(null);
  const { socketMessages, setSocketMessages } = useWebSocket();
  const [replyToMessage, setReplyToMessage] = useState<MessageResponseModel | null>(null);

  const layoutBackground = layout.background;
  const siderBackground = layout.siderBg;
  const borderColor = layout.border;
  const activeItemBackground = layout.activeItem;
  const avatarBackground = avatar;
  const headerBackground = layout.headerBg;
  const primaryTextColor = text.primary;
  const secondaryTextColor = text.secondary;
  const sidebarTextColor = sidebar.text;
  const sidebarSecondaryTextColor = sidebar.secondaryText;
  const iconPrimaryColor = icons.primary;
  const iconSecondaryColor = icons.secondary;
  const iconActionColor = icons.action;
  const inputBackground = layout.siderBg;
  const inputTextColor = input.textColor;
  const inputBorderColor = input.borderColor;
  const inputPlaceholderColor = input.placeholderColor;
  const dropdownBg = dropdown.background;
  const dropdownItemText = dropdown.textColor;
  const dropdownItemHover = dropdown.itemHover;
  const dropdownBorder = dropdown.borderColor;
  const dropdownBoxShadow = dropdown.boxShadow;
  const dropdownDangerColor = dropdown.dangerColor;
  const dropdownDangerHoverBg = dropdown.dangerHoverBg;

  const {
    fetchConversations,
    deleteMessage,
    createConversation,
    updateConversation,
    deleteConversation,
    conversations,
    currentConversation,
    messages,
    messagesLoading,
    conversationsLoading,
    searchText,
    messageText,
    setSearchText,
    setMessageText,
    setCurrentConversation,
    sendMessage,
    messageListRef,
    handleScroll,
    getMessagesForConversation,
    initialMessagesLoaded,
    addConversationMembers,
    leaveConversation,
    getCurrentUserRole,
  } = useMessagesViewModel();

  const [isMobile, setIsMobile] = useState(false);
  const [showConversation, setShowConversation] = useState(true);
  const { backgroundColor, lightGray, brandPrimary } = useColor();
  const [editConversationModalVisible, setEditConversationModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);
  const conversationIdFromUrl = searchParams.get("conversation_id");

  useEffect(() => {
    if (socketMessages.length > 0) {
      const latestMessage = socketMessages[0];
      
      const isNewConversation = latestMessage.conversation_id && 
        !conversations.some(conv => conv.id === latestMessage.conversation_id);
      
      if (isNewConversation) {
        fetchConversations();
        setSocketMessages([]);
      }
    }
  }, [socketMessages, conversations, fetchConversations, setSocketMessages]);

  useEffect(() => {
    if (currentConversation?.id) {
      getCurrentUserRole(currentConversation.id)
        .then(setUserRole);
    }
  }, [currentConversation?.id]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile && currentConversation) {
      setShowConversation(false);
    }
  }, [currentConversation, isMobile]);

  const handleRefreshAfterRoleChange = useCallback(async () => {
    await fetchConversations();
    
    if (currentConversation?.id) {
      const role = await getCurrentUserRole(currentConversation.id);
      setUserRole(role);
      
      await fetchExistingMembers(currentConversation.id);
    }
  }, [currentConversation?.id, fetchConversations, getCurrentUserRole]);
  
  const handleSelectConversation = (conversation: ConversationResponseModel) => {
    if (currentConversation?.id === conversation.id) {
      if (isMobile) {
        setShowConversation(false);
      }
      return;
    }

    setCurrentConversation(conversation);
    
    if (isMobile) {
      setShowConversation(false);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  const handleSendMessage = async () => {
    if (!user?.id || !currentConversation?.id) return;
    
    if (messageText.trim() && currentConversation && messageText.length <= 500) {
      await sendMessage(replyToMessage); 
      setReplyToMessage(null); 
    } else if (messageText.length > 500) {
      message.error(localStrings.Messages.MessageTooLong);
    }
  };

  const handleReply = (message: MessageResponseModel) => {
    setReplyToMessage(message);
    const inputElement = document.querySelector('.message-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };
  
  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleBackToConversations = () => {
    setShowConversation(true);
  };

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const [newConversationModalVisible, setNewConversationModalVisible] = useState(false);

  const handleUpdateConversation = async (name: string, image?: File | string) => {
    if (currentConversation?.id) {
      try {
        await updateConversation(currentConversation.id, name, image as string);
        message.success(localStrings.Messages.ConversationUpdated);
        setEditConversationModalVisible(false);
      } catch (error) {
        message.error(localStrings.Public.Error);
      }
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!existingMembers.length) return;
    
    const isOneOnOne = existingMembers.length === 2;
    
    if (userRole !== 0 && !isOneOnOne) {
      message.error(localStrings.Messages.OnlyOwnerCanDeleteConversation);
      return;
    }
    
    Modal.confirm({
      title: localStrings.Messages.ConfirmDeleteConversation,
      content: localStrings.Messages.ConfirmDeleteConversationContent,
      okText: localStrings.Public.Yes,
      cancelText: localStrings.Public.No,
      onOk: async () => {
        try {
          await deleteConversation(conversationId);
          message.success(localStrings.Messages.ConversationDeleted);
        } catch (error) {
          message.error(localStrings.Public.Error);
        }
      }
    });
  };
  
  const fetchExistingMembers = async (conversationId: string) => {
    try {
      const response = await defaultMessagesRepo.getConversationDetailByUserID({
        conversation_id: conversationId
      });
  
      if (response.data) {
        const members = Array.isArray(response.data) ? response.data : [response.data];
        
        const memberIds = members.map(member => member.user_id).filter(Boolean) as string[];
        setExistingMemberIds(memberIds);
        
        const membersWithDetails = members.filter(member => member.user && member.user.id);
        
        if (membersWithDetails.length > 0) {
          const memberProfiles = membersWithDetails.map(member => ({
            id: member.user?.id,
            name: member.user?.name,
            family_name: member.user?.family_name,
            avatar_url: member.user?.avatar_url,
            active_status: member.user?.active_status || false
          }));
          
          setExistingMembers(memberProfiles as FriendResponseModel[]);
        } else {
          const membersPromises = memberIds.map(async (userId) => {
            try {
              if (userId === user?.id) {
                return {
                  id: user.id,
                  name: user.name,
                  family_name: user.family_name,
                  avatar_url: user.avatar_url
                };
              }
              
              return null;
            } catch (error) {
              console.error("Error fetching user details:", error);
              return null;
            }
          });
          
          const membersDetails = await Promise.all(membersPromises);
          const validMembers = membersDetails.filter(Boolean) as FriendResponseModel[];
          setExistingMembers(validMembers);
        }
      }
    } catch (error) {
      console.error("Error fetching conversation members:", error);
      setExistingMemberIds([]);
      setExistingMembers([]);
    }
  };

  const handleOpenAddMemberModal = async () => {
    if (currentConversation?.id) {
      await fetchExistingMembers(currentConversation.id);
      setAddMemberModalVisible(true);
    }
  };
  
  useEffect(() => {
    if (currentConversation?.id) {
      fetchExistingMembers(currentConversation.id);
    }
  }, [currentConversation?.id]);

  const handleAddMembers = async (userIds: string[]) => {
    if (currentConversation?.id) {
      await addConversationMembers(currentConversation.id, userIds);
    }
  };

  const handleLeaveConversation = () => {
    if (!currentConversation?.id) return;
  
    if (userRole === 0) {
      Modal.info({
        title: localStrings.Messages.CannotLeaveAsOwner,
        content: localStrings.Messages.MustTransferOwnershipFirst,
        okText: localStrings.Messages.OK,
      });
      return;
    }
  
    if (existingMembers.length <= 2) {
      Modal.info({
        title: localStrings.Messages.CannotLeaveGroup,
        content: localStrings.Messages.GroupMustHaveAtLeastTwoMembers,
        okText: localStrings.Messages.OK,
      });
      return;
    }
  
    Modal.confirm({
      title: localStrings.Messages.LeaveConversation,
      content: localStrings.Messages.ConfirmLeaveConversation,
      okText: localStrings.Public.Yes,
      cancelText: localStrings.Public.No,
      onOk: async () => {
        try {
          if (currentConversation.id) {
            await leaveConversation(currentConversation.id);
            message.success(localStrings.Messages.LeftConversation);
            
            await fetchConversations();
            
            setCurrentConversation(null);
          }
        } catch (error) {
          message.error(localStrings.Public.Error);
        }
      }
    });
  };

  const isOneOnOneConversation = existingMembers.length === 2;

  return (
    <Layout style={{ height: "calc(100vh - 64px)", background: layoutBackground }}>
      {/* Conversations Sidebar */}
      {(showConversation || !isMobile) && (
        <Sider
          width={isMobile ? "100%" : 300}
          style={{
            background: siderBackground,
            overflow: "auto",
            borderRight: `1px solid ${borderColor}`,
            display: isMobile ? (showConversation ? "block" : "none") : "block"
          }}
        >
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Title level={4} style={{ margin: 0, color: sidebarTextColor }}>
                  {localStrings.Public.Messages}
              </Title>
              <div>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<UsergroupAddOutlined />}
                  onClick={() => setNewConversationModalVisible(true)}
                  style={{

                    color: theme === 'dark' ? button.secondaryText : button.primaryText
                  }}
                />
              </div>

            </div>
            <Search
              placeholder={localStrings.Public.Search}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ 
                marginTop: 16
              }}
              className={`themed-search-${theme}`}
              prefix={<SearchOutlined style={{ color: search.iconColor }} />}
            />
          </div>
          <div style={{ height: "calc(100% - 130px)", overflow: "auto" }}>
            {conversationsLoading ? (
              <div style={{ padding: "0 16px" }}>
                {/* Header skeleton */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  paddingTop: 16
                }}>
                  <Skeleton.Button active style={{ width: 100, height: 24 }} />
                  <Skeleton.Avatar active shape="circle" size="small" />
                </div>

                {/* Search box skeleton */}
                <div style={{ marginBottom: 16 }}>
                  <Skeleton.Input active style={{ width: '100%', height: 32 }} size="small" />
                </div>

                {/* Conversations list skeleton */}
                {Array(6).fill(null).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      padding: "12px 0",
                      borderBottom: "1px solid #f0f0f0",
                      alignItems: "center"
                    }}
                  >
                    <Skeleton.Avatar active size="large" style={{ flexShrink: 0 }} />
                    <div style={{ marginLeft: 12, flex: 1 }}>
                      <Skeleton.Input active style={{ width: '70%', height: 16 }} size="small" />
                      <div style={{ marginTop: 6 }}>
                        <Skeleton.Input active style={{ width: '90%', height: 14 }} size="small" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Skeleton.Input active style={{ width: 35, height: 12 }} size="small" />
                      <div style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: '#f0f0f0',
                        marginTop: 8
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredConversations.length === 0 ? (
                  <Empty
                    description={
                      searchText
                        ? (localStrings.Messages.NoConversations)
                        : (localStrings.Messages.NoConversations)
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ margin: "40px 0" }}
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setNewConversationModalVisible(true)}
                    >
                      {localStrings.Messages.StartConversation}
                    </Button>
                  </Empty>
                ) : (
                  <List
                    dataSource={filteredConversations}
                    renderItem={(item) => {

                      const isOnline = item.active_status;

                      const conversationMessages = getMessagesForConversation(item.id || '');

                      const actualMessages = conversationMessages.filter(msg => !msg.isDateSeparator);

                      const lastMessage = actualMessages.length > 0
                        ? actualMessages.sort((a, b) =>
                          new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
                        )[0]
                        : null;

                      const messagePreview = lastMessage?.content
                        ? (lastMessage.content.length > 50 ? lastMessage.content.substring(0, 47) + '...' : lastMessage.content)
                        : (localStrings.Messages.StartConversation);
                      
                      const senderName = item.user_id === user?.id 
                        ? (localStrings.Messages.You) 
                        : '';

                      const messageDisplay = item.last_message 
                        ? (item.last_message_status === false ? `${item.last_message}` : `${item.last_message}`)
                        : (localStrings.Messages.StartConversation);

                      const lastMessageTime = lastMessage?.created_at
                        ? formatMessageTime(lastMessage.created_at)
                        : '';


                      const isOneOnOneChat = item.name?.includes(" & ") ||
                        (actualMessages.some(msg => msg.user_id !== user?.id) &&
                          new Set(actualMessages.map(msg => msg.user_id)).size <= 2);

                      const otherUser = isOneOnOneChat && actualMessages.length > 0
                        ? actualMessages.find(msg => msg.user_id !== user?.id)?.user
                        : null;

                        let avatarUrl = item.image || item.avatar;

                      if (isOneOnOneChat && !item.image && otherUser?.avatar_url) {
                        avatarUrl = otherUser.avatar_url;
                      }                      

                      const avatarInitial = isOneOnOneChat && otherUser?.name
                        ? otherUser.name.charAt(0).toUpperCase()
                        : item.name?.charAt(0).toUpperCase();
                      
                      return (
                        <List.Item
                          onClick={() => handleSelectConversation(item)}
                          style={{
                            cursor: "pointer",
                            padding: "12px 16px",
                            background: currentConversation?.id === item.id ? activeItemBackground : "transparent",
                            transition: "background 0.3s",
                          }}
                          key={item.id}
                        >
                          <List.Item.Meta
                            avatar={
                              <div style={{ position: 'relative' }}>
                                <Avatar
                                  src={avatarUrl}
                                  size={48}
                                  style={{
                                    backgroundColor: !avatarUrl ? avatarBackground : undefined
                                  }}
                                >
                                  {!avatarUrl && avatarInitial}
                                </Avatar>
                                {isOnline && (
                                  <span style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: '#52c41a',
                                    border: '2px solid white'
                                  }} />
                                )}
                              </div>
                            }
                            title={<Text strong style={{ color: sidebarTextColor }}>{item.name}</Text>}
                            description={
                              <Text
                                ellipsis
                                style={{
                                  maxWidth: '100%',
                                  color: sidebarSecondaryTextColor,
                                  fontWeight: item.last_message_status ? 'bold' : 'normal'
                                }}
                              >
                                {messageDisplay}
                              </Text>
                            }
                          />
                          {lastMessage && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <Text type="secondary" style={{ fontSize: '12px', color: sidebarSecondaryTextColor }}>
                                {lastMessageTime}
                              </Text>
                              {item.last_message_status && (
                                <span style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: '#ff4d4f',
                                  marginTop: 4
                                }} />
                              )}
                            </div>
                          )}
                        </List.Item>
                      );
                    }}
                  />
                )}
              </>
            )}
          </div>
        </Sider>
      )}

      {/* Chat Area */}
      {(!showConversation || !isMobile) && (
        <Layout style={{
          height: "100%",
          background: layoutBackground,
          display: isMobile ? (showConversation ? "none" : "flex") : "flex"
        }}>
          {/* Chat Header */}
          <Header style={{
            background: headerBackground,
            padding: "0 16px",
            height: "64px",
            lineHeight: "64px",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center"
          }}>
            {isMobile && (
              <Button
                icon={<ArrowLeftOutlined style={{ color: iconPrimaryColor }} />}
                type="text"
                onClick={handleBackToConversations}
                style={{ marginRight: 8 }}
              />
            )}
            {currentConversation ? (
              <>
                {/* For the header, we also want to show the friend's avatar for 1-on-1 chats */}
                {(() => {
                  const conversationMessages = getMessagesForConversation(currentConversation.id || '');
                  const actualMessages = conversationMessages.filter(msg => !msg.isDateSeparator);

                  const isOneOnOneChat = currentConversation.name?.includes(" & ") ||
                    (actualMessages.some(msg => msg.user_id !== user?.id) &&
                      new Set(actualMessages.map(msg => msg.user_id)).size <= 2);

                  const otherUser = isOneOnOneChat && actualMessages.length > 0
                    ? actualMessages.find(msg => msg.user_id !== user?.id)?.user
                    : null;

                  let avatarUrl = currentConversation.image || currentConversation.avatar;

                  if (isOneOnOneChat && !currentConversation.image && otherUser?.avatar_url) {
                    avatarUrl = otherUser.avatar_url;
                  }

                  const avatarInitial = isOneOnOneChat && otherUser?.name
                    ? otherUser.name.charAt(0).toUpperCase()
                    : currentConversation.name?.charAt(0).toUpperCase();

                  return (
                    <Avatar
                      src={avatarUrl}
                      size={40}
                      style={{
                        backgroundColor: !avatarUrl ? brandPrimary : undefined
                      }}
                    >
                      {!avatarUrl && avatarInitial}
                    </Avatar>
                  );
                })()}
                
                <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Text strong style={{ fontSize: 16, marginBottom: 2, color: primaryTextColor }}>
                  {currentConversation.name}
                </Text>
                  {currentConversation.active_status && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontSize: 12, 
                      color: '#52c41a',
                      lineHeight: '1'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#52c41a',
                        marginRight: 4
                      }} />
                      <span>{localStrings.Messages.Active}</span>
                    </div>
                  )}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                <Dropdown
                  overlay={
                    <Menu
                      style={{
                        backgroundColor: dropdownBg,
                        border: `1px solid ${dropdownBorder}`,
                        boxShadow: dropdownBoxShadow
                      }}
                      className={`themed-dropdown-${theme}`}
                    >
                      <Item 
                        key="edit" 
                        onClick={() => setEditConversationModalVisible(true)}
                        style={{ 
                          color: dropdownItemText,
                          padding: "8px 16px" 
                        }}
                        className="dropdown-menu-item"
                      >
                        {localStrings.Messages.EditConversation}
                      </Item>
                      <Item 
                        key="addMember" 
                        onClick={handleOpenAddMemberModal}
                        style={{ 
                          color: dropdownItemText,
                          padding: "8px 16px" 
                        }}
                        className="dropdown-menu-item"
                      >
                        {localStrings.Messages.AddMembers}
                      </Item>
                      {/* Hiện nút delete nếu là owner HOẶC là conversation 1-1 */}
                      {(userRole === 0 || isOneOnOneConversation) && (
                        <Item 
                          key="delete" 
                          danger 
                          onClick={() => currentConversation?.id && handleDeleteConversation(currentConversation.id)}
                          style={{ 
                            padding: "8px 16px",
                            color: dropdownDangerColor
                          }}
                          className="dropdown-menu-item-danger"
                        >
                          {localStrings.Messages.DeleteConversation}
                        </Item>
                      )}
                      {/* Chỉ hiện nút Leave nếu user không phải là owner, là group chat và có >2 thành viên */}
                      {currentConversation?.name && 
                      !currentConversation.name.includes(" & ") && 
                      userRole !== 0 && 
                      existingMembers.length > 2 && (
                        <Item 
                          key="leave" 
                          onClick={handleLeaveConversation}
                          style={{ 
                            color: dropdownItemText,
                            padding: "8px 16px" 
                          }}
                          className="dropdown-menu-item"
                        >
                          {localStrings.Messages.LeaveConversation}
                        </Item>
                      )}
                    </Menu>
                  }
                  trigger={['click']}
                  getPopupContainer={(triggerNode) => {
                    return triggerNode.parentNode as HTMLElement;
                  }}
                >
                  <Button 
                    type="text" 
                    icon={<EllipsisOutlined style={{ fontSize: 20, color: iconPrimaryColor }} />} 
                  />
                </Dropdown>

                <style>{`
                  .dropdown-menu-item:hover {
                    background-color: ${dropdown.itemHover} !important;
                  }
                  
                  .dropdown-menu-item-danger:hover {
                    background-color: ${dropdown.dangerHoverBg} !important;
                  }
                  
                  .themed-dropdown-${theme} .ant-dropdown-menu-item {
                    transition: background-color 0.3s ease;
                  }
                  
                  .themed-dropdown-dark .ant-dropdown-menu {
                    background-color: ${dropdown.background};
                  }
                  
                  .themed-dropdown-light .ant-dropdown-menu {
                    background-color: ${dropdown.background};
                  }
                `}</style>

                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" }}>
                <div style={{ textAlign: "center", opacity: 0.5 }}>
                  <div style={{ fontSize: 64, marginBottom: 20 }}>💬</div>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    {localStrings.Messages.SelectConversationToChat}
                  </Text>
                </div>
              </div>
            )}
          </Header>

          {/* Messages Container */}
          <Content
            style={{
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              height: "calc(100% - 128px)",
              position: "relative",
              background: layoutBackground
            }}
            ref={messageListRef}
            onScroll={handleScroll}
          >
            {currentConversation ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Loading indicator for initial load */}
                {messagesLoading && messages.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header skeleton */}
                    <div style={{
                      height: 64,
                      borderBottom: '1px solid #f0f0f0',
                      padding: '0 16px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Skeleton.Avatar active size="default" style={{ marginRight: 12 }} />
                      <Skeleton.Input active style={{ width: 180, height: 16 }} size="small" />
                      <div style={{ marginLeft: 'auto' }}>
                        <Skeleton.Button active style={{ width: 32, height: 32 }} shape="circle" />
                      </div>
                    </div>

                    {/* Message area skeleton */}
                    <div style={{
                      flex: 1,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end'
                    }}>
                      {/* Skeleton for a date separator */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        margin: '10px 0'
                      }}>
                        <Skeleton.Input active style={{ width: 80, height: 20 }} size="small" />
                      </div>

                      {/* Skeletons for messages */}
                      {/* Received message */}
                      <div style={{ display: 'flex', marginBottom: 16, alignItems: 'flex-end' }}>
                        <Skeleton.Avatar active size="small" style={{ marginRight: 8 }} />
                        <div style={{ maxWidth: '60%' }}>
                          <div style={{
                            background: '#f5f5f5',
                            borderRadius: '12px',
                            padding: '10px'
                          }}>
                            <Skeleton.Input active style={{ width: 80, height: 14 }} size="small" />
                            <div style={{ marginTop: 4 }}>
                              <Skeleton.Input active style={{ width: 140, height: 14 }} size="small" />
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <Skeleton.Input active style={{ width: 180, height: 14 }} size="small" />
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              marginTop: 4
                            }}>
                              <Skeleton.Input active style={{ width: 40, height: 10 }} size="small" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sent message */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: 16
                      }}>
                        <div style={{ maxWidth: '60%' }}>
                          <div style={{
                            background: '#e6f7ff',
                            borderRadius: '12px',
                            padding: '10px'
                          }}>
                            <Skeleton.Input active style={{ width: 160, height: 14 }} size="small" />
                            <div style={{ marginTop: 4 }}>
                              <Skeleton.Input active style={{ width: 120, height: 14 }} size="small" />
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              marginTop: 4
                            }}>
                              <Skeleton.Input active style={{ width: 40, height: 10 }} size="small" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Another received message */}
                      <div style={{ display: 'flex', marginBottom: 16, alignItems: 'flex-end' }}>
                        <Skeleton.Avatar active size="small" style={{ marginRight: 8 }} />
                        <div style={{ maxWidth: '60%' }}>
                          <div style={{
                            background: '#f5f5f5',
                            borderRadius: '12px',
                            padding: '10px'
                          }}>
                            <Skeleton.Input active style={{ width: 200, height: 14 }} size="small" />
                            <div style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              marginTop: 4
                            }}>
                              <Skeleton.Input active style={{ width: 40, height: 10 }} size="small" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message input skeleton */}
                    <div style={{
                      borderTop: '1px solid #f0f0f0',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Skeleton.Button active style={{ width: 32, height: 32, marginRight: 8 }} shape="circle" />
                      <Skeleton.Input active style={{ flex: 1, height: 36 }} size="default" />
                      <Skeleton.Button active style={{ width: 32, height: 32, marginLeft: 8 }} shape="circle" />
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {messagesLoading && messages.length > 0 && (
                      <div style={{
                        textAlign: "center",
                        padding: "10px 0",
                        display: "flex",
                        justifyContent: "center"
                      }}>
                        <Spin size="small" />
                      </div>
                    )}

                    {/* Message content area */}
                    <div style={{ flex: 1 }}>
                      {messages.length > 0 ? (
                        <>
                          {/* Message list */}
                          {messages.map((msg: MessageResponseModel) => (
                            msg.isDateSeparator ? (
                              <DateSeparator
                                key={msg.id}
                                date={msg.content || ""}
                              />
                            ) : (
                              <MessageItem
                                key={msg.id || `temp-${msg.created_at}`}
                                message={msg}
                                onDelete={deleteMessage}
                                onReply={handleReply}
                              />
                            )
                          ))}
                        </>
                      ) : initialMessagesLoaded ? (
                        <Empty
                          description={localStrings.Messages.NoMessages}
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          style={{ marginTop: 40 }}
                        />
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" }}>
                <div style={{ textAlign: "center", opacity: 0.5 }}>
                  <div style={{ fontSize: 64, marginBottom: 20 }}>💬</div>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    {localStrings.Messages.SelectConversationToChat}
                  </Text>
                </div>
              </div>
            )}
          </Content>

          {/* Message Input */}
          <div style={{
            padding: "12px 16px",
            borderTop: `1px solid ${borderColor}`,
            background: layoutBackground,
            display: "flex",
            flexDirection: "column",
          }}>
            
            {currentConversation && (
              <>
              {replyToMessage && (
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderRadius: "4px",
              marginBottom: "8px"
            }}>
              <div style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: primaryTextColor
              }}>
                <span style={{ fontWeight: "bold" }}>
                  {localStrings.Messages.ReplyingTo} 
                  {replyToMessage.user_id === user?.id ? 
                    ` ${localStrings.Messages.Yourself}` : 
                    ` ${replyToMessage.user?.family_name || ''} ${replyToMessage.user?.name || ''}`}:
                </span> {" "}
                {replyToMessage.content}
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={cancelReply}
                style={{ marginLeft: "8px" }}
              />
            </div>
          )}
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Popover
                    content={
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        searchPlaceholder="Tìm emoji..."
                        width={300}
                        height={400}
                        theme={Theme.LIGHT}
                        lazyLoadEmojis={true}
                      />
                    }
                    trigger="click"
                    open={emojiPickerVisible}
                    onOpenChange={setEmojiPickerVisible}
                    placement="topRight"
                  >
                    <Button
                      type="text"
                      icon={<SmileOutlined style={{ fontSize: "20px", color: iconSecondaryColor }} />}
                      style={{ marginRight: 8 }}
                    />
                  </Popover>

                  <Input
                    placeholder={localStrings.Messages.TypeMessage}
                    value={messageText}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setMessageText(newValue);
                      if (newValue.length > 500 && messageText.length <= 500) {
                        message.warning(localStrings.Messages.MessageTooLong);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    status={messageText.length > 500 ? "error" : ""}
                    style={{
                      borderRadius: 20,
                      padding: "8px 12px",
                      flex: 1,
                      backgroundColor: inputBackground,
                      color: inputTextColor,
                      borderColor: inputBorderColor
                    }}
                    className="message-input"
                  />

                  <style>{`
                    .message-input::placeholder {
                      color: ${inputPlaceholderColor} !important;
                    }
                    .message-input:hover {
                      border-color: ${input.hoverBorderColor} !important;
                    }
                    .message-input:focus {
                      border-color: ${input.hoverBorderColor} !important;
                      box-shadow: 0 0 0 2px rgba(${theme === 'dark' ? '23, 125, 220' : '24, 144, 255'}, 0.2) !important;
                    }
                  `}</style>

                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined style={{ color: iconActionColor }} />}
                    onClick={handleSendMessage}
                    style={{ marginLeft: 8 }}
                    disabled={!messageText.trim() || messageText.length > 500}
                  />
                </div>

                {/* Character counter */}
                <div style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: "12px",
                  marginTop: "4px",
                  color: messageText.length > 500 
                    ? indicators.error 
                    : indicators.normal
                }}>
                  {messageText.length}/500
                </div>
              </>
            )}
          </div>
        </Layout>
      )}

      {/* New Conversation Modal */}
      <NewConversationModal
        visible={newConversationModalVisible}
        onCancel={() => setNewConversationModalVisible(false)}
        onCreateConversation={createConversation}
        onConversationCreated={(newConversation) => {
          handleSelectConversation(newConversation);
        }}
      />

      {/* Edit Conversation Modal */}
      <EditConversationModal
        visible={editConversationModalVisible}
        onCancel={() => setEditConversationModalVisible(false)}
        onUpdateConversation={handleUpdateConversation}
        currentConversation={currentConversation}
      />

      <AddMemberModal
        visible={addMemberModalVisible}
        onCancel={() => setAddMemberModalVisible(false)}
        onAddMembers={handleAddMembers}
        conversationId={currentConversation?.id}
        existingMemberIds={existingMemberIds}
        existingMembers={existingMembers}
        userRole={userRole}
        onRefreshConversation={handleRefreshAfterRoleChange}
      />
    </Layout>
  );
};

export default MessagesFeature