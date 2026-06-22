# GOAT FARM MANAGEMENT SYSTEM (GFMS)

# TECHNICAL DESIGN DOCUMENT (TDD)

## PART 1: SYSTEM ARCHITECTURE, DATABASE DESIGN, ERD & RBAC

Version: 1.0

Status: Development Ready

Target: Backend Development (Node.js + Express + MongoDB)

---

# 1. PROJECT OVERVIEW

## Product Name

Goat Farm Management System (GFMS)

## Product Type

Livestock Farm Management Platform

## Primary Goal

Provide a centralized digital system for managing:

* Goat Records
* Weight Tracking
* Vaccinations
* Treatments
* Medicine Inventory
* Alerts & Notifications
* Farm Settings
* User Management

---

# 2. SYSTEM ARCHITECTURE

## Architecture Style

Layered Architecture

```text
Client
   │
   ▼
Express Routes
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories (Optional Future)
   │
   ▼
MongoDB Database
```

---

## Why Layered Architecture?

Benefits:

* Easier maintenance
* Cleaner codebase
* Better testing
* AI-friendly code generation
* Easier scalability

---

# 3. TECHNOLOGY STACK

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas
* Mongoose ODM

## Authentication

* JWT
* bcryptjs

## Validation

* express-validator

## File Upload

* Multer
* Cloudinary

## Security

* Helmet
* Rate Limiter
* CORS

## Logging

* Winston

## Scheduling

* node-cron

---

# 4. PROJECT STRUCTURE

```text
backend/
│
├── src/
│
├── config/
│   ├── db.js
│   ├── cloudinary.js
│   └── logger.js
│
├── models/
│   ├── User.js
│   ├── Goat.js
│   ├── Medicine.js
│   ├── Vaccination.js
│   ├── Treatment.js
│   ├── WeightLog.js
│   ├── Alert.js
│   └── Setting.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── goat.controller.js
│   ├── medicine.controller.js
│   ├── vaccination.controller.js
│   ├── treatment.controller.js
│   ├── alert.controller.js
│   └── setting.controller.js
│
├── services/
│   ├── auth.service.js
│   ├── goat.service.js
│   ├── medicine.service.js
│   ├── vaccination.service.js
│   ├── treatment.service.js
│   └── alert.service.js
│
├── routes/
│   ├── auth.routes.js
│   ├── goat.routes.js
│   ├── medicine.routes.js
│   ├── vaccination.routes.js
│   ├── treatment.routes.js
│   ├── alert.routes.js
│   └── setting.routes.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validation.middleware.js
│   ├── error.middleware.js
│   └── upload.middleware.js
│
├── validators/
│   ├── goat.validator.js
│   ├── medicine.validator.js
│   ├── vaccination.validator.js
│   └── auth.validator.js
│
├── jobs/
│   └── alert.job.js
│
├── utils/
│   ├── apiResponse.js
│   ├── pagination.js
│   ├── queryBuilder.js
│   └── cloudinaryUpload.js
│
├── app.js
│
├── server.js
│
├── .env
│
├── package.json
│
└── README.md
```

---

# 5. ENVIRONMENT VARIABLES

```env
PORT=5000

NODE_ENV=development

MONGO_URI=

JWT_SECRET=

JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

# 6. DATABASE DESIGN

---

# COLLECTION 1

# USERS

Purpose:

System authentication and authorization.

---

## Schema

```javascript
{
 _id:ObjectId,

 name:String,

 email:String,

 password:String,

 role:{
   type:String,
   enum:[
      "ADMIN",
      "STAFF",
      "VETERINARIAN"
   ]
 },

 isActive:{
   type:Boolean,
   default:true
 },

 lastLogin:Date,

 createdAt:Date,

 updatedAt:Date
}
```

---

## Indexes

```javascript
email: unique
role: index
```

---

# COLLECTION 2

# GOATS

Purpose:

Master record of every goat.

---

## Schema

```javascript
{
 _id:ObjectId,

 uidTag:{
   type:String,
   unique:true
 },

 name:String,

 gender:{
   type:String,
   enum:[
      "Male",
      "Female"
   ]
 },

 breed:String,

 color:String,

 dob:Date,

 currentWeight:Number,

 photo:String,

 status:{
   type:String,
   enum:[
      "Active",
      "Sold",
      "Dead",
      "Pregnant"
   ]
 },

 mother:{
   type:ObjectId,
   ref:"Goat"
 },

 father:{
   type:ObjectId,
   ref:"Goat"
 },

 notes:String,

 isDeleted:{
   type:Boolean,
   default:false
 },

 createdBy:{
   type:ObjectId,
   ref:"User"
 },

 updatedBy:{
   type:ObjectId,
   ref:"User"
 },

 createdAt:Date,

 updatedAt:Date
}
```

---

## Indexes

```javascript
uidTag
gender
breed
status
createdAt
```

---

# COLLECTION 3

# WEIGHT LOGS

Purpose:

Store historical weight records.

---

## Schema

```javascript
{
 _id:ObjectId,

 goat:{
   type:ObjectId,
   ref:"Goat"
 },

 weight:Number,

 date:Date,

 createdBy:{
   type:ObjectId,
   ref:"User"
 },

 createdAt:Date
}
```

---

## Relationship

One Goat

Can Have

Many Weight Logs

---

# COLLECTION 4

# MEDICINES

Purpose:

Inventory management.

---

## Schema

```javascript
{
 _id:ObjectId,

 name:String,

 type:String,

 image:String,

 batchNumber:String,

 quantity:Number,

 unit:String,

 purchaseDate:Date,

 expiryDate:Date,

 supplier:String,

 notes:String,

 status:{
   type:String,
   enum:[
      "Available",
      "Low Stock",
      "Out Of Stock",
      "Expired"
   ]
 },

 createdBy:{
   type:ObjectId,
   ref:"User"
 },

 updatedBy:{
   type:ObjectId,
   ref:"User"
 },

 createdAt:Date,

 updatedAt:Date
}
```

---

## Status Rules

```text
Quantity = 0
→ Out Of Stock

