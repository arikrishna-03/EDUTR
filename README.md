# EduTrack (Student Tracking System) - Demo

EduTrack is a comprehensive web-based application designed to streamline the tracking of student activities, manage hackathon participations, and facilitate efficient communication through a notification system. This demo showcases the core functionalities including mentor and student dashboards, hackathon management, and coding platform integration.

## Features

*   **Mentor & Student Dashboards**: tailored views for different user roles to track progress and manage tasks.
*   **Hackathon Management**: easy addition and viewing of hackathon details for students and mentors.
*   **Coding Platform Management**: tools to track and manage student activities on various coding platforms.
*   **Notification System**: real-time updates and alerts for important events and deadlines.
*   **PDF Report Generation**: automated generation of student performance reports.
*   **Authentication**: secure user login and session management using JWT.

## Tech Stack

**Frontend:**
*   React.js
*   Vite
*   Tailwind CSS

**Backend:**
*   Node.js
*   Express.js
*   MongoDB

## Setup Instructions

Follow these steps to get the project running locally on your machine.

### Quick Start (Recommended)

To install dependencies and start the local database, backend server, and frontend server all at once, run the following commands in the root directory:

1.  **Install all dependencies**:
    ```bash
    npm install
    cd backend && npm install
    cd ../frontend && npm install
    cd ..
    ```

2.  **Start all services**:
    ```bash
    npm start
    ```
    This single command will:
    *   Start a local persistent MongoDB instance on port `27017` (saved under `backend/db_data/`).
    *   Start the backend server on `http://localhost:5000`.
    *   Start the frontend application on `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the `backend` folder with the following keys (example):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edu_tracker
JWT_SECRET=your_jwt_secret_key
```

## Contributing

This is a demo project. Contributions, issues, and feature requests are welcome!

## License

[MIT](https://choosealicense.com/licenses/mit/)
