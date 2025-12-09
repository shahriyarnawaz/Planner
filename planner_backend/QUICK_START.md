# ⚡ Quick Start Commands

## 🔧 First Time Setup

```bash
# 1. Navigate to backend directory
cd planner_backend

# 2. Activate virtual environment (Windows)
..\venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py migrate

# 5. Create superuser (optional)
python manage.py createsuperuser

# 6. Start server
python manage.py runserver
```

---

## 🚀 Daily Development

```bash
# Activate virtual environment
..\venv\Scripts\activate

# Start Django server
python manage.py runserver
```

Server runs at: **http://127.0.0.1:8000/**

---

## 📡 Test Your First API Call

### Register a User:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"SecurePass123!\",\"password2\":\"SecurePass123!\"}"
```

### Login:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"SecurePass123!\"}"
```

---

## 🔑 Important URLs

- **Admin Panel**: http://127.0.0.1:8000/admin/
- **API Base**: http://127.0.0.1:8000/api/
- **Register**: http://127.0.0.1:8000/api/auth/register/
- **Login**: http://127.0.0.1:8000/api/auth/login/

---

## 📚 Next Steps

1. ✅ Test all authentication endpoints (see `API_TESTING.md`)
2. ✅ Import Postman collection (`Planner_API.postman_collection.json`)
3. ⏭️ Connect React frontend
4. ⏭️ Build task management features

---

## 🆘 Quick Troubleshooting

**Problem**: Can't start server  
**Solution**: Activate virtual environment first

**Problem**: Module not found  
**Solution**: Run `pip install -r requirements.txt`

**Problem**: Database errors  
**Solution**: Run `python manage.py migrate`

---

**You're all set! Start testing the APIs! 🎉**