Quantity > 0 and < 5
→ Low Stock

Quantity >= 5
→ Available

Expiry Passed
→ Expired
```

---

## Indexes

```javascript
name
type
status
expiryDate
```

---

# COLLECTION 5

# VACCINATIONS

Purpose:

Track vaccination schedules.

---

## Schema

```javascript
{
 _id:ObjectId,

 goat:{
   type:ObjectId,
   ref:"Goat"
 },

 vaccineName:String,

 dateGiven:Date,

 nextDueDate:Date,

 veterinarian:String,

 notes:String,

 createdBy:{
   type:ObjectId,
   ref:"User"
 },

 createdAt:Date,

 updatedAt:Date
}
```

---

## Indexes

```javascript
goat
nextDueDate
vaccineName
```

---

# COLLECTION 6

# TREATMENTS

Purpose:

Medical history tracking.

---

## Schema

```javascript
{
 _id:ObjectId,

 goat:{
   type:ObjectId,
   ref:"Goat"
 },

 medicine:{
   type:ObjectId,
   ref:"Medicine"
 },

 disease:String,

 treatmentDate:Date,

 notes:String,

 createdBy:{
   type:ObjectId,
   ref:"User"
 },

 createdAt:Date,

 updatedAt:Date
}
```

---

## Indexes

```javascript
goat
medicine
treatmentDate
```

---

# COLLECTION 7

# ALERTS

Purpose:

System generated notifications.

---

## Schema

```javascript
{
 _id:ObjectId,

 type:{
   type:String,
   enum:[
      "LOW_STOCK",
      "MEDICINE_EXPIRING",
      "MEDICINE_EXPIRED",
      "VACCINATION_DUE",
      "VACCINATION_OVERDUE"
   ]
 },

 title:String,

 description:String,

 severity:{
   type:String,
   enum:[
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL"
   ]
 },

 isRead:{
   type:Boolean,
   default:false
 },

 createdAt:Date
}
```

---

# COLLECTION 8

# SETTINGS

Purpose:

Store farm information.

---

## Schema

```javascript
{
 _id:ObjectId,

 farmName:String,

 logo:String,

 phone:String,

 email:String,

 address:String,

 updatedAt:Date
}
```

---

# 7. ENTITY RELATIONSHIP DESIGN

```text
USER
│
├── creates GOAT
├── creates MEDICINE
├── creates VACCINATION
└── creates TREATMENT

GOAT
│
├── has many WEIGHT_LOGS
├── has many VACCINATIONS
├── has many TREATMENTS
│
├── belongs to MOTHER GOAT
├── belongs to FATHER GOAT
│
└── can have many CHILD GOATS

MEDICINE
│
└── used in TREATMENTS

ALERT
│
└── generated from
      MEDICINE
      VACCINATION
```

---

# 8. GOAT FAMILY TREE DESIGN

Parent-child relationships use self-referencing.

Example:

```text
Goat A (Mother)
    │
    ├── Goat D
    ├── Goat E
    └── Goat F

Goat B (Father)
```

Database:

```javascript
mother:ObjectId

father:ObjectId
```

Children calculated dynamically:

```javascript
Goat.find({
 mother: goatId
})
```

This avoids data duplication.

---

# 9. SOFT DELETE STRATEGY

Never permanently delete goats.

Instead:

```javascript
isDeleted:true
```

Benefits:

* History preserved
* Treatments preserved
* Vaccinations preserved
* Reports remain accurate

Queries should always use:

```javascript
{
 isDeleted:false
}
```

---

# 10. DATABASE INDEXING STRATEGY

High-frequency search fields:

Goats

```javascript
uidTag
breed
gender
status
```

Medicines

```javascript
name
status
expiryDate
```

Vaccinations

```javascript
goat
nextDueDate
```

Treatments

```javascript
goat
treatmentDate
```

Users

```javascript
email
```

---

# 11. ROLE BASED ACCESS CONTROL (RBAC)

Roles:

```text
ADMIN

STAFF

