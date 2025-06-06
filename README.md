# YourVibes Web Client V2

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

## Contributing to YourVibes Web Client V2

1. **Fork the Repository**  
   Fork the project by clicking the "Fork" button on the GitHub repository: [https://github.com/Trunks-Pham/yourvibes-web-client-v2](https://github.com/Trunks-Pham/yourvibes-web-client-v2).

2. **Clone the Repository**  
   Clone your forked repository to your local machine:  
   ```
   git clone https://github.com/Trunks-Pham/yourvibes-web-client-v2.git
   ```

3. **Create a Branch**  
   Create a new branch for your changes:  
   ```
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes**  
   Make your changes, whether it's fixing a bug, adding a feature, or improving documentation. Ensure your code follows the project's coding style and standards.

5. **Test Your Changes**  
   Test your changes locally to ensure they work as expected and do not introduce new issues.

6. **Commit Your Changes**  
   Commit your changes with a clear and descriptive commit message:  
   ```
   git commit -m "Add your descriptive message here"
   ```

7. **Push to Your Fork**  
   Push your changes to your forked repository:  
   ```
   git push origin feature/your-feature-name
   ```

8. **Submit a Pull Request**  
   Go to the original repository at [https://github.com/Trunks-Pham/yourvibes-web-client-v2](https://github.com/Trunks-Pham/yourvibes-web-client-v2) and submit a pull request from your branch. Provide a clear description of your changes and why they are needed.

## Guidelines
- Ensure your code is clean, readable, and well-documented.
- Follow the existing code style and structure.
- Test your changes thoroughly before submitting.
- Be respectful and collaborative in all communications.

## Reporting Issues
If you find a bug or have a feature request, please create an issue on the GitHub repository. Include as much detail as possible, such as steps to reproduce, expected behavior, and actual behavior.

## Contact
For any questions or further assistance, feel free to reach out via GitHub issues.

Thank you for contributing to YourVibes Web Client V2!