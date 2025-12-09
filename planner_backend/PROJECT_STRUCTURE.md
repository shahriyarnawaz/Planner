# 📁 Project Structure Documentation

## Overview

The backend is organized into **modular components** for better maintainability and scalability. Each module handles a specific domain of functionality.

---

## 🏗️ Directory Structure

```
planner_backend/
├── api/                              # Main API application
│   ├── authentication/               # 🔐 Authentication Module
│   │   ├── __init__.py
│   │   ├── serializers.py           # Auth-related serializers
│   │   ├── views.py                 # Login, Register, Logout, Password
│   │   └── urls.py                  # Auth endpoints routing
│   │
│   ├── users/                       # 👤 User Management Module
│   │   ├── __init__.py
│   │   ├── serializers.py           # User profile serializers
│   │   ├── views.py                 # Profile, List, Detail views
│   │   └── urls.py                  # User endpoints routing
│   │
│   ├── migrations/                  # Database migrations
│   │   └── __init__.py
│   │
│   ├── __init__.py
│   ├── admin.py                     # Django admin configuration
│   ├── apps.py                      # App configuration
│   ├── models.py                    # Database models (future)
│   ├── tests.py                     # Test cases
│   └── urls.py                      # Main API router
│
├── planner_backend/                 # Project settings
│   ├── __init__.py
│   ├── asgi.py                      # ASGI configuration
│   ├── settings.py                  # Django settings
│   ├── urls.py                      # Root URL configuration
│   └── wsgi.py                      # WSGI configuration
│
├── db.sqlite3                       # SQLite database
├── manage.py                        # Django management script
├── requirements.txt                 # Python dependencies
│
├── SETUP.md                         # Setup instructions
├── API_TESTING.md                   # API testing guide
├── PROJECT_STRUCTURE.md             # This file
├── QUICK_START.md                   # Quick reference
└── Planner_API.postman_collection.json  # Postman collection
```

---

## 📦 Module Breakdown

### 🔐 Authentication Module (`api/authentication/`)

**Purpose**: Handles all authentication-related functionality

**Files**:
- `serializers.py`: 
  - `RegisterSerializer` - User registration validation
  - `LoginSerializer` - Login credentials validation
  - `ChangePasswordSerializer` - Password change validation

- `views.py`:
  - `RegisterView` - Create new user account
  - `LoginView` - Authenticate and generate JWT tokens
  - `LogoutView` - Blacklist refresh token
  - `ChangePasswordView` - Update user password

- `urls.py`:
  - `/api/auth/register/` - POST
  - `/api/auth/login/` - POST
  - `/api/auth/logout/` - POST
  - `/api/auth/token/refresh/` - POST
  - `/api/auth/change-password/` - POST

---

### 👤 User Management Module (`api/users/`)

**Purpose**: Handles user profile and user data management

**Files**:
- `serializers.py`:
  - `UserSerializer` - Complete user profile data
  - `UserListSerializer` - Minimal user data for listings

- `views.py`:
  - `UserProfileView` - Get/Update authenticated user profile
  - `UserListView` - List all users (admin/testing)
  - `UserDetailView` - Get specific user by ID

- `urls.py`:
  - `/api/users/profile/` - GET, PUT, PATCH
  - `/api/users/list/` - GET
  - `/api/users/{id}/` - GET

---

## 🔄 Request Flow

### Example: User Registration

```
1. Client sends POST to /api/auth/register/
   ↓
2. Main urls.py routes to api/urls.py
   ↓
3. api/urls.py routes to authentication/urls.py
   ↓
4. authentication/urls.py routes to RegisterView
   ↓
5. RegisterView uses RegisterSerializer for validation
   ↓
6. User is created and JWT tokens are generated
   ↓
7. Response sent back to client
```

---

## 🎯 Design Principles

### 1. **Separation of Concerns**
- Authentication logic is separate from user management
- Each module has its own serializers, views, and URLs
- Easy to locate and modify specific functionality

### 2. **Modularity**
- New features can be added as new modules
- Existing modules don't interfere with each other
- Clear boundaries between different functionalities

### 3. **Scalability**
- Easy to add new endpoints to existing modules
- Simple to create new modules for new features
- Organized structure supports team collaboration

### 4. **Maintainability**
- Clear file naming conventions
- Comprehensive documentation in each file
- Consistent code organization across modules

---

## 📝 Naming Conventions

### Files
- `serializers.py` - Data serialization and validation
- `views.py` - Request handling and business logic
- `urls.py` - URL routing configuration
- `__init__.py` - Module initialization

### Views
- Suffix with `View` (e.g., `LoginView`, `UserProfileView`)
- Use descriptive names that indicate functionality
- Follow REST conventions (List, Detail, Create, Update, etc.)

### Serializers
- Suffix with `Serializer` (e.g., `UserSerializer`)
- Name based on the model or purpose
- Specific serializers for specific purposes

### URL Patterns
- Use lowercase with hyphens (e.g., `change-password`)
- Group related endpoints under common prefixes
- Follow RESTful conventions

---

## 🚀 Adding New Modules

To add a new module (e.g., `tasks` for task management):

1. **Create module directory**:
   ```bash
   mkdir api/tasks
   ```

2. **Create required files**:
   ```bash
   touch api/tasks/__init__.py
   touch api/tasks/serializers.py
   touch api/tasks/views.py
   touch api/tasks/urls.py
   ```

3. **Implement your logic** in the files

4. **Register in main router** (`api/urls.py`):
   ```python
   path('tasks/', include('api.tasks.urls')),
   ```

5. **Create models if needed** in `api/models.py`

6. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

---

## 📚 Future Modules (Planned)

```
planner_backend/
├── api/
│   ├── authentication/     ✅ Implemented
│   ├── users/             ✅ Implemented
│   ├── tasks/             📋 Planned - Task management
│   ├── categories/        📋 Planned - Task categories
│   ├── notifications/     📋 Planned - User notifications
│   └── analytics/         📋 Planned - Usage statistics
```

---

## 🔍 Finding Files Quickly

### Looking for Authentication Code?
→ `api/authentication/`

### Looking for User Profile Code?
→ `api/users/`

### Looking for URL Routing?
→ Check the `urls.py` in the respective module

### Looking for Data Validation?
→ Check the `serializers.py` in the respective module

### Looking for API Logic?
→ Check the `views.py` in the respective module

---

## ✅ Benefits of This Structure

1. **Easy Navigation** - Find files by feature, not by type
2. **Clear Organization** - Each module is self-contained
3. **Better Collaboration** - Team members can work on different modules
4. **Reduced Conflicts** - Less merge conflicts in version control
5. **Faster Development** - Quick to locate and modify code
6. **Easier Testing** - Test each module independently
7. **Cleaner Code** - No massive files with hundreds of lines
8. **Professional** - Industry-standard organization pattern

---

## 📖 Related Documentation

- [Setup Guide](SETUP.md) - How to set up the project
- [API Testing Guide](API_TESTING.md) - How to test the APIs
- [Quick Start](QUICK_START.md) - Quick reference commands

---

**Enjoy working with a clean, organized codebase! 🎉**