VETERINARIAN
```

---

# Permission Matrix

| Action             | Admin | Staff | Vet |
| ------------------ | ----- | ----- | --- |
| Login              | Yes   | Yes   | Yes |
| View Goats         | Yes   | Yes   | Yes |
| Create Goat        | Yes   | No    | No  |
| Edit Goat          | Yes   | Yes   | No  |
| Delete Goat        | Yes   | No    | No  |
| Add Weight         | Yes   | Yes   | No  |
| View Medicines     | Yes   | Yes   | Yes |
| Create Medicine    | Yes   | No    | No  |
| Edit Medicine      | Yes   | No    | No  |
| Delete Medicine    | Yes   | No    | No  |
| Create Vaccination | Yes   | No    | Yes |
| Edit Vaccination   | Yes   | No    | Yes |
| Create Treatment   | Yes   | Yes   | Yes |
| View Alerts        | Yes   | Yes   | Yes |
| Manage Settings    | Yes   | No    | No  |
| Create Users       | Yes   | No    | No  |

---

# 12. AUTHORIZATION MIDDLEWARE DESIGN

```javascript
authMiddleware
```

Responsibilities:

* Verify JWT
* Extract user
* Attach req.user

---

```javascript
roleMiddleware
```

Responsibilities:

* Check role
* Allow access
* Return 403 if denied

Example:

```javascript
authorize(
 "ADMIN"
)
```

Or

```javascript
authorize(
 "ADMIN",
 "VETERINARIAN"
)
```

---

# 13. DATA FLOW OVERVIEW

Create Goat

```text
Client

→ Route

→ Controller

→ Service

→ MongoDB

→ Response
```

Medicine Alert Flow

```text
Cron Job

→ Alert Service

→ Medicine Collection

→ Alert Collection

→ Dashboard
```

---

# 14. DEVELOPMENT PRINCIPLES

Mandatory:

* MVC Architecture
* Service Layer
* Centralized Error Handling
* Standard API Responses
* Validation on Every Endpoint
* Soft Delete
* JWT Authentication
* RBAC
* Environment Variables
* Audit Fields
* MongoDB Indexes

---

# END OF PART 1


# GOAT FARM MANAGEMENT SYSTEM (GFMS)

# TECHNICAL DESIGN DOCUMENT (TDD)

## PART 2: COMPLETE API SPECIFICATION, REQUEST/RESPONSE CONTRACTS, VALIDATION RULES & ERROR STANDARDS

Version: 1.0

---

# 1. API DESIGN PRINCIPLES

## Base URL

```text
/api
```

Examples:

```text
/api/auth/login

/api/goats

/api/medicines

/api/vaccinations
```

---

# API Versioning Strategy

Current:

```text
/api
```

Future:

```text
/api/v1
/api/v2
```

---

# Content Type

All requests:

```http
Content-Type: application/json
```

File Upload:

```http
multipart/form-data
```

---

# Standard Response Format

## Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

---

# Pagination Format

Request:

```http
GET /api/goats?page=1&limit=10
```

Response:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalRecords": 50,
    "totalPages": 5
  }
}
```

---

# Search Standard

```http
GET /api/goats?search=sheru
```

Should search:

* name
* uidTag

Case-insensitive.

---

# Sorting Standard

```http
GET /api/goats?sort=createdAt

GET /api/goats?sort=-createdAt
```

Positive:

Ascending

Negative:

Descending

---

# Filtering Standard

```http
?gender=Male

?status=Active

?breed=Boer
```

Multiple:

```http
?gender=Male&status=Active
```

---

# AUTHENTICATION MODULE

---

# POST /api/auth/register

## Purpose

Create user account.

---

## Request

```json
{
  "name": "Farm Admin",
  "email": "admin@example.com",
  "password": "Password123",
  "role": "ADMIN"
}
```

---

## Validation

| Field    | Rule        |
| -------- | ----------- |
| name     | Required    |
| email    | Required    |
| email    | Valid Email |
| email    | Unique      |
| password | Min 8 chars |
| role     | Valid Enum  |

---

## Success Response

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

# POST /api/auth/login

## Request

```json
{
  "email":"admin@example.com",
  "password":"Password123"
}
```

---

## Success

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token":"JWT_TOKEN",
    "user": {}
  }
}
```

---

# GET /api/auth/me

## Header

```http
Authorization: Bearer TOKEN
```

---

## Response

```json
{
  "success": true,
  "data": {
    "_id":"123",
    "name":"Admin",
    "email":"admin@example.com",
    "role":"ADMIN"
  }
}
```

---

# GOAT MODULE

---

# POST /api/goats

## Purpose

Create goat profile.

---

## Request

```json
{
  "uidTag":"GF001",
  "name":"Sheru",
  "gender":"Male",
  "breed":"Boer",
  "color":"Brown",
  "dob":"2025-01-10",
  "currentWeight":35,
  "status":"Active",
  "mother":"GOAT_ID",
  "father":"GOAT_ID",
  "notes":"Healthy"
}
```

---

## Validation

UID

```text
Required
Unique
Length 3-50
```

Gender

```text
Male
Female
```

Status

```text
Active
Sold
Dead
Pregnant
```

Weight

```text
Must be positive
```

DOB

```text
Cannot be future date
```

---

## Success

```json
{
  "success": true,
  "message": "Goat created successfully",
  "data": {}
}
```

---

# GET /api/goats

## Query Parameters

```http
?page=1

&limit=10

&search=

&breed=

&gender=

&status=

&sort=
```

---

## Response

```json
{
  "success": true,
  "data": [
    {
      "_id":"1",
      "uidTag":"GF001",
      "name":"Sheru",
      "gender":"Male",
      "breed":"Boer",
      "status":"Active"
    }
  ]
}
```

---

# GET /api/goats/:id

## Populate

```text
Mother

