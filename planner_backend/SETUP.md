# Planner Backend - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

Make sure you're in the `planner_backend` directory and activate your virtual environment:

```bash
# Activate virtual environment
# On Windows:
..\venv\Scripts\activate

# On Mac/Linux:
source ../venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

### 2. Run Migrations

Create database tables for Django and JWT token blacklist:

```bash
python manage.py makemigrations
python manage.py migrate
```

Expected output:
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  ...
  Applying token_blacklist.0001_initial... OK
```

### 3. Create Superuser (Optional - for Admin Panel)

```bash
python manage.py createsuperuser
```

You'll be prompted to enter:
- Username
- Email address (optional)
- Password (twice)

### 4. Run Development Server

```bash
python manage.py runserver
```

Server will start at: `http://127.0.0.1:8000/`

---

## 📡 API Endpoints

Base URL: `http://127.0.0.1:8000/api/`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | ❌ No |
| POST | `/api/auth/login/` | Login user | ❌ No |
| POST | `/api/auth/logout/` | Logout user | ✅ Yes |
| POST | `/api/auth/token/refresh/` | Refresh access token | ❌ No |
| POST | `/api/auth/change-password/` | Change password | ✅ Yes |
| GET | `/api/users/profile/` | Get user profile | ✅ Yes |
| PUT/PATCH | `/api/users/profile/` | Update user profile | ✅ Yes |
| GET | `/api/users/list/` | List all users | ✅ Yes |
| GET | `/api/users/{id}/` | Get specific user | ✅ Yes |

---

## 🔧 Environment Configuration

The project uses SQLite for development (no configuration needed).

For production with PostgreSQL:
1. Install `psycopg2-binary`: `pip install psycopg2-binary`
2. Update `DATABASES` in `settings.py`

---

## 🎯 What's Configured

✅ Django REST Framework  
✅ JWT Authentication (djangorestframework-simplejwt)  
✅ CORS Headers (configured for React on localhost:3000)  
✅ Token Blacklisting (for logout functionality)  
✅ User Registration with validation  
✅ User Login with JWT tokens  
✅ User Logout with token blacklisting  
✅ User Profile management  
✅ Password change functionality  

---

## 🔐 JWT Token Configuration

- **Access Token Lifetime**: 1 hour
- **Refresh Token Lifetime**: 7 days
- **Tokens Rotate**: Yes (new refresh token on refresh)
- **Blacklist After Rotation**: Yes
- **Algorithm**: HS256

---

## 📝 Next Steps

1. Test all authentication endpoints (see API_TESTING.md)
2. Connect React frontend
3. Add custom models for your planner features
4. Implement additional business logic

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError"
**Solution**: Make sure virtual environment is activated and dependencies are installed

### Issue: "Table doesn't exist"
**Solution**: Run migrations: `python manage.py migrate`

### Issue: CORS errors from React
**Solution**: Check that `http://localhost:3000` is in `CORS_ALLOWED_ORIGINS` in settings.py

### Issue: "Token blacklist" errors
**Solution**: Make sure `rest_framework_simplejwt.token_blacklist` is in INSTALLED_APPS and migrations are run

