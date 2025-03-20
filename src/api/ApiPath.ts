export const ApiPath = {
  // Auth
  LOGIN: getApiPath("users/login"),
  REGISTER: getApiPath("users/register"),
  VERIFIED_EMAIL: getApiPath("users/verifyemail"),
  GOOGLE_LOGIN: getApiPath("users/auth_google"),

  // User
  PROFILE: getApiPath("users/"),
  SEARCH: getApiPath("users/"),
  CHANGE_PASSWORD: getApiPath("users/change_password"),

  //Friend
  FRIEND_REQUEST: getApiPath("users/friends/friend_request/"),
  FRIEND_RESPONSE: getApiPath("users/friends/friend_response/"),
  UNFRIEND: getApiPath("users/friends/"),
  LIST_FRIENDS: getApiPath("users/friends/"),

  // Post
  CREATE_POST: getApiPath("posts/"),
  UPDATE_POST: getApiPath("posts/"),
  GET_POSTS: getApiPath("posts/"),
  DELETE_POST: getApiPath("posts/"),
  GET_USER_LIKES: getApiPath("posts/get_like_user/"),
  LIKE_POST: getApiPath("posts/like_post/"),
  SHARE_POST: getApiPath("posts/share_post/"),
  ADVERTISE_POST: getApiPath("advertise/"),

  //Report
  REPORT: getApiPath("report/"),

  //Comment
  CREATE_COMMENT: getApiPath("comments/"),
  UPDATE_COMMENT: getApiPath("comments/"),
  GET_COMMENTS: getApiPath("comments/"),
  DELETE_COMMENT: getApiPath("comments/"),
  GET_COMMENT_REPLIES: getApiPath("comments/"),


  //Like Comment
  GET_LIKE_COMMENT: getApiPath("comments/like_comment/"),
  POST_LIKE_COMMENT: getApiPath("comments/like_comment/"),

  // Notification
  GET_WS_PATH_NOTIFICATION: getWSPath("notification/ws/"),
  GET_NOTIFICATIONS: getApiPath("notification"),
  READ_NOTIFICATION: getApiPath("notification/"),
  READ_ALL_NOTIFICATION: getApiPath("notification/"),


  //New Feeds
  GET_NEW_FEEDS: getApiPath('posts/new_feeds/'),
  DELETE_NEW_FEED: getApiPath('posts/new_feeds/'),

  //Forgot Password
  GET_OTP_FORGOOT_PASSWORD: getApiPath('users/get_otp_forgot_user_password'),
  FORGOT_PASSWORD: getApiPath("users/forgot_user_password"),
};

function getApiPath(path: string) {
  return `${process.env.NEXT_PUBLIC_API_ENDPOINT!}/v1/2024/${path}`;
} 
function getWSPath(path: string) {
  return `${process.env.NEXT_PUBLIC_API_ENDPOINT!.replace("http", "ws")!}/v1/2024/${path}`;
} 