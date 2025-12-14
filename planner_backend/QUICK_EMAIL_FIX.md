# 🚨 QUICK EMAIL FIX - Gmail Authentication Error

## ❌ **Your Current Error:**
```
Error: (535, b'5.7.8 Username and Password not accepted')
```

---

## ✅ **IMMEDIATE FIX (3 Steps):**

### **1. Generate Gmail App Password**

**Go to:** https://myaccount.google.com/apppasswords

**Steps:**
- Select app: **Mail**
- Select device: **Other (Custom name)**
- Name: **Planner App**
- Click **Generate**
- **Copy the 16-character password** (remove spaces!)

**Example:** `abcd efgh ijkl mnop` → Use as: `abcdefghijklmnop`

---

### **2. Update settings.py**

**File:** `planner_backend/planner_backend/settings.py`

**Line 205-207, change to:**

```python
EMAIL_HOST_USER = 'eshaarif0322@gmail.com'
EMAIL_HOST_PASSWORD = 'your-16-char-app-password-here'  # NO SPACES!
DEFAULT_FROM_EMAIL = 'Planner App <eshaarif0322@gmail.com>'
```

**⚠️ IMPORTANT:**
- Use your **App Password** (NOT your regular Gmail password)
- Remove all spaces from App Password
- Must be exactly 16 characters

---

### **3. Restart Server**

```bash
# Stop server (Ctrl+C)
python manage.py runserver
```

---

## 🧪 **Test It:**

```bash
python manage.py test_email
```

**Expected:**
```
✅ TEST EMAIL SENT SUCCESSFULLY!
```

---

## ⚠️ **If You See "App passwords not available":**

**You need to enable 2-Step Verification first:**

1. Go to: https://myaccount.google.com/security
2. Enable **"2-Step Verification"**
3. Then go back to Step 1 above

---

## 📧 **After Fix:**

When you create a task, you'll see:

```
✅ EMAIL SENT SUCCESSFULLY!
✅ Email sent to: eshaarif0322@gmail.com
```

**And you'll receive the email in your inbox!**

---

**That's it! Follow these 3 steps and email will work! 🎉**

