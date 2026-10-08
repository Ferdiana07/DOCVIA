# API Documentation

Base URL: `http://localhost:5000/api`

All endpoints that require authentication expect a Bearer token in the `Authorization` header:
`Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication (`/auth`)

### 1.1 Register Patient
- **URL**: `/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "phone": "08123456789"
  }
  ```
- **Success Response**: `201 Created` with Token and User object.

### 1.2 Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123"
  }
  ```
- **Success Response**: `200 OK` with Token and User object.

### 1.3 Get Current User Profile
- **URL**: `/auth/me`
- **Method**: `GET`
- **Access**: Private (Any role)
- **Success Response**: `200 OK` with User object.

---

## 2. Doctors (`/doctors`)

### 2.1 Get All Approved Doctors
- **URL**: `/doctors`
- **Method**: `GET`
- **Access**: Public
- **Query Params** (Optional): `?search=Andi&specialization=Cardiology&location=Jakarta&availableDay=Monday`
- **Success Response**: `200 OK` with array of Doctor objects (only approved).

### 2.2 Get Doctor by ID
- **URL**: `/doctors/:id`
- **Method**: `GET`
- **Access**: Public
- **Success Response**: `200 OK` with detailed Doctor object.

### 2.3 Get Available Specializations
- **URL**: `/doctors/specializations`
- **Method**: `GET`
- **Access**: Public
- **Success Response**: `200 OK` with array of string specializations.

### 2.4 Get Available Locations
- **URL**: `/doctors/locations`
- **Method**: `GET`
- **Access**: Public
- **Success Response**: `200 OK` with array of populated clinic locations.

### 2.5 Get Live Available Slots
- **URL**: `/doctors/:id/available-slots?date=YYYY-MM-DD`
- **Method**: `GET`
- **Access**: Public
- **Success Response**: Open 30-minute slots after booked slots and lead-time rules are removed.

---

## 3. Appointments (`/appointments`)

### 3.1 Book Appointment
- **URL**: `/appointments`
- **Method**: `POST`
- **Access**: Private (Patient only)
- **Body** (form-data if uploading document, otherwise JSON):
  - `doctorId` (String)
  - `appointmentDate` (YYYY-MM-DD)
  - `appointmentTime` (HH:MM)
  - `reason` (String)
  - `document` (File, optional)
- **Success Response**: `201 Created`

### 3.2 Get Appointments for Current User
- **URL**: `/appointments`
- **Method**: `GET`
- **Access**: Private (Patient or Doctor)
- **Query Params** (Optional): `?status=pending`
- **Success Response**: `200 OK` with appointments scoped to the current patient or doctor.

### 3.3 Get Appointment Detail
- **URL**: `/appointments/:id`
- **Method**: `GET`
- **Access**: Private (Owner patient or assigned doctor)
- **Success Response**: `200 OK` with appointment detail.

### 3.4 Download Supporting Document
- **URL**: `/appointments/:id/document`
- **Method**: `GET`
- **Access**: Private (Owner patient, assigned doctor, or Admin)
- **Success Response**: Authenticated file download.

### 3.5 Update Appointment Status
- **URL**: `/appointments/:id/status`
- **Method**: `PUT`
- **Access**: Private (Owner patient can cancel; assigned doctor can approve, reject, or complete)
- **Body**:
  ```json
  {
    "status": "approved", // or "rejected", "completed", "cancelled"
    "doctorNotes": "Please bring your previous medical records."
  }
  ```
- **Success Response**: `200 OK`

---

## 4. Doctor Application

### 4.1 Apply as Doctor
- **URL**: `/doctors/apply`
- **Method**: `POST`
- **Access**: Private (Authenticated patient account)
- **Body**:
  ```json
  {
    "specialization": "Pediatrics",
    "qualification": "MD",
    "experience": 5,
    "consultationFee": 150000,
    "description": "Experienced doctor.",
    "availability": [
      { "day": "Monday", "startTime": "09:00", "endTime": "17:00" }
    ]
  }
  ```
- **Success Response**: `200 OK`

---

## 5. Admin Actions (`/admin`)

### 5.1 Get Dashboard Statistics
- **URL**: `/admin/stats`
- **Method**: `GET`
- **Access**: Private (Admin only)
- **Success Response**: `200 OK` with counts for users, doctors, apps.

### 5.2 Get All Users
- **URL**: `/admin/users`
- **Method**: `GET`
- **Access**: Private (Admin only)
- **Success Response**: `200 OK`

### 5.3 Approve/Reject Doctor Application
- **URL**: `/admin/doctors/:id/approve`
- **Method**: `PUT`
- **Access**: Private (Admin only)
- **Body**:
  ```json
  {
    "status": "approved", // or "rejected"
    "reason": "Not enough credentials" // Optional, if rejected
  }
  ```
- **Success Response**: `200 OK`
## 6. Appointment Lifecycle

- `PUT /appointments/:id/reschedule` - Patient owner; body `{ appointmentDate, appointmentTime }`.
- `PUT /appointments/:id/clinical-record` - Assigned doctor; body `{ diagnosis, visitSummary, prescription, recommendations, followUpDate }`.
- `GET /appointments/:id/document` - Patient owner, assigned doctor, or admin only.

## 7. Support Cases

- `GET /disputes/mine` - Current user's cases.
- `POST /disputes` - Patient or doctor creates a case.
- `GET /admin/disputes` - Admin lists cases; optional `status` query.
- `PUT /admin/disputes/:id` - Admin updates status, priority, and response.

## 7.1 User account lifecycle

- `PATCH /admin/users/:id/status` - Admin activates or deactivates a non-admin account with body `{ "isActive": true | false }`.

## 8. Platform Settings

- `GET /settings/public` - Public maintenance, support, privacy, and terms notice.
- `GET /admin/settings` - Full settings for admin.
- `PUT /admin/settings` - Update booking, cancellation, reminder, and governance settings.

## 9. Notifications

- `GET /notifications` - Current user's notifications and unread count.
- `PUT /notifications/:id/read` - Mark one as read.
- `PUT /notifications/read-all` - Mark all as read.
