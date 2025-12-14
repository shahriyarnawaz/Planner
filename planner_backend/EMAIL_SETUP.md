# 📧 Email Configuration Guide - Gmail Setup

## ❌ **Current Error:**
```
Error: (535, b'5.7.8 Username and Password not accepted')
```

**This means:** Gmail is rejecting your credentials. You need to use an **App Password**, not your regular password!

---

## ✅ **STEP-BY-STEP GMAIL SETUP**

### **Step 1: Enable 2-Step Verification**

1. Go to: https://myaccount.google.com/security
2. Find **"2-Step Verification"**
3. Click **"Get Started"** or **"Turn On"**
4. Follow the setup process (verify phone number, etc.)
5. ✅ **2-Step Verification must be ON** before you can create App Password

---

### **Step 2: Generate Gmail App Password**

1. Go to: https://myaccount.google.com/apppasswords
   - (If link doesn't work, go to: https://myaccount.google.com → Security → App passwords)

2. You'll see a page asking:
   - **Select app:** Choose **"Mail"**
   - **Select device:** Choose **"Other (Custom name)"**
   - **Enter name:** Type **"Planner App"**
   - Click **"Generate"**

3. Google will show you a **16-character password** like:
   ```
   xxxx xxxx xxxx xxxx
   ```
   **⚠️ IMPORTANT:** Copy this password NOW - you can only see it once!

4. **Remove spaces** when using it:
   ```
   xxxxxxxxxxxxxxxx
   ```

---

### **Step 3: Update settings.py**

Open: `planner_backend/planner_backend/settings.py`

Find lines 205-207 and update:

```python
EMAIL_HOST_USER = 'eshaarif0322@gmail.com'  # ⬅️ Your Gmail address
EMAIL_HOST_PASSWORD = 'xxxxxxxxxxxxxxxx'  # ⬅️ 16-char App Password (NO SPACES)
DEFAULT_FROM_EMAIL = 'Planner App <eshaarif0322@gmail.com>'  # ⬅️ Your Gmail
```

**Example:**
```python
EMAIL_HOST_USER = 'eshaarif0322@gmail.com'
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'  # Remove spaces → 'abcdefghijklmnop'
DEFAULT_FROM_EMAIL = 'Planner App <eshaarif0322@gmail.com>'
```

---

### **Step 4: Restart Django Server**

```bash
# Stop server (Ctrl+C)
# Start again
python manage.py runserver
```

---

### **Step 5: Test Email Configuration**

Run this command to test:

```bash
python manage.py test_email
```

Or test with specific email:

```bash
python manage.py test_email --to eshaarif0322@gmail.com
```

**Expected Output:**
```
✅ TEST EMAIL SENT SUCCESSFULLY!
✅ Email sent to: eshaarif0322@gmail.com
✅ Check your inbox (and spam folder)
```

---

## 🧪 **TEST EMAIL COMMAND**

After updating settings, test your email:

```bash
cd planner_backend
python manage.py test_email
```

This will:
- ✅ Check your email configuration
- ✅ Send a test email
- ✅ Show detailed error messages if it fails

---

## ❌ **COMMON ERRORS & SOLUTIONS**

### **Error 1: "Username and Password not accepted" (535)**

**Cause:** Using regular Gmail password instead of App Password

**Solution:**
1. ✅ Generate App Password (Step 2 above)
2. ✅ Use the 16-character App Password (no spaces)
3. ✅ NOT your regular Gmail password

---

### **Error 2: "App passwords are not available"**

**Cause:** 2-Step Verification is not enabled

**Solution:**
1. ✅ Enable 2-Step Verification first (Step 1 above)
2. ✅ Then generate App Password

---

### **Error 3: "Connection refused" or "Connection timeout"**

**Cause:** Network or firewall issue

**Solution:**
1. ✅ Check internet connection
2. ✅ Check EMAIL_HOST = 'smtp.gmail.com'
3. ✅ Check EMAIL_PORT = 587
4. ✅ Check EMAIL_USE_TLS = True
5. ✅ Check firewall settings

---

### **Error 4: "Less secure app access"**

**Cause:** Gmail deprecated this feature

**Solution:**
- ✅ Use App Password instead (Step 2 above)
- ✅ Don't use "Less secure app access"

---

## 📋 **COMPLETE SETTINGS.PY CONFIGURATION**

```python
# Email Configuration (SMTP)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'eshaarif0322@gmail.com'  # ⬅️ YOUR EMAIL
EMAIL_HOST_PASSWORD = 'your-16-char-app-password'  # ⬅️ APP PASSWORD (no spaces)
DEFAULT_FROM_EMAIL = 'Planner App <eshaarif0322@gmail.com>'  # ⬅️ YOUR EMAIL
```

---

## ✅ **VERIFICATION CHECKLIST**

Before testing, verify:

- [ ] 2-Step Verification is enabled on Gmail
- [ ] App Password is generated (16 characters)
- [ ] App Password copied (no spaces)
- [ ] `EMAIL_HOST_USER` updated in settings.py
- [ ] `EMAIL_HOST_PASSWORD` updated in settings.py
- [ ] `DEFAULT_FROM_EMAIL` updated in settings.py
- [ ] Django server restarted after changes
- [ ] Test email command run successfully

---

## 🎯 **QUICK TEST**

1. **Update settings.py** with your email and App Password
2. **Restart server**
3. **Run test:**
   ```bash
   python manage.py test_email
   ```
4. **Create a task** via Postman
5. **Check console** for email status
6. **Check inbox** for email

---

## 📞 **STILL NOT WORKING?**

1. **Double-check App Password:**
   - Must be 16 characters
   - No spaces
   - Generated AFTER enabling 2-Step Verification

2. **Verify settings.py:**
   - No typos in email address
   - No extra spaces in password
   - Settings saved correctly

3. **Check Gmail account:**
   - Account is active
   - 2-Step Verification is ON
   - App Password is valid

4. **Test with console backend:**
   ```python
   EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
   ```
   This will print emails to terminal (for testing)

---

## 🎉 **SUCCESS INDICATORS**

When email is working, you'll see:

**In Console:**
```
✅ EMAIL SENT SUCCESSFULLY!
✅ Email sent to: eshaarif0322@gmail.com
```

**In Your Inbox:**
- Email with subject: "New Task Created: [Task Title]"
- Beautiful HTML formatted email
- Task details included

---

**Follow these steps exactly, and your email will work! 📧✅**
