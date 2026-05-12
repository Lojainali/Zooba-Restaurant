# Zooba Restaurant Management System

A comprehensive MERN stack application for restaurant management with role-based access control.

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git (for version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/H238775/ZOOBA-web-project.git
   cd ZOOBA-web-project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file (see below)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zooba
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:5173
```

## 📚 Documentation

- **[Complete Project Documentation](./PROJECT_DOCUMENTATION.md)** - Full project documentation with architecture, features, and setup
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Quick API Reference](./QUICK_API_REFERENCE.md)** - Quick reference for API endpoints
- **[Postman Collection](./POSTMAN_COLLECTION.json)** - Import this into Postman for API testing

## ✨ Features

- **Multi-role Access Control**: Admin, Waiter, Kitchen, and User dashboards
- **Real-time Updates**: Socket.IO integration for live order status
- **Inventory Management**: Automated stock tracking with low-stock alerts
- **Order Management**: Dine-in and online delivery orders
- **Reservation System**: Table booking management
- **Analytics Dashboard**: Sales and performance analytics
- **Menu Management**: Full CRUD operations with image uploads

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Socket.IO Client
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication

## 📡 API Base URL

```
http://localhost:5000/api
```

## 👥 User Roles

- **Admin**: Full system access
- **Waiter**: Order and reservation management
- **Kitchen**: Order preparation tracking
- **User**: Menu browsing, ordering, reservations

## 📖 Getting Started

1. Start MongoDB
2. Start backend server: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Access application at: http://localhost:5173

## 📄 License

ISC

## 🔗 Repository

**GitHub:** https://github.com/H238775/ZOOBA-web-project

## 📝 Additional Resources

- [Installation Guide](./PROJECT_DOCUMENTATION.md#installation--setup)
- [API Endpoints](./API_DOCUMENTATION.md)
- [System Architecture](./PROJECT_DOCUMENTATION.md#system-architecture)
- [Contributing Guidelines](./CONTRIBUTING.md) (if applicable)

---

For complete documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)
