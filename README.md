# Smart Campus Service & Complaint Management System

A full-stack web application for students to report, track, and follow up on campus problems such as electricity faults, water issues, damaged facilities, hostel maintenance, ICT problems, and security concerns. School departments and administrators can receive complaints, assign them to the appropriate team, update progress, and monitor resolution performance from a central dashboard.

## Project Description

Campus complaints are often reported through informal channels such as phone calls, chats, or physical visits. This makes it difficult for students to know whether a complaint has been received, who is responsible for it, and when it will be resolved.

The Smart Campus Service & Complaint Management System provides a structured digital workflow from complaint submission to resolution. Students can submit complaints and monitor their status, while staff and administrators can manage tickets, assign responsibility, update progress, and review analytics.

## Core Features

1. **User Authentication and Role Management**
   - Student registration and login
   - Staff and administrator accounts
   - Role-based access control

2. **Complaint Submission**
   - Submit complaint title and description
   - Select complaint category
   - Enter affected campus location
   - Set urgency level

3. **Complaint Tracking**
   - Track complaint status
   - Status flow: `SUBMITTED -> ASSIGNED -> IN_PROGRESS -> RESOLVED`
   - View complaint history and timestamps

4. **Admin & Staff Dashboard**
   - View all submitted complaints
   - Filter by category, status, urgency, department, and location
   - Assign complaints to departments/staff
   - Update ticket status

5. **Reports & Analytics**
   - Total submitted complaints
   - Pending and resolved complaints
   - Complaints by category
   - Resolution rate
   - Average resolution time

## Planned Extended Features

- Image/file evidence upload
- Email notifications
- In-app notifications
- Student comments and feedback
- Resolution rating system
- PDF report generation
- Complaint search and advanced filtering
- QR codes for campus locations
- Department performance dashboard
- Audit logs
- AI-assisted complaint categorization

## Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite
- Axios

### Backend
- Java 17+
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security (planned)
- JWT Authentication (planned)

### Database
- MySQL

### Development Tools
- Git & GitHub
- Maven
- Postman
- VS Code / IntelliJ IDEA

## Project Structure

```text
smart-campus-service/
├── backend/              # Spring Boot REST API
├── frontend/             # React/Vite web application
└── README.md
```

## How to Run Locally

### Prerequisites

Install:
- Java 17 or newer
- Maven 3.9+
- Node.js 18+
- npm
- MySQL 8+

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd smart-campus-service
```

### 2. Create the MySQL database

```sql
CREATE DATABASE smart_campus_db;
```

### 3. Configure the backend

Open:

```text
backend/src/main/resources/application.properties
```

Update your MySQL username and password.

### 4. Run the backend

```bash
cd backend
mvn spring-boot:run
```

The API will run at:

```text
http://localhost:8080
```

### 5. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## Initial API Endpoints

```text
GET    /api/complaints
GET    /api/complaints/{id}
POST   /api/complaints
PUT    /api/complaints/{id}/status
DELETE /api/complaints/{id}
GET    /api/dashboard/summary
```

## Project Owner

**Name:** Giwa Abayomi  
**Track:** Web Development

## Academic Purpose

This project is being developed as an MMS4 final-semester project. The system is designed to demonstrate practical knowledge of full-stack web development, REST APIs, relational databases, authentication, role-based access, dashboard design, and software engineering principles.

## Status

🚧 **Development in progress**

Current milestone: **MVP foundation and complaint-management API**.
