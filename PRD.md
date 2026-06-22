# GOAT FARM MANAGEMENT SYSTEM (GFMS)

# PRODUCT REQUIREMENTS DOCUMENT (DEVELOPMENT VERSION)

Version: 2.0

Status: Development Ready

Target Release: MVP v1

Technology Stack:

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Cloudinary
- React (Future Frontend)

---

# 1. PRODUCT OVERVIEW

## Product Name

Goat Farm Management System (GFMS)

## Product Type

Livestock Management Platform

## Industry

Agriculture / Livestock Farming

## Purpose

GFMS provides a centralized digital platform for managing:

- Goat Records
- Health Records
- Medicine Inventory
- Vaccinations
- Treatments
- Alerts
- Farm Settings

The system replaces manual registers and spreadsheets.

---

# 2. BUSINESS PROBLEM

Most small and medium goat farms operate using:

- Paper Registers
- Excel Files
- WhatsApp Messages
- Verbal Tracking

This creates:

### Problem 1

No centralized animal records.

Impact:

- Lost data
- Duplicate records

### Problem 2

Medicine expiry is not tracked.

Impact:

- Financial loss
- Animal health risk

### Problem 3

Vaccinations are missed.

Impact:

- Disease outbreaks

### Problem 4

Treatment history is unavailable.

Impact:

- Poor medical decisions

---

# 3. SUCCESS METRICS

The system is successful if:

- 100% goats have digital records
- Vaccination reminders are generated automatically
- Medicine expiry alerts work correctly
- Search response time < 500ms
- Inventory accuracy > 95%

---

# 4. USER ROLES

## ADMIN

Description:  
Farm Owner or Manager

Permissions:

- Full access

Can:

- Create goats
- Update goats
- Delete goats
- Create medicines
- Update medicines
- Delete medicines
- Manage users
- Manage settings

---

## STAFF

Description:  
Farm Workers

Permissions:

Can:

- View goats
- Update weights
- Record treatments

Cannot:

- Delete records
- Manage users

---

## VETERINARIAN

Description:  
Doctor

Permissions:

Can:

- Add vaccinations
- Add treatments
- View health history

Cannot:

- Delete goats
- Manage users

---

# 5. ROLE PERMISSION MATRIX


| Feature            | Admin | Staff | Vet |
| ------------------ | ----- | ----- | --- |
| View Goats         | Yes   | Yes   | Yes |
| Create Goats       | Yes   | No    | No  |
| Edit Goats         | Yes   | Yes   | No  |
| Delete Goats       | Yes   | No    | No  |
| View Medicines     | Yes   | Yes   | Yes |
| Create Medicines   | Yes   | No    | No  |
| Edit Medicines     | Yes   | No    | No  |
| Delete Medicines   | Yes   | No    | No  |
| Create Vaccination | Yes   | No    | Yes |
| Create Treatment   | Yes   | Yes   | Yes |
| Settings Access    | Yes   | No    | No  |


---

# 6. DATABASE DESIGN

## Collection: users

Schema

_id

name

email

password

role

isActive

createdAt

updatedAt

Indexes:

email (unique)

---

## Collection: goats

Schema

_id

uidTag

name

gender

breed

color

dob

weight

status

photo

mother

father

notes

isDeleted

createdAt

updatedAt

Indexes:

uidTag (unique)

gender

status

breed

---

## Collection: medicines

Schema

_id

name

type

image

batchNumber

quantity

unit

purchaseDate

expiryDate

supplier

notes

status

createdAt

updatedAt

Indexes:

name

expiryDate

status

---

## Collection: vaccinations

Schema

_id

goat

vaccineName

dateGiven

nextDueDate

veterinarian

notes

createdAt

updatedAt

Indexes:

goat

nextDueDate

---

## Collection: treatments

Schema

_id

goat

medicine

disease

treatmentDate

notes

createdAt

updatedAt

---

## Collection: weight_logs

Schema

_id

goat

weight

date

createdAt

---

## Collection: alerts

Schema

_id

type

title

description

severity

isRead

createdAt

---

## Collection: settings

Schema

_id

farmName

logo

phone

email

address

updatedAt

---

# 7. ENTITY RELATIONSHIP DESIGN

User  
|  
├── Creates Goats  
├── Creates Medicines  
├── Creates Vaccinations  
└── Creates Treatments

Goat  
|  
├── Has Many Vaccinations  
├── Has Many Treatments  
├── Has Many Weight Logs  
├── Belongs To Mother Goat  
├── Belongs To Father Goat  
└── Has Many Kids

Medicine  
|  
└── Used In Treatments

---

# 8. API STANDARDS

Base URL

/api

Response Format

Success

{  
"success": true,  
"message": "Operation successful",  
"data": {}  
}

Failure

{  
"success": false,  
"message": "Validation failed"  
}

---

# 9. GOAT MODULE

## Create Goat

POST /api/goats

Validation

uidTag:

- Required
- Unique

gender:

- Male
- Female

status:

- Active
- Sold
- Dead
- Pregnant

Acceptance Criteria

- Goat created successfully
- UID must be unique
- Audit log created

---

## Get All Goats

GET /api/goats

Query Parameters

?page=1

&limit=10

&search=

&gender=

&breed=

&status=

Acceptance Criteria

- Supports pagination
- Supports filtering
- Supports search

---

## Get Goat By ID

GET /api/goats/:id

Acceptance Criteria

Must populate:

- Mother
- Father
- Kids

---

# 10. MEDICINE MODULE

Business Rules

Status Auto Calculation

Quantity = 0

Status = Out Of Stock

Quantity > 0 and Quantity < 5

Status = Low Stock

Quantity >= 5

Status = Available

Expiry Date Passed

Status = Expired

Acceptance Criteria

Status should update automatically.

---

# 11. ALERT ENGINE

Runs:

Daily

Alert Generation Rules

Rule 1

Medicine Expiry

If:

expiryDate <= 30 days

Generate:

MEDICINE_EXPIRING

---

Rule 2

Medicine Expired

If:

expiryDate < today

Generate:

MEDICINE_EXPIRED

---

Rule 3

Low Stock

If:

quantity < 5

Generate:

LOW_STOCK

---

Rule 4

Vaccination Due

If:

nextDueDate <= 7 days

Generate:

VACCINATION_DUE

---

Rule 5

Vaccination Overdue

If:

nextDueDate < today

Generate:

VACCINATION_OVERDUE

---

# 12. SECURITY REQUIREMENTS

Authentication

JWT

Password Hashing

bcrypt

Authorization

RBAC

Validation

express-validator

Helmet

Required

Rate Limiting

Required

CORS

Required

---

# 13. LOGGING REQUIREMENTS

Log:

Authentication Events

Failed Logins

Medicine Updates

Goat Updates

System Errors

Use:

Winston

---

# 14. DEPLOYMENT REQUIREMENTS

Environment

Development

Staging

Production

Infrastructure

Backend:  
Node.js

Database:  
MongoDB Atlas

Images:  
Cloudinary

Hosting:  
Render / Railway / AWS

---

# 15. MVP ACCEPTANCE CRITERIA

The system is considered complete when:

✓ Authentication works

✓ Role permissions work

✓ Goat CRUD works

✓ Medicine CRUD works

✓ Vaccination CRUD works

✓ Treatment CRUD works

✓ Weight tracking works

✓ Alert generation works

✓ MongoDB integration works

✓ API documentation exists

✓ Production deployment succeeds

END OF DOCUMENT