Father

Weight Logs

Vaccinations

Treatments
```

---

## Response

```json
{
  "success": true,
  "data": {
    "goat": {},
    "mother": {},
    "father": {},
    "weightHistory": [],
    "vaccinations": [],
    "treatments": []
  }
}
```

---

# PUT /api/goats/:id

Update goat.

Same validation as Create Goat.

---

# DELETE /api/goats/:id

Soft Delete

Implementation:

```javascript
{
  isDeleted:true
}
```

---

# WEIGHT LOG MODULE

---

# POST /api/goats/:id/weight

## Request

```json
{
  "weight":38
}
```

---

## Validation

```text
Required

Positive Number
```

---

## Logic

1. Create weight log.
2. Update Goat.currentWeight.

---

## Response

```json
{
  "success": true,
  "message": "Weight recorded"
}
```

---

# GET /api/goats/:id/weight-history

## Response

```json
{
  "success": true,
  "data": [
    {
      "weight":35,
      "date":"2026-01-01"
    }
  ]
}
```

---

# MEDICINE MODULE

---

# POST /api/medicines

## Request

```json
{
  "name":"Ivermectin",
  "type":"Dewormer",
  "batchNumber":"IVM001",
  "quantity":25,
  "unit":"Bottle",
  "purchaseDate":"2026-01-01",
  "expiryDate":"2027-01-01",
  "supplier":"ABC Pharma",
  "notes":"For deworming"
}
```

---

## Validation

Name

Required

Type

Required

Quantity

> = 0

Expiry Date

Required

Must be future date

---

# GET /api/medicines

## Filters

```http
?status=

?type=

?search=
```

---

# GET /api/medicines/:id

Response:

```json
{
  "success": true,
  "data": {
    "medicine": {}
  }
}
```

---

# PUT /api/medicines/:id

Update inventory.

---

# DELETE /api/medicines/:id

Soft Delete recommended.

---

# STATUS CALCULATION LOGIC

Automatic.

```javascript
if(expired)
status="Expired"

else if(quantity===0)
status="Out Of Stock"

else if(quantity<5)
status="Low Stock"

else
status="Available"
```

---

# VACCINATION MODULE

---

# POST /api/vaccinations

## Request

```json
{
  "goat":"GOAT_ID",
  "vaccineName":"PPR",
  "dateGiven":"2026-01-01",
  "nextDueDate":"2027-01-01",
  "veterinarian":"Dr Sharma",
  "notes":"Routine vaccination"
}
```

---

## Validation

Goat

Required

Must Exist

Vaccine Name

Required

Date Given

Required

Next Due

Greater than Date Given

---

# GET /api/vaccinations

## Filters

```http
?status=due

?status=overdue

?status=completed
```

---

## Logic

Due:

```javascript
nextDueDate <= 7 days
```

Overdue:

```javascript
nextDueDate < today
```

---

# GET /api/vaccinations/:id

Returns vaccination record.

---

# PUT /api/vaccinations/:id

Update record.

---

# DELETE /api/vaccinations/:id

Delete record.

---

# TREATMENT MODULE

---

# POST /api/treatments

## Request

```json
{
  "goat":"GOAT_ID",
  "medicine":"MEDICINE_ID",
  "disease":"Fever",
  "treatmentDate":"2026-01-01",
  "notes":"Recovered"
}
```

---

## Validation

Goat

Required

Medicine

Required

Disease

Required

Treatment Date

Required

---

# Business Logic

After treatment creation:

Decrease medicine quantity.

Example:

```javascript
medicine.quantity--
```

Recalculate status.

---

# GET /api/treatments

Supports:

```http
?page=

&limit=

&goat=

&medicine=
```

---

# GET /api/treatments/:id

Single treatment.

---

# PUT /api/treatments/:id

Update treatment.

---

# DELETE /api/treatments/:id

Delete treatment.

---

# ALERT MODULE

---

# GET /api/alerts

## Filters

```http
?isRead=true

?severity=HIGH

?type=LOW_STOCK
```

---

## Response

```json
{
  "success": true,
  "data":[]
}
```

---

# PATCH /api/alerts/:id/read

## Purpose

Mark alert as read.

---

## Response

```json
{
  "success": true,
  "message":"Alert marked as read"
}
```

---

# SETTINGS MODULE

---

# GET /api/settings

Returns farm settings.

---

# PUT /api/settings

## Request

```json
{
  "farmName":"Raj Goat Farm",
  "phone":"9999999999",
  "email":"farm@example.com",
  "address":"Mumbai"
}
```

---

# FILE UPLOAD APIs

---

# POST /api/upload/image

## Purpose

Upload goat image.

Upload medicine image.

---

## Request

```http
multipart/form-data
```

Field:

```text
image
```

---

## Response

```json
{
  "success": true,
  "data": {
    "url":"cloudinary_url"
  }
}
```

---

# HTTP STATUS CODE STANDARD

## Success

```text
200 OK

201 Created

204 Deleted
```

---

## Client Errors

```text
400 Validation Error

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict
```

---

## Server Errors

```text
500 Internal Server Error
```

---

# GLOBAL ERROR FORMAT

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field":"email",
      "message":"Email already exists"
    }
  ]
}
```

---

# AUDIT FIELDS

Every collection should include:

```javascript
createdBy

updatedBy

createdAt

updatedAt
```

Automatically managed.

---

# API SECURITY RULES

Protected Routes:

```text
ALL EXCEPT

/api/auth/login

/api/auth/register
```

Require:

```http
Authorization:
Bearer TOKEN
```

---

# RATE LIMITING

Authentication:

```text
5 requests/minute
```

General APIs:

```text
100 requests/15 minutes
```

---

# END OF PART 2



# GOAT FARM MANAGEMENT SYSTEM (GFMS)

# TECHNICAL DESIGN DOCUMENT (TDD)

## PART 3: BUSINESS LOGIC, SERVICE LAYER, ALERT ENGINE, FILE STORAGE, LOGGING, EDGE CASES & WORKFLOWS

Version: 1.0

Status: Production Ready

---

# 1. SERVICE LAYER ARCHITECTURE

## Purpose

Controllers should never contain business logic.

Controllers:

* Receive Request
* Validate Request
* Call Service
* Return Response

Services:

* Execute Business Logic
* Query Database
* Handle Transactions
* Generate Alerts

---

## Architecture

```text
Route
 │
 ▼
Controller
 │
 ▼
Service
 │
 ▼
Database
```

---

# 2. AUTH SERVICE

File:

```text
src/services/auth.service.js
```

Responsibilities:

* Register User
* Login User
* Hash Password
* Generate JWT
* Validate Credentials

---

## Registration Workflow

```text
User submits registration

→ Validate input

→ Check email uniqueness

→ Hash password

→ Save user

→ Return success
```

---

## Login Workflow

```text
User submits email/password

→ Find user

→ Compare password

→ Generate JWT

→ Update lastLogin

→ Return token
```

---

# JWT PAYLOAD

```javascript
{
  userId:"123",
  role:"ADMIN"
}
```

---

# Token Expiration

```text
7 Days
```

---

# 3. GOAT SERVICE

File:

```text
src/services/goat.service.js
```

Responsibilities:

* Create Goat
* Update Goat
* Soft Delete Goat
* Search Goats
* Populate Family Tree
* Fetch Complete Goat Profile

---

# CREATE GOAT WORKFLOW

```text
Validate UID

→ Check uniqueness

→ Validate parents

→ Create Goat

→ Save

→ Return Goat
```

---

# PARENT VALIDATION RULES

A goat cannot be its own parent.

```javascript
if(goatId === motherId)
throw Error
```

---

A male goat cannot be assigned as mother.

A female goat cannot be assigned as father.

Validation:

```javascript
mother.gender === "Female"

father.gender === "Male"
```

---

# GOAT PROFILE LOADING

Single request should return:

```text
Basic Information

Mother

Father

Weight Logs

Vaccinations

Treatments
```

---

# PROFILE QUERY FLOW

```text
Find Goat

→ Populate Mother

→ Populate Father

→ Find Weight Logs

→ Find Vaccinations

→ Find Treatments

→ Return Combined Response
```

---

# SOFT DELETE STRATEGY

Never remove goat physically.

Instead:

```javascript
{
 isDeleted:true
}
```

---

# Why?

Treatment records remain valid.

Vaccination records remain valid.

Reports remain accurate.

---

# 4. WEIGHT TRACKING SERVICE

File:

```text
src/services/weight.service.js
```

Responsibilities:

* Record Weight
* Update Current Weight
* Generate Growth History

---

# RECORD WEIGHT FLOW

```text
Receive weight

→ Validate

→ Create WeightLog

→ Update Goat.currentWeight

→ Return Success
```

---

# VALIDATION RULES

Weight:

```text
Must be > 0
```

Maximum:

```text
300kg
```

Anything higher:

Reject request.

---

# GROWTH HISTORY

Return:

```json
[
 {
  "weight":25,
  "date":"2026-01-01"
 }
]
```

Sorted:

Ascending Date

---

# 5. MEDICINE SERVICE

File:

```text
src/services/medicine.service.js
```

Responsibilities:

* Add Medicine
* Update Inventory
* Calculate Status
* Track Expiry

---

# MEDICINE STATUS ENGINE

Never manually set status.

Status generated automatically.

---

## Rule 1

Expired

```javascript
expiryDate < today
```

Status:

```text
Expired
```

---

## Rule 2

Out Of Stock

```javascript
quantity === 0
```

Status:

```text
Out Of Stock
```

---

## Rule 3

Low Stock

```javascript
quantity < 5
```

Status:

```text
Low Stock
```

---

## Rule 4

Available

```javascript
quantity >= 5
```

Status:

```text
Available
```

---

# UPDATE INVENTORY FLOW

```text
Update Quantity

→ Recalculate Status

→ Save

→ Trigger Alert Check
```

---

# 6. VACCINATION SERVICE

File:

```text
src/services/vaccination.service.js
```

Responsibilities:

* Create Vaccination
* Update Vaccination
* Detect Due Vaccines
* Detect Overdue Vaccines

---

# VALIDATION

Next Due Date

Must be greater than

Date Given

---

# CREATE FLOW

```text
Validate Goat

→ Create Vaccination

→ Save

→ Return Success
```

---

# DUE LOGIC

Vaccination Due

```javascript
nextDueDate <= 7 days
```

