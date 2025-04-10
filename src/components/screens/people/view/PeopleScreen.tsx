"use client";
import React, { useEffect } from "react";
import PeopleViewModel from "../viewModel/PeopleViewModel";
import { useAuth } from "@/context/auth/useAuth";

const PeopleScreens: React.FC = () => {
  const {
    users,
    loading,
    hasMore,
    friendRequests,
    fetchAllUsers,
    handleAddFriend,
    handleCancelFriend,
    loadMoreUsers,
  } = PeopleViewModel();

  const { localStrings } = useAuth();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-400 border-solid"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 text-sm">
            Loading
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user.avatar_url || "/default-avatar.png"}
                    alt={`${user.name}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/default-avatar.png";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-medium text-gray-900 truncate">
                    {user.name} {user.family_name}
                  </h2>
                  {user.email && (
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  )}
                </div>
              </div>
              <div className="ml-4">
                {friendRequests.has(user.id || "") ? (
                  <button
                    onClick={() => handleCancelFriend(user.id || "")}
                    className="py-2 px-4 rounded-md bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 border border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddFriend(user.id || "")}
                    className="py-2 px-4 rounded-md bg-white text-gray-900 font-medium text-sm hover:bg-gray-50 border border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    {localStrings.Public.AddFriend}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="mt-2 text-gray-600 text-lg">{localStrings.Public.UserNotFound}</p>
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={loadMoreUsers}
              className="inline-flex items-center px-6 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-50 border border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <span>{localStrings.Public.LoadMore}</span>
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeopleScreens;