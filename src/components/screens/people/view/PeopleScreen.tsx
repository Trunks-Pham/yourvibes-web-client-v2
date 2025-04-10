"use client";

import React from "react";
import PeopleViewModel from "../viewModel/PeopleViewModel";
import { useAuth } from "@/context/auth/useAuth";
import { Spin, Empty, Button } from "antd";
import SearchScreen from "@/components/screens/search/views/SearchScreen";

const DEFAULT_AVATAR = "/assets/default-avatar.png";

const PeopleScreens: React.FC = () => {
  const {
    users,
    loading,
    loadingFriendRequests,
    hasMore,
    friendRequests,
    incomingFriendRequests,
    handleAddFriend,
    handleCancelFriend,
    handleAcceptFriendRequest,
    handleDeclineFriendRequest,
    loadMoreUsers,
    updateSearchResults,
  } = PeopleViewModel();

  const { localStrings } = useAuth();

  if (loading && users.length === 0 && loadingFriendRequests && incomingFriendRequests.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Spin size="large" tip="Loading" style={{ color: "#4B5563" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {incomingFriendRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {localStrings.Public.FriendRequests} ({incomingFriendRequests.length})
            </h2>
            {loadingFriendRequests ? (
              <div className="flex justify-center items-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              <div className="space-y-4">
                {incomingFriendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={request.from_user.avatar_url || DEFAULT_AVATAR}
                          alt={`${request.from_user.name}'s avatar`}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {request.from_user.name} {request.from_user.family_name}
                        </h3> 
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <Button
                        type="primary"
                        onClick={() => handleAcceptFriendRequest(request.from_user.id || "")}
                        className="bg-green-500 hover:bg-green-600 border-none"
                      >
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {localStrings.Public.Accept}
                        </span>
                      </Button>
                      <Button
                        danger
                        onClick={() => handleDeclineFriendRequest(request.from_user.id || "")}
                      >
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          {localStrings.Public.Decline}
                        </span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {localStrings.Public.AllUsers} ({users.length})
          </h2>
          <div className="mb-6">
            <SearchScreen onSearchResults={updateSearchResults} />
          </div>
          {loading && users.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : users.length === 0 ? (
            <Empty
              description={
                <span className="text-gray-600 text-lg">
                  {localStrings.Public.UserNotFound}
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={user.avatar_url || DEFAULT_AVATAR}
                          alt={`${user.name}'s avatar`}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {user.name} {user.family_name}
                        </h3>
                        {user.email && (
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {friendRequests.has(user.id || "") ? (
                        <Button
                          onClick={() => handleCancelFriend(user.id || "")}
                          className="border-gray-300 text-gray-700 hover:text-gray-900"
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            {localStrings.Public.CancelFriendRequest}
                          </span>
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => handleAddFriend(user.id || "")}
                        >
                          {localStrings.Public.AddFriend}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMoreUsers}
                    loading={loading}
                    className="px-6 py-2 text-gray-900 border-gray-300 hover:bg-gray-50"
                  >
                    {localStrings.Public.LoadMore}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeopleScreens;