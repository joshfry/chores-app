# Family Chores Management App

A comprehensive full-stack application to help families manage and track chores for children. Built with Node.js, Express, TypeScript for the backend and React with TypeScript for the frontend.

## Features

### Backend API

- **Children Management**: Create, read, update, and delete family members
- **Chores Management**: Define chores with different difficulty levels, points, and categories
- **Assignment Management**: Assign chores to children, track progress, and completion
- **Comprehensive Testing**: Full test suite with Jest and Supertest
- **SQLite Database**: Lightweight database with proper schema and relationships

### Frontend Interface

- **Dashboard**: Overview of family chore statistics and recent activity
- **Children Page**: Manage family members (add, edit, delete)
- **Chores Page**: Create and manage available chores
- **Assignments Page**: Assign chores to children and track completion
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Real-time Updates**: Dynamic UI that updates based on API responses

## Technology Stack

### Backend

- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **SQLite** database with **sqlite** wrapper
- **Jest** and **Supertest** for testing
- **CORS** enabled for frontend integration

### Frontend

- **React** with **TypeScript**
- **React Router** for navigation
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Clone or navigate to the project directory**

   ```bash
   cd /Users/jofry/Desktop/chores
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:3001`

#### Start the Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

### Testing

#### Run Backend Tests

```bash
cd backend
npm test
```

#### Run Frontend Tests

```bash
cd frontend
npm test
```

## API Endpoints

### Children

- `GET /api/children` - Get all children
- `GET /api/children/:id` - Get a specific child
- `POST /api/children` - Create a new child
- `PUT /api/children/:id` - Update a child
- `DELETE /api/children/:id` - Delete a child

### Chores

- `GET /api/chores` - Get all chores
- `GET /api/chores/:id` - Get a specific chore
- `POST /api/chores` - Create a new chore
- `PUT /api/chores/:id` - Update a chore
- `DELETE /api/chores/:id` - Delete a chore

### Assignments

- `GET /api/assignments` - Get all assignments (supports filtering by child_id and status)
- `GET /api/assignments/:id` - Get a specific assignment
- `POST /api/assignments` - Create a new assignment
- `PUT /api/assignments/:id` - Update an assignment
- `PATCH /api/assignments/:id/complete` - Mark assignment as completed
- `DELETE /api/assignments/:id` - Delete an assignment

### Health Check

- `GET /api/health` - Server health check

## Database Schema

### Children

- `id` - Primary key
- `name` - Child's name (required)
- `age` - Child's age (optional)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Chores

- `id` - Primary key
- `title` - Chore title (required)
- `description` - Chore description (optional)
- `points` - Points awarded (default: 1)
- `difficulty` - easy/medium/hard (default: easy)
- `category` - Chore category (optional)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Chore Assignments

- `id` - Primary key
- `child_id` - Foreign key to children
- `chore_id` - Foreign key to chores
- `assigned_date` - Date assigned (YYYY-MM-DD)
- `due_date` - Due date (optional, YYYY-MM-DD)
- `completed_date` - Completion timestamp (optional)
- `status` - assigned/in_progress/completed/missed
- `notes` - Additional notes (optional)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Usage Guide

1. **Add Children**: Start by adding your family members in the Children page
2. **Create Chores**: Define the chores available in your household
3. **Make Assignments**: Assign specific chores to children with due dates
4. **Track Progress**: Monitor completion status and award points
5. **View Dashboard**: Check overall family chore statistics

## Development Notes

- The backend uses an in-memory SQLite database for testing
- Frontend API calls are configured to use `http://localhost:3001` by default
- All API responses follow a consistent format with `success`, `data`, `message`, and `error` fields
- The application supports CRUD operations for all main entities
- Proper error handling and validation on both frontend and backend

## Future Enhancements

Potential features to add:

- User authentication and multiple families
- Reward system with redeemable points
- Photo uploads for chore completion proof
- Push notifications for due dates
- Weekly/monthly reports
- Recurring chore assignments
- Mobile app version

## Contributing

1. Make sure all tests pass before submitting changes
2. Follow TypeScript best practices
3. Update documentation for any API changes
4. Test both frontend and backend integration

## License

This project is created for personal/family use. Feel free to modify and extend as needed.
