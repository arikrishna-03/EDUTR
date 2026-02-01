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

### Prerequisites
*   Node.js (v14 or higher)
*   npm or yarn
*   MongoDB (local or Atlas connection string)

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the backend server:
    ```bash
    npm run dev
    ```
    The server typically runs on `http://localhost:5000` (or the port defined in your `.env` file).

    *Note: Ensure you have a `.env` file in the `backend` directory with necessary variables like `MONGO_URI`, `PORT`, `JWT_SECRET`, etc.*

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the `backend` folder with the following keys (example):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Contributing

This is a demo project. Contributions, issues, and feature requests are welcome!

## License

[MIT](https://choosealicense.com/licenses/mit/)
