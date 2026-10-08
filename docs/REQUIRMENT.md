DOCVIA - Doctor appointments made clear.
DESCRIPTION : 
DOCVIA is a healthcare appointment platform designed to connect patients with verified healthcare providers. It lets patients browse doctors, request and manage appointments, securely attach supporting documents, and follow status notifications. Doctors manage their schedules and consultation records, while administrators oversee users, applications, settings, and operational disputes.
. 

SYSTEM REQUIREMENTS :

To ensure smooth development, deployment, and usage of DOCVIA, certain system prerequisites must be met. These requirements cover software, setup, and hardware specifications for a robust and scalable healthcare appointment platform.
1. Software Requirements
These are the essential tools and platforms required to develop, test, and run the application efficiently.

Operating System: Windows 10/11, macOS, or Linux — Supports cross-platform development and testing.
Node.js (v20.19 or above): Provides the runtime required by the current Vite, Express, and Mongoose toolchain.  👉 Download Node.js
npm (v10 or above): Package manager used to install the frontend and backend dependencies from their lockfiles.
React.js: A JavaScript library for building dynamic and responsive user interfaces.
Browser: Google Chrome / Firefox (latest version) — For rendering and testing the UI in real-time.
Express.js: A lightweight web framework for building RESTful APIs.
MongoDB: A NoSQL database used to store structured and unstructured data related to users , doctors, Appointments. 👉 Download MongoDB
Postman: Tool for testing APIs during development.
Visual Studio Code: Preferred code editor with built-in Git and terminal support.
Git & GitHub: For version control and collaborative development.


2. Hardware Requirements
Describes the minimum and recommended specifications needed to support the development and usage of the application.
Processor: Intel Core i5 (8th Gen or above) / AMD Ryzen 5 or better — Ensures fast compilation and multitasking during development.
RAM: Minimum 8 GB (16 GB recommended) — For handling development servers, IDEs, and browser testing simultaneously.
Storage: At least 1 GB free space — Required for package installations, MongoDB setup, and local project files.
Display: 1366x768 or higher — Recommended for optimal coding experience and application layout visualization.


PROJECT ARCHITECTURE :

TECHNICAL ARCHITECTURE :

DOCVIA uses a client-server MERN architecture. The React frontend uses React Bootstrap and Axios, while Express.js provides the API and MongoDB stores users, doctor profiles, appointments, notifications, disputes, and platform settings. Authentication uses JWT and bcrypt password hashing. Native JavaScript date utilities and server-side slot validation keep appointment scheduling consistent. Role-based access control protects patient, doctor, and administrator workflows.






FRONTEND TECHNOLOGIES :

Bootstrap and Material UI: Provide a responsive and modern UI that adapts to various devices, ensuring a user-friendly experience.
Axios: A promise-based HTTP client for making requests to the backend, ensuring smooth data communication between the frontend and server.

BACKEND FRAMEWORK :

Express.js: A lightweight Node.js framework used to handle server-side logic, API routing, and HTTP request/response management, making the backend scalable and easy to maintain.

DATABASE AND AUTHENTICATION : 

MongoDB: A NoSQL database used for flexible and scalable storage of user data, doctor profiles, and appointment records. It supports fast querying and large data volumes.
JWT (JSON Web Tokens): Used for secure, stateless authentication, allowing users to remain logged in without requiring session storage on the server.
Bcrypt: A library for hashing passwords, ensuring that sensitive data is securely stored in the database.

ADMIN PANEL & GOVERNANCE :

Admin Interface: Provides functionality for platform admins to approve doctor registrations, manage platform settings, and oversee day-to-day operations.
Role-based Access Control (RBAC): Ensures different users (patients, doctors, admins) have appropriate access levels to the system’s features and data, maintaining privacy and security.

SCALABILITY AND PERFORMANCE : 

MongoDB: Scales horizontally, supporting increased data storage and high user traffic as the platform grows.
Load Balancing: Ensures traffic is evenly distributed across servers to optimise performance, especially during high traffic periods.
Caching: Reduces database load by storing frequently requested data temporarily, speeding up response times and improving user experience.


ER DIAGRAM : 


 

The Entity-Relationship (ER) diagram for DOCVIA represents its core Users, Doctors, and Appointments entities with their respective attributes and relationships.

The Users collection holds basic user information, including _id, name, email, notification, password, isdoctor (to differentiate between patients and doctors), type, and phone. The isdoctor field identifies users who are doctors, while others are treated as patients or admins.

