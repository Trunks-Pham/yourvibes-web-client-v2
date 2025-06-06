This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## YourVibes Ecosystem

The YourVibes ecosystem consists of several components working together to deliver a complete social media platform:

- **Go API (Gin-Gonic)**: The core backend service, handling API requests, business logic, and integrations.
- **Redis**: Used for caching to improve performance for frequently accessed data.
- **RabbitMQ**: Facilitates asynchronous communication, including pushing notifications and interacting with the Python-based AI service.
- **gRPC**: Enables communication between the Go API and the Python server for AI censoring.
- **PostgreSQL**: The primary database for persistent data storage.
- **AI Service**: A Python-based service ([yourvibes_ai_service](https://github.com/poin4003/yourvibes_ai_service.git)) for content moderation (e.g., censoring sensitive content in posts and comments).
- **Clients**:
   - **Mobile App** ([yourvibes_app_V2](https://github.com/Thanh-Phuog/yourvibes_app_V2.git)): Built with React Native for mobile app users.
   - **Web App** ([yourvibes-web-client-v2](https://github.com/Trunks-Pham/yourvibes-web-client-v2.git)): Built with React for web app users.
   - **CMS for Admin** ([yourvibes-web-cms-v2](https://github.com/Trunks-Pham/yourvibes-web-cms-v2.git)): Built with React for admin management.

The ecosystem architecture is illustrated below:

![Ecosystem Architecture](https://github.com/poin4003/images/blob/master/yourvibes_architect_design.png?raw=true)

---

## Database Structure

The database schema, stored in PostgreSQL, is designed to support the core functionalities of the platform. Below is the Entity-Relationship Diagram (ERD):

![Database ERD](https://github.com/poin4003/images/blob/master/yourvibes_database.png?raw=true)

Key tables include:
- **users**: Stores user information (e.g., name, email, password, role).
- **posts**: Manages user posts with privacy settings (public, friend_only, private).
- **comments**: Supports infinite-layer comments on posts.
- **conversations** and **messages**: Handles messaging between users.
- **notifications**: Manages user notifications (e.g., new posts, comments).
- **friend_requests**, **friends**: Manages friendships and friend requests.
- **advertises**, **new_feeds**: Supports advertising and newsfeed features.
- **reports**, **bills**: Handles user reports and advertisement payments.

---

## Features

### User Functions
- **Post a Post**: Posts are pushed to friends' newsfeeds, with notifications. Supports privacy settings (public, friend_only, private) and AI censoring to block sensitive content.
- **Like, Share, Comment**: Supports liking and sharing posts, infinite-layer comments, and liking comments. AI censors sensitive comments (replaced with *).
- **Notifications**: Managed via socket notifications and a notification dashboard.
- **Friend Management**: Send friend requests, add/unfriend, get friend list, friend suggestions, and birthday reminders.
- **Profile Management**: Edit avatar, cover photo, and personal info with privacy settings (public, friend_only, private).
- **Newsfeed & Trending**: Get personal posts, friend posts, ads, and featured posts. Trending posts based on interactions (10 likes, 5 comments, 10 clicks, 10 views in 7 days).
- **Advertising**: Users can promote posts as ads (visible to all) for 33,000 VND/day (max 30 days), with a 6-hour push limit per user. Cleared after payment expires.
- **Featured Posts**: Pushed for 7 days if interaction thresholds are met (10 likes, 5 comments, 10 clicks, 10 views), with a 6-hour limit. Cleared after 7 days.
- **Messaging**: Socket-based messaging with 1:1 or group conversations. Roles include owner (can kick members, delete conversations) and member.
- **Authentication**: Login, signup, and Google login support.

### Admin Functions
- **Revenue Management**: View system revenue.
- **Report Handling**: Manage reports on posts, users, and comments. Actions include blocking users (email notification, temporary post/comment block), blocking posts/comments (with notifications), and re-opening if needed.
- **Transaction History**: View all advertisement payment transactions.
- **Super Admin**: Manages admin accounts (create, block).

### Cron Jobs
- Cleans expired ads and featured posts from newsfeeds.
- Pushes posts to friends' newsfeeds and manages ad/feature post limits.