Vaccination Overdue

```javascript
nextDueDate < today
```

---

# 7. TREATMENT SERVICE

File:

```text
src/services/treatment.service.js
```

Responsibilities:

* Create Treatment
* Connect Medicine
* Reduce Inventory
* Maintain History

---

# CREATE TREATMENT FLOW

```text
Validate Goat

→ Validate Medicine

→ Create Treatment

→ Reduce Medicine Quantity

→ Recalculate Status

→ Save

→ Return Success
```

---

# INVENTORY IMPACT

Example:

Before:

```text
Ivermectin = 10
```

Treatment Created

After:

```text
Ivermectin = 9
```

---

# SAFETY CHECK

Do not allow treatment if:

```text
Medicine Quantity = 0
```

Return:

```text
Medicine Out Of Stock
```

---

# 8. ALERT ENGINE

File:

```text
src/services/alert.service.js
```

Purpose:

Generate automated notifications.

---

# ALERT TYPES

```text
LOW_STOCK

MEDICINE_EXPIRING

MEDICINE_EXPIRED

VACCINATION_DUE

VACCINATION_OVERDUE
```

---

# ALERT SEVERITY

LOW_STOCK

Medium

---

MEDICINE_EXPIRING

High

---

MEDICINE_EXPIRED

Critical

---

VACCINATION_DUE

Medium

---

VACCINATION_OVERDUE

Critical

---

# ALERT GENERATION ENGINE

Runs Daily.

---

# Rule 1

Medicine Expiring

Condition:

```javascript
expiryDate <= today + 30 days
```

Create Alert:

```text
Medicine expires soon
```

---

# Rule 2

Medicine Expired

Condition:

```javascript
expiryDate < today
```

Create Alert.

---

# Rule 3

Low Stock

Condition:

```javascript
quantity < 5
```

Create Alert.

---

# Rule 4

Vaccination Due

Condition:

```javascript
nextDueDate <= today + 7 days
```

Create Alert.

---

# Rule 5

Vaccination Overdue

Condition:

```javascript
nextDueDate < today
```

Create Alert.

---

# DUPLICATE ALERT PREVENTION

Before creating:

Check existing unread alert.

If exists:

Do not create again.

---

# UNIQUE CHECK

```javascript
{
 type,
 referenceId,
 isRead:false
}
```

---

# 9. CRON JOB DESIGN

File:

```text
src/jobs/alert.job.js
```

Library:

```text
node-cron
```

---

# Schedule

Daily

```javascript
0 0 * * *
```

Midnight.

---

# Execution Flow

```text
Cron Trigger

→ Check Medicines

→ Generate Alerts

→ Check Vaccinations

→ Generate Alerts

→ Save Alerts
```

---

# 10. FILE STORAGE ARCHITECTURE

Storage Provider:

Cloudinary

---

# Upload Flow

```text
Client

→ Multer

→ Cloudinary

→ Return URL

→ Save URL in MongoDB
```

---

# Goat Images

Folder:

```text
goats
```

---

# Medicine Images

Folder:

```text
medicines
```

---

# Returned Object

```json
{
 "url":"https://..."
}
```

---

# IMAGE RULES

Allowed:

```text
jpg

jpeg

png

webp
```

---

Maximum Size

```text
5MB
```

---

# INVALID FILES

Reject:

```text
pdf

exe

zip

mp4
```

---

# 11. QUERY BUILDER DESIGN

File:

```text
src/utils/queryBuilder.js
```

Purpose:

Reusable filtering.

---

# Supported

Search

Filter

Pagination

Sorting

---

# Example

```http
/api/goats

?page=1

&limit=10

&search=Sheru

&status=Active

&gender=Male

&sort=-createdAt
```

---

# Search Fields

Goats:

```text
uidTag

name
```

Medicines:

```text
name

type
```

---

# 12. LOGGING STRATEGY

Library:

```text
winston
```

File:

```text
src/config/logger.js
```

---

# INFO LOGS

User Login

Goat Created

Medicine Created

Vaccination Added

Treatment Added

---

# WARNING LOGS

Failed Login

Unauthorized Access

Expired JWT

---

# ERROR LOGS

Database Errors

Unhandled Exceptions

Validation Failures

Cloudinary Failures

---

# Example

```javascript
logger.info(
 "Goat Created"
)
```

---

# 13. AUDIT TRAIL DESIGN

Every record stores:

```javascript
createdBy

updatedBy

createdAt

updatedAt
```

---

# Example

```javascript
{
 createdBy:userId
}
```

---

# 14. DATABASE TRANSACTION STRATEGY

Use MongoDB Transactions For:

---

Treatment Creation

Reason:

Multiple operations.

```text
Create Treatment

Reduce Inventory

Update Medicine Status
```

Must succeed together.

---

# Transaction Flow

```text
Start Session

→ Create Treatment

→ Update Medicine

→ Commit

or

→ Rollback
```

---

# 15. EDGE CASES

GOAT MODULE

Duplicate UID

Reject.

---

Future DOB

Reject.

---

Self Parent

Reject.

---

Wrong Parent Gender

Reject.

---

MEDICINE MODULE

Negative Quantity

Reject.

---

Past Expiry Date During Creation

Reject.

---

TREATMENT MODULE

Medicine Not Found

Reject.

---