The Doctors collection stores information specific to doctors, such as their _id, userID (acting as a foreign key referencing the Users collection), fullname, email, timings, phone, address, specialisation, status, experience, and fees. The userID` links each doctor to their corresponding user account.

The Appointments collection stores details about appointments, including the _id, doctorInfo (foreign key referencing the Doctors collection), date, userInfo (foreign key referencing the Users collection), document (medical records or other files), and status (e.g., pending, confirmed). This collection maintains the relationship between users and doctors for each appointment.

The relationships are as follows: one User can be linked to one Doctor (one-to-one), a User can have multiple Appointments (one-to-many), and a Doctor can handle multiple Appointments (one-to-many). The foreign keys userID in the Doctors collection and doctorInfo and userInfo in the Appointments collection establish these connections, enabling the app to manage the interactions between patients and doctors effectively.

FEATURES : 

PATIENT REGISTRATION & PROFILE CREATION:

SECURE SIGN-UP using email and password authentication.
PROFILE CREATION that securely stores personal and medical information for future appointments

DOCTOR BROWSING & FILTERING:

ALLOWS USERS TO SEARCH AND FILTER doctors based on specialty, location, and real-time availability.
LIVE AVAILABILITY UPDATES ensure patients select only available time slots, minimising scheduling conflicts.

APPOINTMENT BOOKING & MANAGEMENT:

USER-FRIENDLY BOOKING INTERFACE where patients choose appointment dates, times, and upload relevant documents (e.g., medical records).
AUTOMATED CONFIRMATION MESSAGES AND REMINDERS via email or SMS help reduce missed appointments.

DOCTOR’S DASHBOARD:

DOCTORS CAN MANAGE AVAILABILITY, VIEW BOOKINGS, AND UPDATE appointment statuses (e.g., confirmed, completed).
SECURE ACCESS TO PATIENT RECORDS with options to add visit summaries, follow-up notes, and medical recommendations.

ADMIN CONTROLS & APPROVAL:

ADMINS APPROVE DOCTOR REGISTRATIONS, ensuring that only verified healthcare professionals are listed.
PLATFORM OVERSIGHT, including user management, policy enforcement, and dispute resolution for a smooth user experience.



ROLES AND RESPONSIBILITIES : 

1. USER REGISTRATION :

John, a patient in need of a routine check-up, opens DOCVIA. He registers as a patient, provides his email address, and creates a password. Once registration is complete, John can sign in and continue to his patient dashboard.

2. BROWSING DOCTORS :

After logging in, John is directed to a dashboard showcasing a list of doctors available for appointments. The app offers various filters for him to search for healthcare providers based on criteria such as specialty, location, and availability. John filters the list to find a family physician in his area, available for a routine check-up.

3. BOOKING AN APPOINTMENT :

John selects Dr. Smith, a family physician, and clicks the “Book Now” button. A booking form appears, prompting John to select his preferred appointment date and time. He is also asked to upload relevant documents, such as his medical records and insurance details. Once the form is completed, John submits the appointment request. He receives an immediate confirmation message indicating that his request is under review.

4. APPOINTMENT CONFIRMATION :

Dr. Smith, upon reviewing the request and his schedule, confirms the appointment. The status of John’s appointment changes to “Scheduled,” and John receives a notification with the appointment details—date, time, and location—via both email and SMS.

5. APPOINTMENT MANAGEMENT :

As the appointment date nears, John can access his booking history through the app’s dashboard. Here, he can manage upcoming appointments, cancel or reschedule them, and update their status. If needed, he can contact the doctor or the support team for assistance.

6. ADMIN APPROVAL (BACKGROUND PROCESS) :

In the background, the app’s admin is reviewing new doctor registrations. Dr. Smith, as a legitimate healthcare professional, is approved and added to the platform. The admin ensures that only verified doctors are listed, and the platform remains compliant with healthcare regulations and policies.

7. PLATFORM GOVERNANCE : 

The admin monitors the platform’s overall operation, addressing any issues, disputes, or system improvements. Ensuring the app’s compliance with privacy regulations and the terms of service is also a key responsibility, ensuring a smooth and secure experience for all users.

8. DOCTOR’S APPOINTMENT MANAGEMENT : 

On the day of the appointment, Dr. Smith logs into his dashboard and reviews his scheduled appointments. He sees John’s appointment and confirms the time. Throughout the day, Dr. Smith manages other appointments, updates their statuses, and ensures patients are attended to efficiently.

9. APPOINTMENT CONSULTATION : 

At the scheduled time, John visits Dr. Smith’s office. During the consultation, Dr. Smith provides medical care, performs the check-up, and gives advice on maintaining good health. John’s health concerns are addressed, and he feels assured that his routine check-up is complete.

10. POST-APPOINTMENT FOLLOW-UP : 

After the consultation, Dr. Smith updates John’s medical records within the app, noting any important observations, medications prescribed, or further treatments recommended. John receives a summary of his visit, including a prescription and any follow-up instructions via the app.



USER FLOW : 



1. Registration Flow
User opens the Landing Page.


Clicks on Register, chooses role: User or Admin.


Fills out the form and submits → Registration success.



 2. Login Flow
User/Admin logs in using email and password.


On success:


If User → Redirected to User Dashboard.


If Admin → Redirected to Admin Dashboard.


 3. User Dashboard Flow
Views list of approved doctors.


Can Book Appointment → selects date/time and uploads any document.


Can Apply as Doctor (if not already a doctor).


Can view Notifications (e.g., appointment status).


Can view Appointments History.


 4. Apply as Doctor Flow
User fills out application form with personal/professional details.


Submits request → sent to admin for review.


 5. Admin Dashboard Flow
Views list of doctor applications.


Approves/Rejects doctor requests.


Can view all registered users and doctors.


6. Booking & Approval Flow
User books a doctor.


Doctor receives appointment request.


Doctor reviews and approves/rejects the appointment.


Status updates sent as notifications to the user.


 7. Appointment History
User can view all past and upcoming appointments.


Doctor can view all assigned and handled appointments.
MVC Pattern : 

DOCVIA follows the Model-View-Controller (MVC) architectural pattern, separating the application into interconnected layers for modularity, maintainability, and scalability.
Model Layer (Data Layer)
The Model layer is responsible for handling all data-related logic. This includes the definition of data schemas and the operations performed on the database using those schemas. The models are implemented using Mongoose, which provides a schema-based solution to model application data for MongoDB.


Controller Layer
The Controller layer acts as an intermediary between the view (routes) and the model. It receives incoming requests, processes the input (which may include validation or transformation), calls the appropriate methods from the model, and then returns a response to the client.
View Layer (Routing Layer)
In the context of a backend REST API, the View is implemented as the routing layer, where various endpoints are defined. These endpoints determine how the backend responds to different HTTP requests (GET, POST, PUT, DELETE) and are responsible for invoking the appropriate controller functions.
Advantages of Using MVC in This Project
Separation of Concerns: Each layer has a clearly defined responsibility, improving readability and maintainability.
Scalability: New features can be added easily by creating new routes, controllers, and models.
Reusability: Logic in controllers and models can be reused across multiple parts of the application.
Testing: Each layer can be tested independently, especially the controllers and models.
Collaboration-Friendly: Multiple developers can work simultaneously on different layers without conflict.


PROJECT SETUP AND CONFIGURATION :

Creating project folder
1.  Create a new folder with your <project name>.
2.  Inside that folder create two new folders.
3.  Name one as **Client**.
4.  Name another one as **Server**.
5.  Now open that folder in VS Code.
Client setup (installing react app)
Open the Client folder in the terminal of VScode.
npm create vite@latest . -- --template react
Select React framework from the given options.
Select a framework:
│  React
Select JavaScript variant from the given options.
Select a variant:
│  JavaScript
Now lets navigate to the client folder by giving the following command.
cd client
To install all the packages run the following command.
npm install
To start the React server type the following command.
npm run dev

Server setup (npm init)
Open Server folder in terminal of VScode.
npm init -y
Create files:
server.js
Create folders:
models
controllers
routes




BACKEND DEVELOPMENT: 




This is structure for the backend development 

1 . Index.js : 



1. Importing Required Packages  : 



express: Framework for building REST APIs and web applications.


dotenv: Loads environment variables from a .env file into process.env.


cors: Middleware to allow cross-origin requests.


connectToDB: A custom function to connect to the database (likely MongoDB).



      
2. Initializing the Express App :  



Creates an instance of the Express application.

3. Load Environment Variables and Connect to DB : 



Loads .env variables (like PORT, MONGO_URI, etc.).


Calls the database connection function.


Sets the port the server will listen on.

4. Middlewares : 



express.json(): Parses incoming JSON requests (body parser).


cors(): Enables CORS (Cross-Origin Resource Sharing) so frontend apps (on different domains) can call this API.



Global error-handling middleware.


If any error occurs during request processing, this handles it and sends a standard error response.

5. Routes : 



Registers route handlers:


/api/user/* → handled by userRoutes.js


/api/admin/* → handled by adminRoutes.js


/api/doctor/* → handled by doctorRoutes.js


These route files contain endpoints like login, register, profile, etc., grouped by user roles.

6. Starting the Server : 



Starts the Express server and listens on the configured port (e.g., 8000 or 5000), and logs that the server is running.

2. connectToDB.js:



Imports Mongoose, which provides schema-based modeling and convenient MongoDB operations in Node.js. 
Declares a function called connectToDB. This will be called in your main server file (server.js or app.js) to initiate the DB connection.
 
 Connects to MongoDB using the connection URI stored in process.env.MONGO_DB.


     The second argument is an options object:
useNewUrlParser: true ensures the new MongoDB connection string parser is used.


useUnifiedTopology: true uses the new Server Discovery and Monitoring engine, which handles replica sets and sharding better.
 
 If the connection is successful, it logs a confirmation message.


If the connection fails, it throws an error with a message.


It’s a good practice to handle this error gracefully instead of just throwing it. You could console.error() and exit the process using process.exit(1) if needed.
Exports the connectToDB function so it can be used in other files, like your server.js:

3 . AdminController.js : 






This code exports controller functions used by an admin backend system to manage users, doctors, and appointments. These functions are designed to be used in admin routes (/api/admin/...) for actions like listing users, approving/rejecting doctors, and viewing appointments.

 1. Imports : 
 Import the Mongoose models for:
docSchema: doctors


userSchema: users


appointmentSchema: appointments 
2. getAllUsersControllers : 
Fetches all users from the userSchema collection.
Sends the data as JSON if successful, or a 500 error if something fails.
3. getAllDoctorsControllers : 
Fetches all doctors from the docSchema.


Responds with the list of doctors.
4. getStatusApproveController: 
     Approves a doctor:
Updates the doctor’s status (e.g., "approved")


Adds a notification to the corresponding user


Sets user.isdoctor = true if approved
5. getStatusRejectController : 
 Rejects a doctor:
Updates the status (e.g., "rejected")


Sends notification to the user
6. displayAllAppointmentController : 
Fetches all appointments from the database.


Sends the list in the response.
7.Exporting All Controllers  : 
Makes all controller functions accessible from route files like adminRoutes.js.

4 . DOCTOR CONTROLLER.JS: 



This module defines a set of doctor-related controller functions used in a backend Node.js + Express.js app. These controllers are likely used in routes/doctorRoutes.js and handle updating doctor profiles, managing appointments, and downloading documents.

 1. updateDoctorProfileController: 
Updates a doctor's profile based on the userId in the request body.
Uses findOneAndUpdate() to update the entire document with req.body.


await doctor.save() is optional after findOneAndUpdate() unless you make changes after that.


Better to validate req.body fields to avoid overwriting unintended data.
2. getAllDoctorAppointmentsController : 
Fetches all appointments for a doctor using the userId in the request. 
Good for doctor dashboards to view their appointments.


The typo in allApointments can be renamed to allAppointments for clarity. 
 3. handleStatusController : 
Updates appointment status (e.g., approved, rejected).
Sends a notification to the user about the status update. 
new: true returns the updated document.
Saves the appointment again even after findOneAndUpdate(), which might not be necessary.
 4. documentDownloadController : 
Downloads a document associated with a specific appointment.
appointment.document?.path assumes document is an object stored in the DB with a path field.


Handles file existence and streams the file securely.


Can be used to download reports, prescriptions, etc.
5 . USER CONTOLLER.JS : 




This module exports user-related and general controllers used in a Node.js + Express.js backend for a healthcare or appointment booking platform. These handle user registration, login, doctor application, appointments, and notifications.
1. registerController
Registers a new user:
Checks if user already exists by email.


Hashes the password using bcrypt.


Saves new user to MongoDB.  
2. loginController
Handles login logic:
Finds user by email.


Compares password hash.


Generates JWT token using JWT_KEY.


Returns user data (excluding password).
 3. authController
Authenticates a logged-in user (e.g. during frontend route protection):
Uses userId from req.body (likely extracted from JWT).


Returns user data if found.
4. docController
Handles doctor registration request:
Takes doctor info and userId from request body.


Saves a new docSchema with status "pending".


Sends a notification to the admin.
5. getallnotificationController
Marks all user notifications as seen:
Moves items from notification to seennotification.

 6. deleteallnotificationController
Clears both notification and seennotification arrays.
7. getAllDoctorsControllers
Lists approved doctors:
Filters doctors where status === "approved".
8. appointmentController
Handles booking an appointment:
Parses userInfo and doctorInfo from request body (likely sent as JSON strings).


Stores uploaded document (if any) in /uploads/.


Creates and saves a new appointmentSchema.


Sends a notification to the doctor's user account.
9. getAllUserAppointments
Returns appointments for a specific user:
Gets appointments for given userId.


Fetches doctors associated with these appointments.


Adds docName (doctor’s full name) into each appointment response.  
 10. getDocsController
Returns all documents stored in the user profile:
Assumes user model has a documents array.

6. AuthMiddleware.js : 


Imports the JWT library used to verify the token.
Middleware Function:
Exports an async middleware function that can be used in protected routes
Check for Authorization Header: 
Checks if the Authorization header is present.
If missing, responds with 401 Unauthorized.
Extract Token from Header : 
 Extracts the Bearer token from the header
 The split(" ")[1] gets the actual token.


Verify Token : 
Verifies the token using the secret key from .env (JWT_KEY).
If invalid, returns a message.
If valid, stores the userId from token payload into req.body.userId.


Add userId to Request : 
Makes userId available in downstream controllers.
Proceeds to next middleware/handler.
Catch Errors : 
Catches unexpected server-side errors.

7 . AdminRoutes . js : 

Imports
express: Used to create route handlers.
authMiddleware: Protects routes by ensuring only authenticated users (with a valid JWT) can access them.
Import Admin Controllers
These are the core admin controller functions you previously defined in adminC.js.
 Protected Routes (Require Auth)
1. GET /api/admin/getallusers
Fetch all users.
Protected via JWT (authMiddleware).
2. GET /api/admin/getalldoctors
Fetch all doctors from the system.
3. POST /api/admin/getapprove 
Approves a doctor account.
Expects { doctorId, status, userid } in body.
4. POST /api/admin/getreject 
Rejects a doctor registration request.
5. GET /api/admin/getallAppointmentsAdmin
Fetches all appointments for admin view.
Export Routes 
module.exports = router;

8 . DoctorRoutes.js : 

This is your doctorRoutes.js file, which defines all API endpoints related to doctor functionality in your Express.js application. 
All routes are protected by authMiddleware (i.e., require a valid JWT).
Handles doctor profile updates, viewing appointments, updating appointment status, and downloading documents. 
1. multer Setup (for file uploads) : 
Configures Multer to save uploaded files to the uploads/ directory.
Filenames are prefixed with the current timestamp.
2. Routes : 
POST /api/doctor/updateprofile 
Updates the doctor’s profile.
Requires the userId to be present in the body (via authMiddleware). 
GET /api/doctor/getdoctorappointments
Returns all appointments for the currently logged-in doctor.
POST /api/doctor/handlestatus 
Allows the doctor to approve or reject appointment requests.
Also pushes a notification to the user.
GET /api/doctor/getdocumentdownload?appointId=<id> 
Lets the doctor download a document (e.g. medical reports) linked to a specific appointment.
Requires appointId to be passed as a query parameter.

9. UserRoutes.js : 

This file defines all user-related routes in your Express.js backend using Express.Router(). It includes registration, login, appointment booking, doctor listing, document upload, and notification handling.
 Multer Setup for File Upload : 


Stores uploaded files in the uploads/ folder.
In your appointmentController, this is used to handle uploaded documents. 

Defined Routes : 

1. POST /api/user/register :  

Registers a new user with email, name, and password. 

2. POST /api/user/login : 

Authenticates the user and returns a JWT token. 

3. POST /api/user/getuserdata : 

Returns user details using userId from JWT (auth-protected).

4. POST /api/user/registerdoc : 

Allows a user to apply for a doctor account (status will be pending).


5. GET /api/user/getalldoctorsu : 

Gets a list of all approved doctors for the user.


6. POST /api/user/getappointment : 

Books an appointment with a doctor.


Accepts a file upload (image or document) under field name "image".


7. POST /api/user/getallnotification : 

Moves all notifications to "seen".


8. POST /api/user/deleteallnotification

Deletes all notifications (both unread and seen).


9. GET /api/user/getuserappointments

Returns the list of appointments made by the user.


10. GET /api/user/getDocsforuser

Returns documents uploaded or linked to the user.
10 . AppointmentModel.js : 

This file defines the Mongoose schema and model for managing appointment documents in your MongoDB database.
Import Mongoose for schema and model creation. 

Creates the appointment model based on the schema.


Collection will be pluralized to appointments by Mongoose.

DocModel.js : 



This schema stores the profile information of a doctor registered in your system. Each doctor is tied to a userId (user who applied), along with their personal and professional information.  

Schema Definition : 

Defines a Mongoose schema object.  

Setter for fullName : 

Ensures the first letter of the name is capitalized before saving to DB.


Timestamps : 
Automatically adds createdAt and updatedAt fields.
 Model Creation

Defines and exports the Mongoose model named "doctor".


Will use the "doctors" collection in MongoDB.

UserModel.js :  

Imports the Mongoose library to work with MongoDB.

Defines the structure of the user collection.

 Capitalize First Letter (Setter for fullName)

Automatically capitalizes the first letter of fullName before saving to the database. 

 Model Creation 

Defines the model called "user" which will map to the users collection in MongoDB. 

 Export 

Makes the model available to import elsewhere (e.g., in controllers).

Package.json : 

 

"name": The project name — currently "backend".


"version": Version number of your project.


"main": The entry point file for the application — "index.js". 

 Scripts : 

 npm start runs nodemon index — which auto-restarts your server on code changes.


 nodemon watches for changes in files and restarts the server automatically — great for development.

DATABASE DEVELOPMENT :  

 connectToDB.js:



Imports Mongoose, which provides schema-based modeling and convenient MongoDB operations in Node.js. 
Declares a function called connectToDB. This will be called in your main server file (server.js or app.js) to initiate the DB connection.
 
 Connects to MongoDB using the connection URI stored in process.env.MONGO_DB.


     The second argument is an options object:
useNewUrlParser: true ensures the new MongoDB connection string parser is used.


useUnifiedTopology: true uses the new Server Discovery and Monitoring engine, which handles replica sets and sharding better.
 
 If the connection is successful, it logs a confirmation message.


If the connection fails, it throws an error with a message.


It’s a good practice to handle this error gracefully instead of just throwing it. You could console.error() and exit the process using process.exit(1) if needed.
Exports the connectToDB function so it can be used in other files, like your server.js:


Schema :  

 appointmentModel.js : 

This file defines the Mongoose schema and model for managing appointment documents in your MongoDB database.
Import Mongoose for schema and model creation. 

Creates the appointment model based on the schema.


Collection will be pluralized to appointments by Mongoose.

DocModel.js : 



This schema stores the profile information of a doctor registered in your system. Each doctor is tied to a userId (user who applied), along with their personal and professional information.  

Schema Definition : 

Defines a Mongoose schema object.  

Setter for fullName : 

Ensures the first letter of the name is capitalized before saving to DB.


Timestamps : 
Automatically adds createdAt and updatedAt fields.
 Model Creation

Defines and exports the Mongoose model named "doctor".


Will use the "doctors" collection in MongoDB.

UserModel.js :  

Imports the Mongoose library to work with MongoDB.

Defines the structure of the user collection.

 Capitalize First Letter (Setter for fullName)

Automatically capitalizes the first letter of fullName before saving to the database. 

 Model Creation 

Defines the model called "user" which will map to the users collection in MongoDB. 

 Export 

Makes the model available to import elsewhere (e.g., in controllers).

FRONT-END DEVELOPMENT.


This is structure of the frontend Project  




This is the main React app component (App.js) for a doctor appointment booking system. It handles routing between public pages (home, login, register) and authenticated routes (admin and user dashboards).

Imports
Using React Router v6 to manage client-side routing.
Global styles.
These are different page components.


 Authentication Check

Checks if the user is logged in by verifying if userData exists in localStorage.


Converts it into a boolean (true/false).



Routes

If the user is logged in:


/adminhome: Admin dashboard


/userhome: User dashboard


/userappointments/:doctorId: Show appointments with a specific doctor


If not logged in:


Redirects to login


⚠️ Currently, if a logged-out user tries to access a protected route directly (e.g., /adminhome), nothing blocks them unless you handle that inside those components. For true protection, consider wrapping protected routes with a PrivateRoute component.

Footer
A static footer shown across all routes.


AdminAppointment.jsx : 


Your AdminAppointments component is well-structured and fetches & displays all appointment data for admins effectively. Here's a full explanation, improvements, and best practices:
What This Component Does : 

Fetches all appointment data from the backend endpoint:

Displays it in a Bootstrap-styled table with columns:
Appointment ID


User Name


Doctor Name


Date


Status
Uses a Bearer token from local storage for authorization.   

 Code Breakdown  

State Initialization 
Holds all appointment data returned by the API. 

Fetching Appointments 

Performs a secure GET request.


Adds JWT token from local storage to headers.

useEffect Hook

Fetches appointments once when the component mounts.

Table Display 

Uses React Bootstrap’s Table and Alert for UI.


If appointments exist → display rows.


If not → show a "No Appointments" alert.

Home.jsx:  




Your Home component is working great! ✅ It has:
A functional and responsive navigation bar with routing.


A clear hero section with a visual (image + message + CTA button).


A comprehensive and well-structured About Us section.
1. Imports: 

You’re using React Bootstrap components for layout and styling.


Link is from react-router-dom — used to navigate without reloading.


p3 is an image used in your hero section.



2. Navbar : 

A responsive navbar is created.
Navbar.Toggle shows a hamburger menu on small screens.
Links: Home, Login, Register
Link enables navigation to other routes.
3. Hero Section : 
A 2-column layout:


Left side: Image
Right side: Tagline and "Book your Doctor" button
Link inside Button navigates to the login page.
Login.jsx : 



This component:
Provides a login form for users (email & password)


Sends a login request to the backend API


Stores the token and user data in localStorage if login is successful


Redirects the user to:


/adminHome if admin


/userhome if normal user 
Imports : 

React Bootstrap: For layout and styling


MDB React UI Kit: For styled components


React Router: For page navigation


Ant Design’s message: For toast-like feedback

useState & useNavigate : 
 Initial state holds the user's email and password inputs
navigate is used for programmatic redirection after login
handleChange : 
Handles form field updates (email & password)


handleSubmit: 
Prevents page reload


Sends login credentials to backend


On success:


Saves token and user info to localStorage


Shows success message


Redirects to appropriate page based on type


On failure, shows error message
Notification.jsx : 

Here’s a complete explanation of the Notification.jsx component in your React project. This component handles viewing, marking as read, and deleting notifications for logged-in users.

This component shows two tabs:
Unread Notifications


Read Notifications


And allows the user to:
Mark all unread notifications as read


Delete all read notifications


State and Navigation : 
user: Stores current user’s data including notifications
navigate: Used to redirect when user clicks on a notification
Get User Data  : 
On component mount, it reads userData from localStorage and sets it to state.
Mark All Notifications as Read : 
  Moves notifications from notification to seennotification
  Updates localStorage and state
Delete All Read Notifications: 
   
   Clears the seennotification array
   Updates the user state

UI Structure: Tabs : 

The first tab shows unread notifications with a “Mark all read” button.


The second tab shows seen/read notifications with a “Delete all” button.

Register.jsx : 



Here's a detailed explanation of your Register.jsx component from the React project. This component is responsible for registering new users as either admin or user.

It:
Captures registration details.


Posts the data to the backend at http://localhost:8001/api/user/register.


Shows success/error message.


Redirects user to the login page on successful registration.
 State : 
This manages form inputs for:
fullName, email, password, phone (user info)


type: role selection (admin or user)


Functions
 handleChange 

Updates the corresponding field in the user state whenever an input changes.
handleSubmit 
Sends the form data to the backend.
On success → shows a success message and redirects to /login.
On failure → shows error message. 
UI Breakdown
 Top Navbar
A basic navbar with links to Home, Login, and Register.


 Form Section
 Using MDB React UI Kit and React-Bootstrap
Fields for Full Name, Email, Password, Phone.
Applydoctor.jsx :  

Here's a detailed explanation of your ApplyDoctor.jsx component in your React app. This component is used when a user applies to become a doctor on the platform. 
Dependencies Used
React Hooks (useState)


Ant Design (antd) for form, input, time picker, layout


React Bootstrap for layout


axios for API requests


antd's message for notifications
State Management : 
Maintains the form values for the doctor's application.
Form Structure : 
The form is split into two sections:
🔹 1. Personal Details
Full Name


Phone


Email


Address


🔹 2. Professional Details
Specialization


Experience


Fees


Timings (using Ant Design RangePicker)


Submit Button

Triggers onFinish on the Ant Design <Form>, which calls handleSubmit.


Props
This expects a userId prop from the parent, which is sent along with the form data to register the doctor.

DoctorList.jsx : 

The DoctorList component:
Displays doctor details (name, phone, specialization, etc.)


Provides a "Book Now" button


On clicking "Book Now", shows a modal where users:


Select a date/time


Upload a document (e.g., medical file or ID)


Submit the form to book the appointment




Props
userDoctorId: Logged-in user's ID


doctor: The doctor object (details like name, phone, specialization, etc.)


userdata: Info about the logged-in user (name, email, etc.)


 useState Variables

dateTime: Stores selected appointment time


documentFile: Stores uploaded file (image/doc)


show: Controls whether the modal is open


Date Restriction
Disables selecting past dates in the date-time picker


Booking Handler

Sends form data to backend API


Uses FormData for file upload


Includes user and doctor info


Authorization header passes the token for auth


On success → shows success message


On error → shows error message



Form in Modal
Inside the Modal, the form includes:
DateTime Input


File Input


Displays basic doctor info


Submit button triggers handleBook


Doctor Card Display
Renders:
Name


Phone


Address


Specialization


Experience


Fees


Timings


Modal Usage
handleShow() opens the modal


handleClose() closes the modal
UserHome.jsx: 


Purpose of the UserHome Component
This component is the user's dashboard/homepage and handles:
Sidebar navigation (appointments, apply doctor, logout)


Header with user name and notifications


Main body content (home view, appointment form, notifications, or doctor list)


 Hooks & State
doctors: Stores list of available doctors


userdata: Stores the logged-in user's details (name, role, etc.)


activeMenuItem: Controls which section is active (used for navigation)


 User Authentication & Info Fetching 
Get Logged-in User
Grabs user data from localStorage after login and stores it in state.
Get Updated User Info from Backend
(Currently) doesn’t update state — you might later want to use response data to keep userdata in sync.


Get List of All Doctors
Loads all doctors to show in the home section (if the user is not a doctor).


Navigation
Allows switching between:


Home (default)


Appointments


Apply Doctor


Notifications


Logout Function
Logs out the user and redirects to the landing page.


 Layout Structure
 Sidebar Menu
MediCareBook logo


Links:


Appointments (userappointments)


Apply Doctor (applyDoctor) — only shown if user is not already a doctor


Logout


Header
Notification bell (with unread badge count)


User’s name (with Dr. prefix if userdata.isdoctor === true)


Main Body Content
Content changes based on the value of activeMenuItem:

PROJECT EXECUTION.
Steps for Project Execution:

         Step 1: Set Up the Frontend (React App):
 a) Open a terminal and navigate into the client folder:
        cd client
b) Once installation is done, start the React development server:
      npm run dev
c) The app should now be running on:
     http://localhost:5173

Step 2: Set Up the Backend (Express Server)

  a)  Open a new terminal tab/window or split the terminal.

  b) Navigate into the server folder:
        cd ../server

Step 3: Configure Environment Variables
Inside the server folder, create a new file named .env (no file extension).


In that .env file, add your MongoDB connection string:
           MONGO_URI=mongodb://localhost:27017/doctor
     
Step 4: Start the Backend Server:

 Inside the same server folder, run the backend server : nodemon index.js
 The server should start on:http://localhost:8000




Output ScreenShots : 

LANDING PAGE : 



Initial public page with navigation to Login and Register options for users and admins.

LOGIN PAGE : 



Authenticates users/admins and redirects them to their respective dashboards after verifying credentials.

REGISTRATION PAGE : 



Allows new users to register as either user or admin by entering basic details and selecting a role.


USER PAGE : 



User dashboard with access to book doctors, view notifications, and apply as a doctor if not already.

ADMIN PAGE : 



Admin dashboard to manage users and approve doctor registration requests submitted by users.

APPLY AS DOCTOR  : 



Users can submit a form with personal and professional details to request becoming a doctor.

ADMIN APPROVE DOCTOR : 



Admin reviews and approves doctor applications to allow them to receive bookings.


BOOK DOCTOR  : 



Users can book appointments with doctors by selecting date/time and uploading necessary documents.

DOCTOR APPROVE USER APPOINTMENT : 



Doctors can view, approve, or reject incoming appointment requests from users.

ALL HISTORY : 



Displays user’s or doctor’s full appointment history and status (pending, approved, or completed).


Demo Link : videos
Code Link : code







