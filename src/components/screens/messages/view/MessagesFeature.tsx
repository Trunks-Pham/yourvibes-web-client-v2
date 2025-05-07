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
import { EllipsisOutlined, DeleteOutlined, InboxOutlined, SendOutlined, SearchOutlined, ArrowLeftOutlined, PlusOutlined, SmileOutlined, VideoCameraOutlined, CloseOutlined } from '@ant-design/icons';
import { Empty, Layout, Skeleton, Typography, Popover, Menu, Dropdown, Popconfirm, Input, Button, Upload, Modal, Form, List, Avatar, Spin, message, Checkbox, Tabs } from 'antd';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState, useRef, useMemo  } from 'react';
import io from 'socket.io-client';

const themeColors = {
  messageBubble: {
    light: {
      sender: {
        background: '#e0f0ff', 
        color: '#000',
      },
      receiver: {
        background: '#E2E2E2',
        color: 'inherit',
      }
    },
    dark: {
      sender: {
        background: '#2f3f5c', 
        color: '#fff',         
      },
      receiver: {
        background: '#62676B',
        color: '#ffffff',     
      }
    }
  },
  layout: {
    light: {
      background: '#ffffff', 
      siderBg: '#F6F6F6', 
      headerBg: '#ffffff', 
      border: '#E2E2E2', 
      activeItem: '#E2E2E2', 
    },
    dark: {
      background: '#262930', 
      siderBg: '#202427', 
      headerBg: '#202427', 
      border: '#62676B', 
      activeItem: '#31343B', 
    }
  },
  text: {
    light: {
      primary: '#000000',        
      secondary: 'rgba(0, 0, 0, 0.45)', 
    },
    dark: {
      primary: '#ffffff',       
      secondary: 'rgba(255, 255, 255, 0.85)', 
    }
  },
  icons: {
    light: {
      primary: '#000000',          
      secondary: 'rgba(0, 0, 0, 0.65)', 
      action: '#1890ff',  
      delete: '#2f3f5c',         
    },
    dark: {
      primary: '#ffffff',         
      secondary: 'rgba(255, 255, 255, 0.85)', 
      action: '#40a9ff',   
      delete: '#ffffff'      
    }
  },
  sidebar: {
    light: {
      text: '#000000',
      secondaryText: 'rgba(0, 0, 0, 0.45)',
    },
    dark: {
      text: '#ffffff',              
      secondaryText: '#e0e0e0',    
    }
  },
  avatar: {
    light: '#1890ff',
    dark: '#ffffff', 
  },
  button: {
    light: {
      defaultBg: '#ffffff',
      defaultBorder: '#d9d9d9',
      defaultText: 'rgba(0, 0, 0, 0.85)',
      defaultHoverBg: '#fafafa',
      primaryBg: '#1890ff',
      primaryText: '#ffffff',
      primaryHoverBg: '#40a9ff'
    },
    dark: {
      defaultBg: '#141414',
      defaultBorder: '#434343',
      defaultText: 'rgba(255, 255, 255, 0.85)',
      defaultHoverBg: '#1f1f1f',
      primaryBg: '#177ddc',
      primaryText: '#ffffff',
      primaryHoverBg: '#1f6bb4'
    }
  },
  dateSeparator: {
    light: {
      background: '#f0f2f5',
      line: 'rgba(0, 0, 0, 0.1)',
      text: '#65676B',
    },
    dark: {
      background: '#262930',
      line: 'rgba(255, 255, 255, 0.1)',
      text: '#a0a0a0',
    }
  },
  search: {
    light: {
      background: '#ffffff',
      textColor: 'rgba(0, 0, 0, 0.85)',
      placeholderColor: 'rgba(0, 0, 0, 0.45)',
      borderColor: '#d9d9d9',
      buttonBackground: '#ffffff',
      buttonHoverBackground: '#f5f5f5',
      iconColor: 'rgba(0, 0, 0, 0.45)'
    },
    dark: {
      background: '#2d2d30',
      textColor: 'rgba(255, 255, 255, 0.85)',
      placeholderColor: 'rgba(255, 255, 255, 0.45)',
      borderColor: '#3e3e42',
      buttonBackground: '#3e3e42',
      buttonHoverBackground: '#4e4e52',
      iconColor: 'rgba(255, 255, 255, 0.65)'
    }
  },
  indicators: {
    light: {
      normal: 'rgba(0, 0, 0, 0.45)',
      warning: '#faad14',
      error: '#ff4d4f'
    },
    dark: {
      normal: 'rgba(255, 255, 255, 0.65)',
      warning: '#faad14',
      error: '#ff4d4f'
    }
  },
  
  dropdown: {
    light: {
      background: '#ffffff',
      itemHover: '#f5f5f5',
      borderColor: '#d9d9d9',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      textColor: '#000000',
      dangerColor: '#ff4d4f',
      dangerHoverBg: '#fff1f0'
    },
    dark: {
      background: '#202427',
      itemHover: '#2c3033',
      borderColor: '#434343',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
      textColor: '#ffffff',
      dangerColor: '#ff7875',
      dangerHoverBg: '#2a1215'
    }
  },
  modal: {
    light: {
      background: '#ffffff',
      headerBg: '#ffffff',
      footerBg: '#ffffff',
      titleColor: '#000000',
      borderColor: '#e8e8e8',
      boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)',
      maskBg: 'rgba(0, 0, 0, 0.45)'
    },
    dark: {
      background: '#202427',
      headerBg: '#202427',
      footerBg: '#202427',
      titleColor: '#ffffff',
      borderColor: '#434343',
      boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 6px 16px 0 rgba(0, 0, 0, 0.32)',
      maskBg: 'rgba(0, 0, 0, 0.65)'
    }
  },
  
  upload: {
    light: {
      background: '#fafafa',
      hoverBg: '#f5f5f5',
      borderColor: '#d9d9d9',
      textColor: 'rgba(0, 0, 0, 0.85)',
      iconColor: '#1890ff'
    },
    dark: {
      background: '#141414',
      hoverBg: '#1f1f1f',
      borderColor: '#434343',
      textColor: 'rgba(255, 255, 255, 0.85)',
      iconColor: '#177ddc'
    }
  },
  
  input: {
    light: {
      background: '#ffffff',
      borderColor: '#d9d9d9',
      hoverBorderColor: '#40a9ff',
      placeholderColor: 'rgba(0, 0, 0, 0.45)',
      textColor: 'rgba(0, 0, 0, 0.85)'
    },
    dark: {
      background: '#141414',
      borderColor: '#434343',
      hoverBorderColor: '#177ddc',
      placeholderColor: 'rgba(255, 255, 255, 0.45)',
      textColor: 'rgba(255, 255, 255, 0.85)'
    }
  },
};

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
  const { brandPrimary } = useColor();
  const [friends, setFriends] = useState<FriendResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("addMembers");
  const [existingMembersWithRole, setExistingMembersWithRole] = useState<ConversationMember[]>([]);
  const currentTheme = theme || 'light';
  
  // Theme variables
  const avatarBackground = themeColors.avatar[currentTheme];
  const primaryTextColor = themeColors.text[currentTheme].primary;
  const secondaryTextColor = themeColors.text[currentTheme].secondary;
  const borderColor = themeColors.layout[currentTheme].border;
  
  // Enhanced theming variables
  const modalBackground = currentTheme === 'dark' ? themeColors.layout[currentTheme].siderBg : '#ffffff';
  const modalTitleColor = currentTheme === 'dark' ? '#ffffff' : '#000000';
  const modalHeaderBg = currentTheme === 'dark' ? themeColors.layout[currentTheme].headerBg : '#ffffff';
  const cancelButtonBg = currentTheme === 'dark' ? '#2d2d30' : '#fff';
  const cancelButtonText = currentTheme === 'dark' ? '#ffffff' : '#000000';
  const cancelButtonBorder = currentTheme === 'dark' ? '#6e6e6e' : '#d9d9d9';
  const listItemHoverBg = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const listItemSelectedBg = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.05)';
  const listBackground = currentTheme === 'dark' ? '#1f1f1f' : '#ffffff';
  const warningBgColor = currentTheme === 'dark' ? '#2b2111' : '#fffbe6';
  const warningBorderColor = currentTheme === 'dark' ? '#644a05' : '#ffe58f';
  const warningTextColor = currentTheme === 'dark' ? '#faad14' : '#d48806';
  const infoBgColor = currentTheme === 'dark' ? '#111a2c' : '#e6f4ff';
  const infoBorderColor = currentTheme === 'dark' ? '#15395b' : '#91d5ff';
  const infoTextColor = currentTheme === 'dark' ? '#40a9ff' : '#1890ff';
  const tabBgColor = currentTheme === 'dark' ? '#202427' : '#ffffff';
  const tabActiveColor = currentTheme === 'dark' ? '#177ddc' : '#1890ff';
  const checkboxColor = currentTheme === 'dark' ? '#177ddc' : '#1890ff';
  const ownerBadgeBg = currentTheme === 'dark' ? '#177ddc' : '#1890ff';
  const memberBadgeBg = currentTheme === 'dark' ? '#333' : '#f5f5f5';
  const memberBadgeText = currentTheme === 'dark' ? '#e0e0e0' : '#555';

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
        disabled: selectedFriends.length === 0 || activeTab === "currentMembers"
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
          backgroundColor: currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)'
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

  const { theme } = useAuth();
  const currentTheme = theme || 'light';

  const separatorBackground = themeColors.dateSeparator[currentTheme].background;
  const lineColor = themeColors.dateSeparator[currentTheme].line;
  const textColor = themeColors.dateSeparator[currentTheme].text;


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
          backgroundColor: lineColor,
          position: "absolute",
          zIndex: 1
        }}
      />
      <div 
        style={{
          backgroundColor: separatorBackground,
          padding: "4px 12px",
          borderRadius: "16px",
          fontSize: "12px",
          color: textColor,
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
  const { brandPrimary } = useColor();
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);
  const [conversationImage, setConversationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const currentTheme = theme || 'light';
  
  // Get theme colors
  const primaryTextColor = themeColors.text[currentTheme].primary;
  const secondaryTextColor = themeColors.text[currentTheme].secondary;
  const modalBackground = themeColors.modal[currentTheme].background;
  const modalHeaderBg = themeColors.modal[currentTheme].headerBg;
  const modalFooterBg = themeColors.modal[currentTheme].footerBg;
  const modalTitleColor = themeColors.modal[currentTheme].titleColor;
  const modalBorderColor = themeColors.modal[currentTheme].borderColor;
  const uploadBg = themeColors.upload[currentTheme].background;
  const uploadHoverBg = themeColors.upload[currentTheme].hoverBg;
  const uploadBorderColor = themeColors.upload[currentTheme].borderColor;
  const uploadTextColor = themeColors.upload[currentTheme].textColor;
  const uploadIconColor = themeColors.upload[currentTheme].iconColor;
  const inputBg = themeColors.input[currentTheme].background;
  const inputBorderColor = themeColors.input[currentTheme].borderColor;
  const inputTextColor = themeColors.input[currentTheme].textColor;
  const inputPlaceholderColor = themeColors.input[currentTheme].placeholderColor;
  
  // Button colors
  const defaultButtonBg = themeColors.button[currentTheme].defaultBg;
  const defaultButtonBorder = themeColors.button[currentTheme].defaultBorder;
  const defaultButtonText = themeColors.button[currentTheme].defaultText;

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
          backgroundColor: themeColors.modal[currentTheme].maskBg
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
                    background: currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
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
}

const MessageItem = React.memo<MessageItemProps>(({ message, onDelete }) => {
  const { user, localStrings, theme } = useAuth();
  const { brandPrimary, lightGray } = useColor();
  const [hovering, setHovering] = useState(false);
  const currentTheme = theme || 'light';
  
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
    ? themeColors.messageBubble[currentTheme].sender.background 
    : themeColors.messageBubble[currentTheme].receiver.background;
    
  const messageColor = isMyMessage 
    ? themeColors.messageBubble[currentTheme].sender.color 
    : themeColors.messageBubble[currentTheme].receiver.color;
    
  const avatarBackground = !message.user?.avatar_url 
    ? themeColors.avatar[currentTheme] 
    : undefined;
    
  const deleteButtonBackground = themeColors.button[currentTheme].defaultBg;
  const deleteIconColor = currentTheme === 'dark' ? '#ffffff' : '#2f3f5c';
  
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
        alignItems: "center", 
        justifyContent: isMyMessage ? "flex-end" : "flex-start",
        marginBottom: "16px"
      }}
    >
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
              <DeleteOutlined style={{ fontSize: 16, color: themeColors.icons[currentTheme].delete }} />
            </div>
          </Popconfirm>
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
        
        {/* Message content */}
        <div style={{ 
          whiteSpace: "pre-wrap", 
          wordBreak: "break-word", 
          color: messageColor
        }}>
          {message.content}
        </div>
        
        {/* Timestamp */}
        <div style={{ fontSize: 10, textAlign: "right", marginTop: 4, opacity: 0.7 }}>
          {message.isTemporary ? (
            <span style={{ color: isMyMessage ? "rgba(255, 255, 255, 0.7)" : "inherit" }}>
            </span>
          ) : (
            <span style={{ 
              color: isMyMessage ? "rgba(255, 255, 255, 0.7)" : "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end"
            }}>
              {formatMessageTime(message.created_at || '')}
            </span>
          )}
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
  const { brandPrimary } = useColor();
  const [form] = Form.useForm();
  const [friends, setFriends] = useState<FriendResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [conversationImage, setConversationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const currentTheme = theme || 'light';
  const avatarBackground = themeColors.avatar[currentTheme];
  const primaryTextColor = themeColors.text[currentTheme].primary;
  const secondaryTextColor = themeColors.text[currentTheme].secondary;
  const borderColor = themeColors.layout[currentTheme].border;
  
  const modalBackground = currentTheme === 'dark' ? themeColors.layout[currentTheme].siderBg : '#ffffff';
  const modalTitleColor = currentTheme === 'dark' ? '#ffffff' : '#000000';
  const modalHeaderBg = currentTheme === 'dark' ? themeColors.layout[currentTheme].headerBg : '#ffffff';
  const inputBackground = currentTheme === 'dark' ? '#2d2d30' : '#ffffff';
  const inputBorder = currentTheme === 'dark' ? '#3e3e42' : '#d9d9d9';
  const inputPlaceholderColor = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
  const cancelButtonBg = currentTheme === 'dark' ? '#2d2d30' : '#fff';
  const cancelButtonText = currentTheme === 'dark' ? '#ffffff' : '#000000';
  const cancelButtonBorder = currentTheme === 'dark' ? '#6e6e6e' : '#d9d9d9';
  const listItemHoverBg = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const listItemSelectedBg = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.05)';
  const listBackground = currentTheme === 'dark' ? '#1f1f1f' : '#ffffff';
  const warningTextColor = currentTheme === 'dark' ? '#faad14' : '#fa8c16';

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
        message.warning(localStrings.Messages.SelectAtLeastOneFriend);
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
      
      const newConversation = await onCreateConversation(
        conversationName, 
        conversationImage || undefined, 
        userIdsToAdd
      );
      
      if (newConversation && newConversation.id) {
        form.resetFields();
        setSelectedFriends([]);
        setConversationImage(null);
        setImagePreview(null);

        if (onConversationCreated) {
          onConversationCreated(newConversation);
        }
        
        onCancel();
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setCreating(false);
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
          backgroundColor: currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)'
        }
      }}
      closeIcon={<CloseOutlined style={{ color: primaryTextColor }} />}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
            name="name" 
            label={<span style={{ color: primaryTextColor }}>{localStrings.Messages.ConversationName}</span>}
            rules={[
              {
                validator: (_, value) => {
                  if (selectedFriends.length > 1 && !value) {
                    return Promise.reject(new Error(localStrings.Messages.GroupNameRequired));
                  }
                  return Promise.resolve();
                },
              },
            ]}
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
  const currentTheme = theme || 'light';
  const searchParams = useSearchParams(); // Thêm để lấy query params
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [existingMembers, setExistingMembers] = useState<FriendResponseModel[]>([]);
  const [incomingCall, setIncomingCall] = useState<{
    from: string;
    signalData: any;
    fromUser?: FriendResponseModel;
  } | null>(null);
  const socketRef = useRef<any>(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const { socketMessages, setSocketMessages } = useWebSocket();
  const [hasPermission, setHasPermission] = useState<boolean>(true); //sau khi bi kick khoi conversation se kiem tra de khong cho chat vao duoc neu nhu con dang mo conversation

  const layoutBackground = themeColors.layout[currentTheme].background;
  const siderBackground = themeColors.layout[currentTheme].siderBg;
  const borderColor = themeColors.layout[currentTheme].border;
  const activeItemBackground = themeColors.layout[currentTheme].activeItem;
  const avatarBackground = themeColors.avatar[currentTheme];
  const headerBackground = themeColors.layout[currentTheme].headerBg;
  const primaryTextColor = themeColors.text[currentTheme].primary;
  const secondaryTextColor = themeColors.text[currentTheme].secondary;
  const sidebarTextColor = themeColors.sidebar[currentTheme].text;
  const sidebarSecondaryTextColor = themeColors.sidebar[currentTheme].secondaryText;
  const iconPrimaryColor = themeColors.icons[currentTheme].primary;
  const iconSecondaryColor = themeColors.icons[currentTheme].secondary;
  const iconActionColor = themeColors.icons[currentTheme].action;
  const inputBackground = themeColors.layout[currentTheme].siderBg;
  const inputTextColor = themeColors.input[currentTheme].textColor;
  const inputBorderColor = themeColors.input[currentTheme].borderColor;
  const inputPlaceholderColor = themeColors.input[currentTheme].placeholderColor;
  const dropdownBg = themeColors.dropdown[currentTheme].background;
  const dropdownItemText = themeColors.dropdown[currentTheme].textColor;
  const dropdownItemHover = themeColors.dropdown[currentTheme].itemHover;
  const dropdownBorder = themeColors.dropdown[currentTheme].borderColor;
  const dropdownBoxShadow = themeColors.dropdown[currentTheme].boxShadow;
  const dropdownDangerColor = themeColors.dropdown[currentTheme].dangerColor;
  const dropdownDangerHoverBg = themeColors.dropdown[currentTheme].dangerHoverBg;

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
    fetchMessages,
    isMessagesEnd,
    loadMoreMessages,
    messageListRef,
    handleScroll,
    getMessagesForConversation,
    initialMessagesLoaded,
    markConversationAsRead,
    addConversationMembers,
    leaveConversation,
    unreadMessageCounts,
    resetUnreadCount,
    getCurrentUserRole,
    isUserConversationOwner,
  } = useMessagesViewModel();

  const [isMobile, setIsMobile] = useState(false);
  const [showConversation, setShowConversation] = useState(true);
  const { backgroundColor, lightGray, brandPrimary } = useColor();
  const [editConversationModalVisible, setEditConversationModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);
  const conversationIdFromUrl = searchParams.get("conversation_id");

  interface SocketCallPayload {
    from: string;
    signalData: any; 
    callType: 'video' | 'audio';
  }
  
  interface SocketEndCallPayload {
    from: string;
    reason?: string;
  }

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
    if (user?.id) {
      const socketUrl = process.env.NEXT_PUBLIC_VIDEO_CHAT_SERVER;
      socketRef.current = io(socketUrl);
      
      socketRef.current.emit('register', user.id);
      
      socketRef.current.on('call-ended', ({ from }: SocketEndCallPayload) => {
        console.log('Call ended by caller:', from);
        if (incomingCall && incomingCall.from === from) {
          console.log('Closing incoming call modal for caller:', from);
          setIncomingCall(null);
        }
      });
      
      initializeSocket();
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [user?.id, incomingCall]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentConversation?.id) {
      markConversationAsRead(currentConversation.id);
      resetUnreadCount(currentConversation.id);
    }
  }, [currentConversation?.id]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentConversation?.id) {
        markConversationAsRead(currentConversation.id);
      }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentConversation?.id, markConversationAsRead]);

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
      return;
    }
  
    setCurrentConversation(conversation);
    setHasPermission(true);
  
    // setTimeout(() => {
    //   if (conversation.id) {
    //     fetchMessages(conversation.id);
    //     markConversationAsRead(conversation.id);
    //     resetUnreadCount(conversation.id); 
    //   }
    // }, 200);
  };
  
  // useEffect(() => {
  //   if (conversationIdFromUrl && conversations.length > 0) {
  //     const selectedConversation = conversations.find(conv => conv.id === conversationIdFromUrl);
  //     if (selectedConversation && selectedConversation.id !== currentConversation?.id) {
  //       handleSelectConversation(selectedConversation);
  //     }
  //   }
  // }, [conversationIdFromUrl, conversations, currentConversation?.id, handleSelectConversation]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  const handleSendMessage = async () => {
    if (!user?.id || !currentConversation?.id) return;
    
    // try {
    //   const response = await defaultMessagesRepo.getConversationDetailByUserID({
    //     conversation_id: currentConversation.id
    //   });
      
    //   if (response.data) {
    //     const members = Array.isArray(response.data) ? response.data : [response.data];
    //     const userExists = members.some(member => member.user_id === user.id);
        
    //     if (!userExists) {
    //       setHasPermission(false);
    //       message.error(localStrings.Messages.YouHaveBeenRemoved);
    //       setCurrentConversation(null);
    //       fetchConversations();
    //       return;
    //     }
    //   }
    // } catch (error) {
    //   console.error("Error checking permission:", error);
    //   return;
    // }
    
    if (messageText.trim() && currentConversation && messageText.length <= 500) {
      sendMessage();
    } else if (messageText.length > 500) {
      message.error(localStrings.Messages.MessageTooLong);
    }
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

  const findUserById = async (userId: string): Promise<FriendResponseModel | undefined> => {
    if (conversations.length > 0) {
      for (const conv of conversations) {
        if (!conv.id) continue;
        
        const messages = getMessagesForConversation(conv.id);
        const fromMessage = messages.find(m => m.user_id === userId && !m.isDateSeparator);
        
        if (fromMessage && fromMessage.user) {
          return {
            id: fromMessage.user.id,
            name: fromMessage.user.name,
            family_name: fromMessage.user.family_name,
            avatar_url: fromMessage.user.avatar_url
          } as FriendResponseModel;
        }
      }
    }
    
    try {
      if (user?.id) {
        const response = await defaultProfileRepo.getListFriends({
          user_id: user.id,
          limit: 50,
          page: 1
        });
        
        if (response.data) {
          const friends = response.data as FriendResponseModel[];
          const friend = friends.find(f => f.id === userId);
          
          if (friend) {
            return friend;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching friends for caller ID:", error);
    }
    
    return undefined;
  };

  const handleVideoCall = (conversation: ConversationResponseModel) => {
    if (!conversation?.id || !user?.id) return;

    setInCall(true);
  
    const conversationMessages = getMessagesForConversation(conversation.id);
    const actualMessages = conversationMessages.filter(msg => !msg.isDateSeparator);
    
    const isOneOnOneChat = conversation.name?.includes(" & ") ||
      (actualMessages.some(msg => msg.user_id !== user?.id) &&
        new Set(actualMessages.map(msg => msg.user_id)).size <= 2);
    
    let calleeId = "";
    if (isOneOnOneChat) {
      const otherUserMessage = actualMessages.find(msg => msg.user_id !== user?.id);
      if (otherUserMessage?.user_id) {
        calleeId = otherUserMessage.user_id;
      }
    }
    
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    const videoCallWindow = window.open(
      '', 
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!videoCallWindow) {
      message.error("Không thể mở cửa sổ video call. Vui lòng kiểm tra trình chặn popup.");
      if (socketRef.current) {
        socketRef.current.emit('call-declined', {
          to: incomingCall?.from,
          from: user?.id,
          reason: 'Người dùng từ chối cuộc gọi'
        });
      }
      setIncomingCall(null);
      return;
    }
    
    videoCallWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Video Call | ${conversation.name}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          
          body {
            background-color: #000;
            overflow: hidden;
          }
          
          #remote-video {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            z-index: 0;
          }
          
          #local-video {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 200px;
            height: 150px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #fff;
            z-index: 1;
          }
          
          .controls {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 20px;
            gap: 10px;
            z-index: 2;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
          }
          
          .btn {
            padding: 12px 20px;
            border-radius: 50px;
            border: none;
            outline: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          .end-call {
            background-color: #f5222d;
          }
          
          .mute, .video-toggle {
            background-color: rgba(255,255,255,0.2);
          }
          
          .btn:hover {
            opacity: 0.8;
          }
          
          .btn svg {
            margin-right: 6px;
          }
          
          .waiting {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            text-align: center;
            z-index: 3;
          }
          
          .waiting h2 {
            margin-bottom: 10px;
          }
          
          .incoming-call {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            color: white;
            z-index: 4;
          }
          
          .incoming-call h2 {
            margin-bottom: 20px;
          }
          
          .incoming-call .buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
          }
          
          .accept {
            background-color: #52c41a;
          }
          
          .decline {
            background-color: #f5222d;
          }
        </style>
      </head>
      <body>
        <video id="remote-video" autoplay playsinline></video>
        <video id="local-video" autoplay playsinline muted></video>
        
        <div id="waiting" class="waiting">
          <h2>Đang gọi...</h2>
          <p>Vui lòng chờ người nhận trả lời</p>
        </div>
        
        <div id="incoming-call" class="incoming-call" style="display: none;">
          <h2>Cuộc gọi đến</h2>
          <div class="buttons">
            <button id="accept-call" class="btn accept">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
              </svg>
              Trả lời
            </button>
            <button id="decline-call" class="btn decline">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
              </svg>
              Từ chối
            </button>
          </div>
        </div>
        
        <div class="controls">
          <button id="mute-btn" class="btn mute">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
              <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
            </svg>
            Tắt mic
          </button>
          <button id="video-btn" class="btn video-toggle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175l3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
            </svg>
            Tắt camera
          </button>
          <button id="end-call" class="btn end-call">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/>
              <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
            Kết thúc
          </button>
        </div>
        
        <script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script>
        <script src="https://unpkg.com/simple-peer@9.11.0/simplepeer.min.js"></script>
        <script>
          const socket = io('${process.env.NEXT_PUBLIC_VIDEO_CHAT_SERVER || 'http://localhost:5000'}');
          
          // Thông tin người dùng
          const myUserId = '${user?.id}';
          const conversationId = '${conversation.id}';
          const conversationName = '${conversation.name?.replace(/'/g, "\\'")}';
          const isOneOnOne = ${isOneOnOneChat};
          const calleeId = '${calleeId}';
          
          // DOM elements
          const localVideo = document.getElementById('local-video');
          const remoteVideo = document.getElementById('remote-video');
          const muteBtn = document.getElementById('mute-btn');
          const videoBtn = document.getElementById('video-btn');
          const endCallBtn = document.getElementById('end-call');
          const waitingDiv = document.getElementById('waiting');
          const incomingCallDiv = document.getElementById('incoming-call');
          const acceptCallBtn = document.getElementById('accept-call');
          const declineCallBtn = document.getElementById('decline-call');
          
          // Biến theo dõi trạng thái
          let localStream = null;
          let remoteStream = null;
          let peer = null;
          let isCaller = false;
          let isCalleeId = null;
          let callAccepted = false;
          let isMuted = false;
          let isVideoOff = false;
          
          // Hàm khởi tạo
          async function initialize() {
            try {
              // Lấy video và audio từ người dùng
              localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
              });
              
              // Hiển thị video người dùng
              localVideo.srcObject = localStream;
              
              // Đăng ký người dùng
              socket.emit('register', myUserId);
              
              // Nếu đây là một cuộc gọi 1-1 và có calleeId, bắt đầu gọi
              if (isOneOnOne && calleeId) {
                isCaller = true;
                callUser(calleeId);
              } else {
                // Ẩn phần đang gọi nếu không phải là người gọi
                waitingDiv.style.display = 'none';
              }
              
              // Thiết lập các sự kiện Socket.IO
              setupSocketEvents();
              
              // Thiết lập các sự kiện UI
              setupUIEvents();
            } catch (error) {
              console.error('Không thể khởi tạo video call:', error);
              alert('Không thể truy cập camera hoặc microphone. Vui lòng kiểm tra quyền truy cập.');
              window.close();
            }
          }
          
          // Thiết lập các sự kiện Socket.IO
          function setupSocketEvents() {
            // Nhận cuộc gọi đến
            socket.on('call-incoming', ({ from, signalData, callType }) => {
              if (callType === 'video') {
                isCalleeId = from;
                
                // Hiển thị UI cuộc gọi đến
                incomingCallDiv.style.display = 'block';
                
                // Lưu signal data để sử dụng khi trả lời
                window.callerSignalData = signalData;
              }
            });
            
            // Cuộc gọi được chấp nhận
            socket.on('call-accepted', ({ from, signalData }) => {
              if (isCaller && from === calleeId) {
                callAccepted = true;
                waitingDiv.style.display = 'none';
                
                // Signal cho peer connection
                peer.signal(signalData);
              }
            });
            
            // Cuộc gọi bị từ chối
            socket.on('call-declined', ({ from, reason }) => {
              alert(\`Cuộc gọi bị từ chối: \${reason || 'Người dùng không muốn trả lời'}\`);
              window.close();
            });
            
            // Cuộc gọi kết thúc
            socket.on('call-ended', ({ from }) => {
              endCall(false);
            });
          }
          
          // Thiết lập các sự kiện UI
          function setupUIEvents() {
            // Bật/tắt microphone
            muteBtn.addEventListener('click', () => {
              if (localStream) {
                const audioTracks = localStream.getAudioTracks();
                if (audioTracks.length > 0) {
                  const enabled = !audioTracks[0].enabled;
                  audioTracks[0].enabled = enabled;
                  isMuted = !enabled;
                  muteBtn.innerHTML = isMuted ? 
                    \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                      <path d="M10.707 11.182A4.486 4.486 0 0 0 12.025 8a4.486 4.486 0 0 0-1.318-3.182L10 5.525A3.489 3.489 0 0 1 11.025 8c0 .966-.392 1.841-1.025 2.475l.707.707z"/>
                      <path d="M9.293 12.95l.707.707A5.483 5.483 0 0 0 13.025 8a5.483 5.483 0 0 0-3.025-4.95l-.707.707A4.486 4.486 0 0 1 12.025 8c0 1.439-.675 2.72-1.725 3.537l-1.007-.993z"/>
                      <path d="M10.121 14.536l.707.707A6.48 6.48 0 0 0 14.025 8a6.48 6.48 0 0 0-3.197-5.584l-.707.707A5.483 5.483 0 0 1 13.025 8a5.483 5.483 0 0 1-2.904 4.829l-1 .707z"/>
                    </svg> Bật mic\` :
                    \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
                      <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                    </svg> Tắt mic\`;
                }
              }
            });
            
            // Bật/tắt camera
            videoBtn.addEventListener('click', () => {
              if (localStream) {
                const videoTracks = localStream.getVideoTracks();
                if (videoTracks.length > 0) {
                  const enabled = !videoTracks[0].enabled;
                  videoTracks[0].enabled = enabled;
                  isVideoOff = !enabled;
                  videoBtn.innerHTML = isVideoOff ? 
                    \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z"/>
                    </svg> Bật camera\` :
                    \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175l3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
                    </svg> Tắt camera\`;
                }
              }
            });
            
            // Kết thúc cuộc gọi
            endCallBtn.addEventListener('click', () => {
              endCall(true);
            });
            
            // Chấp nhận cuộc gọi
            acceptCallBtn.addEventListener('click', () => {
              answerCall();
            });
            
            // Từ chối cuộc gọi
            declineCallBtn.addEventListener('click', () => {
              declineCall();
            });
          }
          
          // Gọi cho người dùng khác
          function callUser(userId) {
            // Hiển thị phần chờ
            waitingDiv.style.display = 'block';
            
            // Tạo peer connection
            peer = new SimplePeer({
              initiator: true,
              trickle: false,
              stream: localStream
            });
            
            // Khi có tín hiệu cục bộ
            peer.on('signal', (data) => {
              // Gửi tín hiệu đến người được gọi
              socket.emit('call-user', {
                to: userId,
                from: myUserId,
                signalData: data,
                callType: 'video'
              });
            });
            
            // Khi nhận được stream từ bạn
            peer.on('stream', (stream) => {
              remoteStream = stream;
              remoteVideo.srcObject = stream;
              waitingDiv.style.display = 'none';
            });
            
            // Xử lý lỗi
            peer.on('error', (err) => {
              console.error('Peer connection error:', err);
              alert('Có lỗi xảy ra với kết nối. Vui lòng thử lại sau.');
              window.close();
            });
          }
          
          // Trả lời cuộc gọi
          function answerCall() {
            callAccepted = true;
            incomingCallDiv.style.display = 'none';
            
            // Tạo peer connection
            peer = new SimplePeer({
              initiator: false,
              trickle: false,
              stream: localStream
            });
            
            // Khi có tín hiệu cục bộ
            peer.on('signal', (data) => {
              // Gửi tín hiệu đến người gọi
              socket.emit('call-accepted', {
                to: isCalleeId,
                from: myUserId,
                signalData: data
              });
            });
            
            // Khi nhận được stream từ bạn
            peer.on('stream', (stream) => {
              remoteStream = stream;
              remoteVideo.srcObject = stream;
            });
            
            // Xử lý lỗi
            peer.on('error', (err) => {
              console.error('Peer connection error:', err);
              alert('Có lỗi xảy ra với kết nối. Vui lòng thử lại sau.');
              window.close();
            });
            
            // Signal với dữ liệu từ người gọi
            peer.signal(window.callerSignalData);
          }
          
          // Từ chối cuộc gọi
          function declineCall() {
            if (isCalleeId) {
              socket.emit('call-declined', {
                to: isCalleeId,
                from: myUserId,
                reason: 'Người dùng từ chối cuộc gọi'
              });
            }
            window.close();
          }
          
          // Kết thúc cuộc gọi
          function endCall(sendSignal = true) {
            // Gửi tín hiệu kết thúc cuộc gọi
            if (sendSignal) {
              if (isCaller && calleeId) {
                socket.emit('end-call', {
                  to: calleeId,
                  from: myUserId
                });
              } else if (isCalleeId) {
                socket.emit('end-call', {
                  to: isCalleeId,
                  from: myUserId
                });
              }
            }
            
            // Dừng các stream
            if (localStream) {
              localStream.getTracks().forEach(track => track.stop());
            }
            
            // Đóng kết nối peer
            if (peer) {
              peer.destroy();
            }
            
            // Đóng socket
            socket.disconnect();
            
            // Đóng cửa sổ
            window.close();
          }
          
          // Khi cửa sổ đóng
          window.onbeforeunload = () => {
            // Gửi thông báo về trang chính rằng cuộc gọi đã kết thúc
            try {
              window.opener && window.opener.postMessage('call_ended', '*');
            } catch (e) {
              console.error('Error posting message to opener:', e);
            }
            
            endCall(true);
          };
          
          // Khởi tạo
          initialize();

          window.addEventListener('beforeunload', function() {
            // Đảm bảo socket được đóng đúng cách
            if (socket) {
              endCall(true);
              socket.disconnect();
            }
          });
        </script>
      </body>
      </html>
    `);
    
    videoCallWindow.document.close();

    const checkWindowClosed = setInterval(() => {
      if (videoCallWindow.closed) {
        clearInterval(checkWindowClosed);
        setInCall(false); 
        
        setTimeout(() => {
          initializeSocket();
        }, 1000);
      }
    }, 1000);
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;

    setInCall(true);
    
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    const videoCallWindow = window.open(
      '', 
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!videoCallWindow) {
      message.error("Không thể mở cửa sổ video call. Vui lòng kiểm tra trình chặn popup.");
      socketRef.current.emit('call-declined', {
        to: incomingCall.from,
        from: user?.id,
        reason: 'Không thể mở cửa sổ video call'
      });
      setIncomingCall(null);
      return;
    }
    
    const signalData = incomingCall.signalData;
    
    videoCallWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Video Call | ${incomingCall.fromUser ? `${incomingCall.fromUser.family_name || ''} ${incomingCall.fromUser.name || ''}` : 'Incoming Call'}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* CSS giống như trong hàm handleVideoCall */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          
          body {
            background-color: #000;
            overflow: hidden;
          }
          
          #remote-video {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            z-index: 0;
          }
          
          #local-video {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 200px;
            height: 150px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #fff;
            z-index: 1;
          }
          
          .controls {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 20px;
            gap: 10px;
            z-index: 2;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
          }
          
          .btn {
            padding: 12px 20px;
            border-radius: 50px;
            border: none;
            outline: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          .end-call {
            background-color: #f5222d;
          }
          
          .mute, .video-toggle {
            background-color: rgba(255,255,255,0.2);
          }
          
          .btn:hover {
            opacity: 0.8;
          }
          
          .btn svg {
            margin-right: 6px;
          }
        </style>
      </head>
      <body>
        <video id="remote-video" autoplay playsinline></video>
        <video id="local-video" autoplay playsinline muted></video>
        
        <div class="controls">
          <button id="mute-btn" class="btn mute">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
              <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
            </svg>
            Tắt mic
          </button>
          <button id="video-btn" class="btn video-toggle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175l3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
            </svg>
            Tắt camera
          </button>
          <button id="end-call" class="btn end-call">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/>
              <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
            Kết thúc
          </button>
        </div>
        
        <script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script>
        <script src="https://unpkg.com/simple-peer@9.11.0/simplepeer.min.js"></script>
        <script>
          // Script mã JavaScript tương tự như trong handleVideoCall, nhưng với trạng thái người nhận cuộc gọi
          const socket = io('${process.env.NEXT_PUBLIC_VIDEO_CHAT_SERVER || 'http://localhost:5000'}');
          
          // Thông tin người dùng
          const myUserId = '${user?.id}';
          const callerId = '${incomingCall.from}';
          
          // DOM elements
          const localVideo = document.getElementById('local-video');
          const remoteVideo = document.getElementById('remote-video');
          const muteBtn = document.getElementById('mute-btn');
          const videoBtn = document.getElementById('video-btn');
          const endCallBtn = document.getElementById('end-call');
          
          // Biến theo dõi trạng thái
          let localStream = null;
          let remoteStream = null;
          let peer = null;
          let callAccepted = false;
          let isMuted = false;
          let isVideoOff = false;
          
          // Signal data từ người gọi
          const callerSignalData = ${JSON.stringify(signalData)};
          
          // Hàm khởi tạo
          async function initialize() {
            try {
              // Lấy video và audio từ người dùng
              try {
                localStream = await navigator.mediaDevices.getUserMedia({ 
                  video: true, 
                  audio: true 
                });
              } catch (mediaError) {
                console.error('Media error:', mediaError);
                // Thử lại với chỉ audio nếu video thất bại
                alert('Không thể truy cập camera. Đang thử lại với chỉ microphone...');
                try {
                  localStream = await navigator.mediaDevices.getUserMedia({ 
                    video: false, 
                    audio: true 
                  });
                } catch (audioError) {
                  console.error('Audio-only error:', audioError);
                  alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập và làm mới trang.');
                  return;
                }
              }
              
              // Hiển thị video người dùng
              if (localStream) {
                localVideo.srcObject = localStream;
              }
              
              // Đăng ký người dùng
              socket.emit('register', myUserId);
              
              // Thiết lập các sự kiện Socket.IO
              setupSocketEvents();
              
              // Thiết lập các sự kiện UI
              setupUIEvents();
              
              // Trả lời cuộc gọi ngay
              answerCall();
            } catch (error) {
              console.error('General initialization error:', error);
              alert('Không thể khởi tạo video call: ' + error.message);
            }
          }
          
          // Thiết lập các sự kiện Socket.IO
          function setupSocketEvents() {
            // Cuộc gọi kết thúc
            socket.on('call-ended', ({ from }) => {
              if (from === callerId) {
                endCall(false);
              }
            });
          }
          
          // Thiết lập các sự kiện UI
          function setupUIEvents() {
            // Bật/tắt microphone
            muteBtn.addEventListener('click', () => {
              if (localStream) {
                const audioTracks = localStream.getAudioTracks();
                if (audioTracks.length > 0) {
                  const enabled = !audioTracks[0].enabled;
                  audioTracks[0].enabled = enabled;
                  isMuted = !enabled;
                  muteBtn.innerHTML = isMuted ? 
                    \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                      <path d="M10.707 11.182A4.486 4.486 0 0 0 12.025 8a4.486 4.486 0 0 0-1.318-3.182L10 5.525A3.489 3.489 0 0 1 11.025 8c0 .966-.392 1.841-1.025 2.475l.707.707z"/>
                      <path d="M9.293 12.95l.707.707A5.483 5.483 0 0 0 13.025 8a5.483 5.483 0 0 0-3.025-4.95l-.707.707A4.486 4.486 0 0 1 12.025 8c0 1.439-.675 2.72-1.725 3.537l-1.007-.993z"/>
                      <path d="M10.121 14.536l.707.707A6.48 6.48 0 0 0 14.025 8a6.48 6.48 0 0 0-3.197-5.584l-.707.707A5.483 5.483 0 0 1 13.025 8a5.483 5.483 0 0 1-2.904 4.829l-1 .707z"/>
                    </svg> Bật mic\` :
                    \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
                      <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                    </svg> Tắt mic\`;
                }
              }
            });
            
            // Bật/tắt camera
            videoBtn.addEventListener('click', () => {
              if (localStream) {
                const videoTracks = localStream.getVideoTracks();
                if (videoTracks.length > 0) {
                  const enabled = !videoTracks[0].enabled;
                  videoTracks[0].enabled = enabled;
                  isVideoOff = !enabled;
                  videoBtn.innerHTML = isVideoOff ? 
                    \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z"/>
                    </svg> Bật camera\` :
                    \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175l3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
                    </svg> Tắt camera\`;
                }
              }
            });
            
            // Kết thúc cuộc gọi
            endCallBtn.addEventListener('click', () => {
              endCall(true);
            });
          }
          
          // Trả lời cuộc gọi
          function answerCall() {
            try {
              callAccepted = true;
              
              // Tạo peer connection
              peer = new SimplePeer({
                initiator: false,
                trickle: false,
                stream: localStream
              });
              
              
              // Khi có tín hiệu cục bộ
              peer.on('signal', (data) => {
                // Gửi tín hiệu đến người gọi
                socket.emit('call-accepted', {
                  to: callerId,
                  from: myUserId,
                  signalData: data
                });
              });
              
              // Khi nhận được stream từ bạn
              peer.on('stream', (stream) => {
                remoteStream = stream;
                remoteVideo.srcObject = stream;
              });
              
              // Xử lý lỗi
              peer.on('error', (err) => {
                console.error('Peer connection error:', err);
                alert('Có lỗi xảy ra với kết nối. Vui lòng thử lại sau.');
                window.close();
              });
              
              // Signal với dữ liệu từ người gọi
              peer.signal(callerSignalData);
            } catch (error) {
              console.error('Error in answerCall:', error);
              alert('Có lỗi khi kết nối cuộc gọi: ' + error.message);
            }
          }
          
          // Kết thúc cuộc gọi
          function endCall(sendSignal = true) {
            // Gửi tín hiệu kết thúc cuộc gọi
            if (sendSignal) {
              socket.emit('end-call', {
                to: callerId,
                from: myUserId
              });
            }
            
            // Dừng các stream
            if (localStream) {
              localStream.getTracks().forEach(track => track.stop());
            }
            
            // Đóng kết nối peer
            if (peer) {
              peer.destroy();
            }
            
            // Đóng socket
            socket.disconnect();
            
            // Đóng cửa sổ
            window.close();
          }
          
          // Khi cửa sổ đóng
          window.onbeforeunload = () => {
            // Gửi thông báo về trang chính rằng cuộc gọi đã kết thúc
            try {
              window.opener && window.opener.postMessage('call_ended', '*');
            } catch (e) {
              console.error('Error posting message to opener:', e);
            }
            
            endCall(true);
          };
          
          // Khởi tạo
          initialize();

          window.addEventListener('beforeunload', function() {
            // Đảm bảo socket được đóng đúng cách
            if (socket) {
              endCall(true);
              socket.disconnect();
            }
          });
        </script>
      </body>
      </html>
    `);
    
    videoCallWindow.document.close();
    
    setIncomingCall(null);

    const checkWindowClosed = setInterval(() => {
      if (videoCallWindow.closed) {
        clearInterval(checkWindowClosed);
        setInCall(false); 
        
        setTimeout(() => {
          initializeSocket();
        }, 1000);
      }
    }, 1000);
  };
  
  const handleDeclineCall = () => {
    if (!incomingCall || !socketRef.current) return;
    
    try {
      socketRef.current.emit('call-declined', {
        to: incomingCall.from,
        from: user?.id,
        reason: 'Người dùng từ chối cuộc gọi'
      });
    } catch (error) {
      console.error('Error declining call:', error);
    }
    
    setIncomingCall(null);
  };

  useEffect(() => {
    let ringtone: HTMLAudioElement | null = null;
    
    if (incomingCall) {
      ringtone = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c19592.mp3');
      ringtone.loop = true;
      ringtone.play().catch(error => {
        console.warn('Không thể phát âm thanh do chính sách tự động phát:', error);
      });
    }
    
    return () => {
      if (ringtone) {
        ringtone.pause();
        ringtone = null;
      }
    };
  }, [incomingCall]);

  const initializeSocket = () => {
    if (!user?.id || isReconnecting) return;
    
    
    setIsReconnecting(true);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    try {
      const socketUrl = process.env.NEXT_PUBLIC_VIDEO_CHAT_SERVER ;
      socketRef.current = io(socketUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3, 
        reconnectionDelay: 1000,
        timeout: 10000,  
      });
      
      socketRef.current.on('connect', () => {
        
        setIsReconnecting(false);
        setSocketInitialized(true);
        
        socketRef.current.emit('register', user.id);
        
        if (!inCall) {
          listenForIncomingCalls();
        }
      });
      
      socketRef.current.on('disconnect', (reason: string) => {
        setSocketInitialized(false);
        
        if (!inCall && reason !== 'io client disconnect') {
          reconnectTimeoutRef.current = setTimeout(() => {
            setIsReconnecting(false);  
            initializeSocket();
          }, 3000);
        }
      });
      
      socketRef.current.on('connect_error', (error: unknown) => {
        console.error('Socket connection error in main window:', error);
      });
      
    } catch (error) {
      console.error('Error creating socket:', error);
      setIsReconnecting(false);
    }
  };

  const listenForIncomingCalls = () => {
    if (!socketRef.current) return;
    
    socketRef.current.off('call-incoming');
    socketRef.current.off('call-ended'); 
    
    socketRef.current.on('call-incoming', ({ from, signalData, callType }: SocketCallPayload) => {
      if (inCall) {
        socketRef.current.emit('call-declined', {
          to: from,
          from: user?.id,
          reason: 'Người dùng đang trong một cuộc gọi khác'
        });
        return;
      }
      
      try {
        findUserById(from).then(fromUser => {
          setIncomingCall({
            from,
            signalData,
            fromUser
          });
        });
      } catch (error) {
        console.error('Error handling incoming call:', error);
        setIncomingCall({
          from,
          signalData
        });
      }
    });
    
    socketRef.current.on('call-ended', ({ from }: SocketEndCallPayload) => {
      if (incomingCall && incomingCall.from === from) {
        setIncomingCall(null);
      }
    });
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'call_ended') {
        setInCall(false);
        setTimeout(() => {
          initializeSocket();
        }, 1000);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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
                  icon={<PlusOutlined />}
                  onClick={() => setNewConversationModalVisible(true)}
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
              className={`themed-search-${currentTheme}`}
              prefix={<SearchOutlined style={{ color: themeColors.search[currentTheme].iconColor }} />}
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
                      
                      const senderName = lastMessage?.user_id === user?.id 
                        ? (localStrings.Messages.You) 
                        : lastMessage?.user 
                          ? `${lastMessage.user.family_name || ''} ${lastMessage.user.name || ''}`.trim()
                          : '';

                      const messageDisplay = lastMessage
                        ? (senderName ? `${senderName}: ${messagePreview}` : messagePreview)
                        : messagePreview;

                      const lastMessageTime = lastMessage?.created_at
                        ? formatMessageTime(lastMessage.created_at)
                        : '';


                      const isOneOnOneChat = item.name?.includes(" & ") ||
                        (actualMessages.some(msg => msg.user_id !== user?.id) &&
                          new Set(actualMessages.map(msg => msg.user_id)).size <= 2);

                      const otherUser = isOneOnOneChat && actualMessages.length > 0
                        ? actualMessages.find(msg => msg.user_id !== user?.id)?.user
                        : null;

                      let avatarUrl = item.image;

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
                                type="secondary"
                                ellipsis
                                style={{
                                  maxWidth: '100%',
                                  color: sidebarSecondaryTextColor
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

                  let avatarUrl = currentConversation.image;

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
                {currentConversation && (
                  <Button 
                    type="text" 
                    icon={<VideoCameraOutlined style={{ fontSize: 20, color: iconPrimaryColor }} />} 
                    onClick={() => handleVideoCall(currentConversation)}
                    style={{ marginRight: 8 }}
                  />
                )}
                <Dropdown
                  overlay={
                    <Menu
                      style={{
                        backgroundColor: dropdownBg,
                        border: `1px solid ${dropdownBorder}`,
                        boxShadow: dropdownBoxShadow
                      }}
                      className={`themed-dropdown-${currentTheme}`}
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
                    background-color: ${dropdownItemHover} !important;
                  }
                  
                  .dropdown-menu-item-danger:hover {
                    background-color: ${dropdownDangerHoverBg} !important;
                  }
                  
                  .themed-dropdown-${currentTheme} .ant-dropdown-menu-item {
                    transition: background-color 0.3s ease;
                  }
                  
                  .themed-dropdown-dark .ant-dropdown-menu {
                    background-color: ${themeColors.dropdown.dark.background};
                  }
                  
                  .themed-dropdown-light .ant-dropdown-menu {
                    background-color: ${themeColors.dropdown.light.background};
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
                    {/* Load More Button - only show when we have messages and not at the end */}
                    {/* {messages.length > 0 && !isMessagesEnd && (
                      <div style={{ textAlign: "center", padding: "10px 0" }}>
                        <Button
                          onClick={loadMoreMessages}
                          loading={messagesLoading}
                          disabled={messagesLoading}
                        >
                          {localStrings.Public.LoadMore}
                        </Button>
                      </div>
                    )} */}

                    {/* Loading indicator when fetching more messages */}
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
                                key={`${msg.id || `temp-${msg.created_at}`}-${Date.now()}`}
                                message={msg}
                                onDelete={deleteMessage}
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
                      // Hiển thị thông báo khi vượt quá 500 ký tự
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
                      border-color: ${themeColors.input[currentTheme].hoverBorderColor} !important;
                    }
                    .message-input:focus {
                      border-color: ${themeColors.input[currentTheme].hoverBorderColor} !important;
                      box-shadow: 0 0 0 2px rgba(${currentTheme === 'dark' ? '23, 125, 220' : '24, 144, 255'}, 0.2) !important;
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
                    ? themeColors.indicators[currentTheme].error 
                    : themeColors.indicators[currentTheme].normal
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

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <VideoCameraOutlined style={{ color: brandPrimary, fontSize: 24, marginRight: 10 }} />
            <span>{localStrings.Messages.IncomingCall}</span>
          </div>
        }
        open={!!incomingCall}
        closable={false}
        footer={null}
        centered
        width={400}
      >
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Avatar
            src={incomingCall?.fromUser?.avatar_url}
            size={80}
            style={{
              backgroundColor: !incomingCall?.fromUser?.avatar_url ? brandPrimary : undefined,
              margin: '0 auto 15px'
            }}
          >
            {!incomingCall?.fromUser?.avatar_url && incomingCall?.fromUser?.name?.charAt(0)}
          </Avatar>
          <h2 style={{ marginBottom: 5 }}>
            {incomingCall?.fromUser 
              ? `${incomingCall.fromUser.family_name || ''} ${incomingCall.fromUser.name || ''}`.trim() 
              : localStrings.Messages.Unknown}
          </h2>
          <p style={{ color: '#666' }}>{localStrings.Messages.IsCallingYou}</p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <Button
            type="primary"
            danger
            icon={<CloseOutlined />}
            size="large"
            onClick={handleDeclineCall}
            style={{ minWidth: '120px' }}
          >
            {localStrings.Messages.Decline}
          </Button>
          <Button
            type="primary"
            icon={<VideoCameraOutlined />}
            size="large"
            onClick={handleAcceptCall}
            style={{ minWidth: '120px', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            {localStrings.Messages.Accept}
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default MessagesFeature