Out Of Stock Medicine

Reject.

---

VACCINATION MODULE

Invalid Goat

Reject.

---

Next Due Before Given Date

Reject.

---

AUTH MODULE

Duplicate Email

Reject.

---

Wrong Password

Reject.

---

Disabled User

Reject.

---

# 16. PERFORMANCE STRATEGY

Pagination Required.

Maximum:

```text
100 records/page
```

---

MongoDB Indexes Required.

---

Lean Queries

Use:

```javascript
.find()
.lean()
```

Where population is unnecessary.

---

# 17. FUTURE READY DESIGN

Prepared For:

* QR Codes
* Breeding Module
* Pregnancy Tracking
* Birth Records
* Multi Farm Support
* Mobile App
* WhatsApp Notifications
* Analytics Dashboard

No schema changes should break future features.

---

# END OF PART 3


# GOAT FARM MANAGEMENT SYSTEM (GFMS)

# TECHNICAL DESIGN DOCUMENT (TDD)

## PART 4: SECURITY, DEPLOYMENT, TESTING, OPENAPI, CI/CD, PRODUCTION OPERATIONS & AI AGENT IMPLEMENTATION PLAN

Version: 1.0

Status: Production Ready

---

# 1. SECURITY ARCHITECTURE

## Security Goals

Protect:

* User Accounts
* Goat Records
* Medicine Inventory
* Vaccination Data
* Farm Information

Prevent:

* Unauthorized Access
* Data Leakage
* Token Theft
* Injection Attacks
* Brute Force Attacks

---

# SECURITY LAYERS

```text
Internet
    │
    ▼
Rate Limiter
    │
    ▼
Helmet Security Headers
    │
    ▼
JWT Authentication
    │
    ▼
RBAC Authorization
    │
    ▼
Input Validation
    │
    ▼
Controllers
    │
    ▼
Services
    │
    ▼
MongoDB
```

---

# 2. PASSWORD SECURITY

## Password Storage

Never store plain text passwords.

Use:

```javascript
bcryptjs
```

---

## Hash Configuration

```javascript
bcrypt.hash(password, 12)
```

Rounds:

```text
12
```

---

## Password Rules

Minimum:

```text
8 characters
```

Recommended:

```text
12+ characters
```

Must contain:

* Uppercase
* Lowercase
* Number

---

# 3. JWT SECURITY

## JWT Structure

```javascript
{
  userId:"123",
  role:"ADMIN"
}
```

---

## Token Expiry

```text
7 days
```

---

## JWT Secret

Stored only in:

```env
JWT_SECRET=
```

Never hardcode.

---

## Authorization Header

```http
Authorization: Bearer JWT_TOKEN
```

---

# JWT Middleware Flow

```text
Request

→ Extract Token

→ Verify Token

→ Decode User

→ Attach req.user

→ Continue
```

---

# Unauthorized Response

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

# 4. ROLE BASED ACCESS CONTROL

## Middleware

File:

```text
src/middleware/role.middleware.js
```

---

## Usage

```javascript
authorize("ADMIN")
```

---

Multiple Roles

```javascript
authorize(
 "ADMIN",
 "VETERINARIAN"
)
```

---

# Access Rules

Admin:

Full Access

---

Staff:

Limited Operations

---

Veterinarian:

Health Operations Only

---

# 5. RATE LIMITING

Library:

```javascript
express-rate-limit
```

---

## Login Protection

```text
5 requests/minute
```

---

## API Protection

```text
100 requests/15 minutes
```

---

## Response

```json
{
 "success": false,
 "message": "Too many requests"
}
```

---

# 6. HELMET SECURITY

Library:

```javascript
helmet
```

---

Enable:

* XSS Protection
* Content Security Policy
* Frame Protection
* MIME Protection

---

# 7. CORS CONFIGURATION

Allowed Origins

Development:

```text
http://localhost:3000
```

Production:

Frontend Domain Only

---

Example

```javascript
cors({
 origin:[
   process.env.CLIENT_URL
 ]
})
```

---

# 8. INPUT VALIDATION

All endpoints must validate input.

---

Library

```javascript
express-validator
```

---

Validation Levels

Route

↓

Controller

↓

Service

---

Reject:

* Empty Data
* Invalid Dates
* Invalid IDs
* Invalid Email
* Invalid Numbers

---

# 9. FILE UPLOAD SECURITY

Allowed Types

```text
jpg
jpeg
png
webp
```

---

Blocked

```text
exe
pdf
zip
js
php
```

---

Maximum Size

```text
5MB
```

---

Validation Flow

```text
Upload

→ Validate MIME

→ Validate Size

→ Upload Cloudinary

→ Save URL
```

---

# 10. DATABASE SECURITY

## MongoDB Atlas

Use:

```text
Private Cluster
```

---

Whitelist:

Production Server IP

---

Use:

```text
TLS Enabled
```

---

Connection String

Stored in:

```env
MONGO_URI
```

---

# 11. ERROR HANDLING STRATEGY

File:

```text
src/middleware/error.middleware.js
```

---

Centralized Error Handler

All errors flow here.

---

Response

```json
{
 "success": false,
 "message": "Error message"
}
```

---

Never expose:

* Stack traces
* Mongo credentials
* Internal paths

---

# 12. LOGGING ARCHITECTURE

