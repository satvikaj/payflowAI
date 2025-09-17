# **PayFlow AI – Payroll & HR Management System**

## **Project Overview**
PayFlow AI is a **full-stack HR and payroll management system** developed during my internship at **Aptpath in collaboration with SmartX Technologies (July – August 2025)**.

The system automates key HR functions, including **user management, leave tracking with email notifications, and payroll processing**, while supporting multiple roles: **Admin, HR, Manager, and Employee**. It provides a streamlined experience for both employees and managers, ensuring efficient HR operations.

---

## **Key Features**

### **User Management**
- Add, update, and manage employee profiles  
- Role-based access: Admin, HR, Manager, Employee  

### **Leave Management**
- Employees can apply for leave  
- Managers/HR can approve or reject requests  
- **Email notifications** sent to employees for leave approval/rejection  
- Track leave balances and history  

### **Payroll Management**
- Automatic salary calculations, deductions, and pay slips  
- Manage bonuses, allowances, and taxes  
- Generate reports for employees and management  

### **Dashboard & Analytics**
- Role-specific dashboards for Admin, HR, Manager, and Employee  
- Overview of payroll, leave requests, and employee data  

---

## **Tech Stack**
- **Backend:** Spring Boot (Java)  
- **Frontend:** React.js  
- **Database:** MySQL  
- **Email Service:** JavaMail / SMTP integration for notifications  
- **Version Control:** Git & GitHub  

---

## **Installation / Setup Instructions**

### **1. Clone the repository**
```bash
git clone https://github.com/satvikaj/payflowAI.git

### **2. Backend Setup (Spring Boot)**
```bash
# Navigate to backend folder
cd backend

# Configure application.properties with your MySQL credentials and email SMTP settings

# Run the Spring Boot application
mvn spring-boot:run

### **3. Frontend Setup (React.js)**
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the frontend server
npm start


### **4. Access the Application**
```bash
# Open in your browser
http://localhost:3000

