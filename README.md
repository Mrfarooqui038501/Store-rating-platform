# Store Rating Platform

A comprehensive full-stack web application that allows users to submit and manage ratings for stores with role-based access control. The platform supports three user types: System Administrators, Normal Users, and Store Owners, each with specific functionalities and access levels.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Form Validations](#form-validations)
- [User Roles & Permissions](#user-roles--permissions)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Tech Stack

### Backend
- **Express.js** - Web application framework
- **PostgreSQL** - Database management system
- **bcryptjs** - Password hashing
- **JWT (jsonwebtoken)** - Authentication tokens
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - JavaScript library for building user interfaces
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

## Features

### System Administrator
- 📊 Dashboard with comprehensive statistics
- 👥 User management (create, view, filter, delete)
- 🏪 Store management with owner assignment
- ⭐ Rating analytics and distribution
- 📈 System-wide performance metrics

### Normal User
- 🔐 User registration and secure login
- 🔍 Store browsing with search and filters
- ⭐ Rating submission and modification
- 📝 Personal rating history tracking
- 🔒 Password update functionality

### Store Owner
- 🏪 Store-specific dashboard
- 📊 Customer rating analytics
- 📈 Store performance metrics
- 🔒 Secure authentication and password management

## Project Structure

```
store-rating-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── storeController.js
│   │   └── ratingController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── schema.sql
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── stores.js
│   │   └── ratings.js
│   ├── utils/
│   │   └── validation.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   └── StoreManagement.jsx
│   │   │   ├── user/
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   └── StoreList.jsx
│   │   │   └── owner/
│   │   │       └── OwnerDashboard.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── PasswordUpdate.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── validation.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** (comes with Node.js)

### PostgreSQL Setup

1. **Install PostgreSQL:**
   - **Windows:** Download from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - **macOS:** `brew install postgresql`
   - **Ubuntu:** `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service:**
   - **Windows:** Use pgAdmin or start from services
   - **macOS:** `brew services start postgresql`
   - **Ubuntu:** `sudo systemctl start postgresql`

3. **Create Database:**
   ```bash
   # Access PostgreSQL prompt
   sudo -u postgres psql

   # Create database and user
   CREATE DATABASE store_rating_db;
   CREATE USER store_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE store_rating_db TO store_user;
   \q
   ```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm init -y
   npm install express pg bcryptjs jsonwebtoken cors dotenv
   npm install -D nodemon
   ```

3. **Create .env file:**
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=store_rating_db
   DB_USER=store_user
   DB_PASSWORD=your_password
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

4. **Setup database tables:**
   ```bash
   # Connect to your database and run the SQL from models/schema.sql
   psql -U store_user -d store_rating_db -f models/schema.sql
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Create Vite React app:**
   ```bash
   npm create vite@latest . -- --template react
   npm install
   ```

3. **Install additional dependencies:**
   ```bash
   npm install axios react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Start frontend development server:**
   ```bash
   npm run dev
   ```

### Default Admin Account

After running the database schema, a default system administrator account will be created:

- **Email:** `admin@system.com`
- **Password:** `Admin123!`
- **Role:** `system_admin`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/password` - Update password
- `GET /api/users/stats` - Get user statistics (Admin only)

### Stores
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create store (Admin only)
- `GET /api/stores/stats` - Get store statistics (Admin only)

### Ratings
- `GET /api/ratings` - Get all ratings
- `POST /api/ratings` - Submit rating
- `PUT /api/ratings/:id` - Update rating
- `GET /api/ratings/stats` - Get rating statistics (Admin only)

## Form Validations

The application enforces the following validation rules:

- **Name:** 20-60 characters
- **Address:** Maximum 400 characters
- **Password:** 8-16 characters, must include at least one uppercase letter and one special character
- **Email:** Standard email format validation
- **Rating:** Integer between 1-5

## User Roles & Permissions

### System Administrator (`system_admin`)
- Full access to all system features
- Can create and manage users
- Can create and manage stores
- Can view all ratings and analytics
- Access to system-wide statistics

### Normal User (`normal_user`)
- Can register and login
- Can view and search stores
- Can submit and modify their own ratings
- Can update their password
- Limited to their own data

### Store Owner (`store_owner`)
- Can login to the system
- Can view ratings for their assigned stores
- Can access store-specific analytics
- Can update their password
- Limited to their store's data

## Database Schema

The application uses PostgreSQL with the following main tables:

### Users Table
- Stores user information including credentials and roles
- Password hashing with bcrypt
- Timestamps for creation and updates

### Stores Table
- Store information and owner assignments
- Address and contact details
- Relationship with users (owners)

### Ratings Table
- User ratings for stores
- Rating values (1-5 scale)
- Timestamps and user associations

### Key Relationships
- Users → Stores (one-to-many for store ownership)
- Users → Ratings (one-to-many for user ratings)
- Stores → Ratings (one-to-many for store ratings)

## Security Features

- **JWT Token-based Authentication** - Secure token management with expiration
- **Password Hashing** - bcrypt for secure password storage
- **Role-based Access Control** - Endpoint protection based on user roles
- **Input Validation** - Server-side and client-side validation
- **SQL Injection Prevention** - Parameterized queries
- **CORS Protection** - Cross-origin request handling
- **Input Sanitization** - Data cleaning and validation

## Development

### Backend Scripts
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Frontend Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will be available at: `http://localhost:5000`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will be available at: `http://localhost:5173`

### Environment Configuration

Make sure to configure your environment variables properly:

- Update database credentials in the backend `.env` file
- Set a secure JWT secret key
- Configure CORS settings for production deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code structure and naming conventions
- Add proper error handling and validation
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Quick Start Summary

1. **Clone the repository**
2. **Setup PostgreSQL database**
3. **Configure backend environment variables**
4. **Install backend dependencies and start server**
5. **Install frontend dependencies and start development server**
6. **Access the application at `http://localhost:5173`**
7. **Login with default admin credentials: `admin@system.com` / `Admin123!`**

For detailed setup instructions, refer to the [Installation & Setup](#installation--setup) section above.

## Support

For any issues or questions, please create an issue in the repository or contact the development team.

**Happy coding! 🚀**