Library:

```text
winston
```

---

Files

```text
logs/error.log

logs/combined.log
```

---

# Log Categories

Authentication

---

Database

---

Goat Operations

---

Medicine Operations

---

Vaccination Operations

---

System Errors

---

Example

```javascript
logger.info(
 "Medicine Created"
)
```

---

# Error Example

```javascript
logger.error(
 error.message
)
```

---

# 13. DEPLOYMENT ARCHITECTURE

## Production Stack

```text
Frontend
   │
   ▼
Vercel

Backend
   │
   ▼
Render / Railway / AWS

Database
   │
   ▼
MongoDB Atlas

Images
   │
   ▼
Cloudinary
```

---

# Environment Layout

Development

Local Machine

---

Staging

Testing Environment

---

Production

Live Environment

---

# 14. DEPLOYMENT PROCESS

## Build

```bash
npm install
```

---

## Start

```bash
npm start
```

---

## Development

```bash
npm run dev
```

---

# Production Health Check

```http
GET /health
```

Response:

```json
{
 "status":"OK"
}
```

---

# 15. BACKUP STRATEGY

MongoDB Atlas Backup

Frequency:

Daily

---

Retention:

30 Days

---

Cloudinary

Images automatically stored.

---

# Disaster Recovery

Restore latest snapshot.

---

# 16. TESTING STRATEGY

## Testing Types

Unit Tests

Integration Tests

API Tests

---

# Unit Testing

Framework:

```javascript
Jest
```

---

Test:

Services

Validators

Utilities

---

# Integration Testing

Framework:

```javascript
Supertest
```

---

Test:

Routes

Controllers

Database

---

# Required Coverage

Minimum:

```text
80%
```

---

# 17. API DOCUMENTATION

## Tool

Swagger

---

Packages

```javascript
swagger-jsdoc

swagger-ui-express
```

---

Route

```text
/api/docs
```

---

Documentation Must Include

Authentication

Schemas

Endpoints

Examples

Error Responses

---

# Example Endpoint

```yaml
/api/goats:
  get:
    summary: Get All Goats
```

---

# 18. OPENAPI SPECIFICATION STANDARD

Version

```yaml
openapi: 3.0.0
```

---

Must Document

Every Endpoint

Every Request

Every Response

Every Schema

Every Error

---

# 19. MONITORING STRATEGY

Future Integration

```text
Sentry

Datadog

New Relic
```

---

Track

Errors

Latency

API Failures

Database Failures

---

# 20. PRODUCTION CHECKLIST

Authentication Works

✓

RBAC Works

✓

Validation Works

✓

Error Handling Works

✓

Swagger Works

✓

Rate Limiting Works

✓

MongoDB Connected

✓

Cloudinary Connected

✓

Cron Jobs Running

✓

Logs Working

✓

Environment Variables Configured

✓

---

# 21. API IMPLEMENTATION ORDER

The AI Agent MUST build in this order.

---

PHASE 1

Project Setup

Files:

```text
server.js

app.js

db.js
```

---

PHASE 2

Models

```text
User

Goat

Medicine

Vaccination

Treatment

WeightLog

Alert

Setting
```

---

PHASE 3

Authentication

```text
Register

Login

JWT

RBAC
```

---

PHASE 4

Middleware

```text
Auth

Role

Error

Validation
```

---

PHASE 5

Goat Module

```text
CRUD

Search

Filters

Weight Logs
```

---

PHASE 6

Medicine Module

```text
CRUD

Inventory Logic

Status Engine
```

---

PHASE 7

Vaccination Module

```text
CRUD

Due Detection
```

---

PHASE 8

Treatment Module

```text
CRUD

Inventory Reduction
```

---

PHASE 9

Alert Engine

```text
Service

Cron Job

Alert Generation
```

---

PHASE 10

Settings Module

```text
CRUD
```

---

PHASE 11

Swagger

```text
API Documentation
```

---

PHASE 12

Testing

```text
Unit Tests

Integration Tests
```

---

# 22. AI AGENT MASTER INSTRUCTIONS

The AI coding agent must:

1. Use MVC Architecture
2. Use Service Layer Architecture
3. Use MongoDB Transactions where required
4. Use Async/Await everywhere
5. Use Centralized Error Handling
6. Use JWT Authentication
7. Use RBAC Authorization
8. Use Express Validator
9. Use Winston Logging
10. Use Swagger Documentation
11. Use Cloudinary for Images
12. Use Mongoose Models
13. Implement Pagination
14. Implement Filtering
15. Implement Search
16. Implement Soft Delete
17. Implement Alert Engine
18. Implement Cron Jobs
19. Follow REST Standards
20. Produce production-ready code

The agent must generate complete working code and must not leave TODOs, placeholders, mock implementations, or incomplete routes.

---

# 23. POST-MVP ROADMAP

Version 2

* QR Code Goat Profiles
* Breeding Module
* Pregnancy Tracking
* Birth Records
* Goat Sales Management

---

Version 3

* Mobile App
* Offline Sync
* WhatsApp Notifications
* Analytics Dashboard

---

Version 4

* Multi-Farm Management
* Subscription SaaS Platform
* AI Disease Prediction
* AI Growth Analytics

---

# END OF TECHNICAL DESIGN DOCUMENT

