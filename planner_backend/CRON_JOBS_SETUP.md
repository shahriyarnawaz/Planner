# ⏰ Cron Jobs Setup Guide - Upcoming Deadline Tasks

## 📋 **What This Does**

Automatically checks for tasks with upcoming deadlines and can send email reminders.

**Features:**
- ✅ Checks tasks with deadlines within specified hours (default: 24 hours)
- ✅ Shows upcoming deadline tasks
- ✅ Optional email reminders
- ✅ Can be run manually or via cron job

---

## 🚀 **Quick Start**

### **1. Test the Command Manually**

```bash
cd planner_backend
python manage.py check_upcoming_deadlines
```

**Output:**
```
============================================================
🔔 CHECKING UPCOMING DEADLINE TASKS
============================================================
Current time: 2025-12-09 22:30:45
Checking tasks with deadlines within 24 hours
------------------------------------------------------------
📋 Found 3 upcoming deadline task(s):

  📌 Task: Study Python
     User: user@example.com
     Deadline: 2025-12-10 14:00:00
     Time until: 15 hour(s) and 30 minute(s)
     Priority: High
     Category: Study
```

---

### **2. Test with Email Reminders**

```bash
python manage.py check_upcoming_deadlines --send-email
```

This will send reminder emails to users for upcoming tasks.

---

### **3. Customize Time Range**

```bash
# Check tasks within 12 hours
python manage.py check_upcoming_deadlines --hours 12

# Check tasks within 48 hours
python manage.py check_upcoming_deadlines --hours 48
```

---

## ⚙️ **Setting Up Cron Jobs**

### **Option 1: Linux/Mac (Cron)**

#### **Step 1: Open Crontab**

```bash
crontab -e
```

#### **Step 2: Add Cron Job**

**Check every hour:**
```bash
0 * * * * cd /path/to/planner_backend && /path/to/python manage.py check_upcoming_deadlines --send-email
```

**Check every 15 minutes:**
```bash
*/15 * * * * cd /path/to/planner_backend && /path/to/python manage.py check_upcoming_deadlines --send-email
```

**Check every day at 9 AM:**
```bash
0 9 * * * cd /path/to/planner_backend && /path/to/python manage.py check_upcoming_deadlines --send-email
```

**Check every 6 hours:**
```bash
0 */6 * * * cd /path/to/planner_backend && /path/to/python manage.py check_upcoming_deadlines --send-email
```

#### **Step 3: Save and Exit**

- Press `Ctrl + X`
- Press `Y` to save
- Press `Enter` to confirm

#### **Step 4: Verify Cron Job**

```bash
crontab -l
```

---

### **Option 2: Windows (Task Scheduler)**

#### **Step 1: Open Task Scheduler**

1. Press `Win + R`
2. Type: `taskschd.msc`
3. Press Enter

#### **Step 2: Create Basic Task**

1. Click **"Create Basic Task"** (right sidebar)
2. Name: `Planner - Check Upcoming Deadlines`
3. Description: `Check for tasks with upcoming deadlines`
4. Click **Next**

#### **Step 3: Set Trigger**

1. Choose **"Daily"** or **"Hourly"**
2. Set time (e.g., every hour)
3. Click **Next**

#### **Step 4: Set Action**

1. Choose **"Start a program"**
2. Program/script: `C:\Python\python.exe` (or your Python path)
3. Add arguments: `manage.py check_upcoming_deadlines --send-email`
4. Start in: `D:\Planner-Project\planner_backend`
5. Click **Next** → **Finish**

---

### **Option 3: Django-Cron (Recommended for Django Projects)**

#### **Step 1: Install django-cron**

```bash
pip install django-cron
```

#### **Step 2: Add to INSTALLED_APPS**

In `settings.py`:
```python
INSTALLED_APPS = [
    # ... existing apps ...
    'django_cron',
]
```

#### **Step 3: Create Cron Job Class**

Create `api/cron_jobs.py`:
```python
from django_cron import CronJobBase, Schedule
from django.core.management import call_command

class CheckUpcomingDeadlinesCronJob(CronJobBase):
    RUN_EVERY_MINS = 60  # Run every hour
    
    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'api.check_upcoming_deadlines'  # Unique identifier
    
    def do(self):
        call_command('check_upcoming_deadlines', '--send-email')
```

#### **Step 4: Register in settings.py**

```python
CRON_CLASSES = [
    "api.cron_jobs.CheckUpcomingDeadlinesCronJob",
]
```

#### **Step 5: Run Cron Jobs**

```bash
python manage.py runcrons
```

**Or set up a system cron to run this every minute:**
```bash
* * * * * cd /path/to/planner_backend && python manage.py runcrons
```

---

## 📡 **API Endpoint - Get Upcoming Deadlines**

### **Endpoint:**

```
GET http://127.0.0.1:8000/api/tasks/upcoming-deadlines/
```

### **Headers:**

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

### **Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hours` | Integer | 24 | Show tasks within this many hours |
| `limit` | Integer | 10 | Maximum number of tasks to return |

### **Example Request:**

```
GET http://127.0.0.1:8000/api/tasks/upcoming-deadlines/?hours=12&limit=5
```

### **Example Response:**

```json
{
  "upcoming_deadlines": {
    "count": 3,
    "hours_ahead": 12,
    "tasks": [
      {
        "id": 1,
        "title": "Study Python",
        "priority": "high",
        "category": "study",
        "deadline": "2025-12-10T14:00:00Z",
        "completed": false,
        "is_overdue": false,
        "created_at": "2025-12-09T10:00:00Z",
        "time_until_deadline": "15 hour(s) and 30 minute(s)",
        "hours_until": 15,
        "minutes_until": 30
      },
      {
        "id": 2,
        "title": "Team Meeting",
        "priority": "medium",
        "category": "work",
        "deadline": "2025-12-10T09:00:00Z",
        "completed": false,
        "is_overdue": false,
        "created_at": "2025-12-09T08:00:00Z",
        "time_until_deadline": "10 hour(s) and 30 minute(s)",
        "hours_until": 10,
        "minutes_until": 30
      }
    ]
  },
  "message": "Found 3 task(s) with deadlines within 12 hours"
}
```

---

## 🧪 **Testing Examples**

### **Test 1: Check Upcoming Tasks (24 hours)**

```bash
python manage.py check_upcoming_deadlines
```

### **Test 2: Check with Email Reminders**

```bash
python manage.py check_upcoming_deadlines --send-email
```

### **Test 3: Check Tasks in Next 6 Hours**

```bash
python manage.py check_upcoming_deadlines --hours 6
```

### **Test 4: Check Tasks in Next 48 Hours with Emails**

```bash
python manage.py check_upcoming_deadlines --hours 48 --send-email
```

---

## 📊 **Cron Job Examples**

### **Every Hour (Recommended)**

```bash
0 * * * * cd /path/to/planner_backend && python manage.py check_upcoming_deadlines --send-email
```

### **Every 30 Minutes**

```bash
*/30 * * * * cd /path/to/planner_backend && python manage.py check_upcoming_deadlines --send-email
```

### **Every 15 Minutes**

```bash
*/15 * * * * cd /path/to/planner_backend && python manage.py check_upcoming_deadlines --send-email
```

### **Twice Daily (9 AM and 6 PM)**

```bash
0 9,18 * * * cd /path/to/planner_backend && python manage.py check_upcoming_deadlines --send-email
```

### **Every Day at 8 AM**

```bash
0 8 * * * cd /path/to/planner_backend && python manage.py check_upcoming_deadlines --send-email
```

---

## 🔧 **Troubleshooting**

### **Cron Job Not Running**

1. **Check cron service is running:**
   ```bash
   sudo service cron status
   ```

2. **Check cron logs:**
   ```bash
   grep CRON /var/log/syslog
   ```

3. **Use absolute paths:**
   ```bash
   /usr/bin/python3 /full/path/to/planner_backend/manage.py check_upcoming_deadlines
   ```

4. **Add logging:**
   ```bash
   0 * * * * cd /path/to/planner_backend && python manage.py check_upcoming_deadlines >> /path/to/logs/cron.log 2>&1
   ```

---

### **Email Not Sending**

1. **Check email configuration** (see EMAIL_SETUP.md)
2. **Test email manually:**
   ```bash
   python manage.py test_email
   ```
3. **Check console output** for errors

---

### **Command Not Found**

1. **Use full Python path:**
   ```bash
   /usr/bin/python3 manage.py check_upcoming_deadlines
   ```

2. **Or activate virtual environment:**
   ```bash
   0 * * * * cd /path/to/planner_backend && source venv/bin/activate && python manage.py check_upcoming_deadlines
   ```

---

## 📝 **Recommended Schedule**

**For Production:**
- **Check every hour** - Good balance between timely reminders and server load
- **Send emails** - Keep users informed

**For Development:**
- **Check every 15-30 minutes** - More frequent testing
- **Optional emails** - Test email system

---

## ✅ **Complete Setup Checklist**

- [ ] Test command manually: `python manage.py check_upcoming_deadlines`
- [ ] Test with emails: `python manage.py check_upcoming_deadlines --send-email`
- [ ] Set up cron job (Linux/Mac) or Task Scheduler (Windows)
- [ ] Verify cron job is running: `crontab -l` or check Task Scheduler
- [ ] Check logs for any errors
- [ ] Test API endpoint: `GET /api/tasks/upcoming-deadlines/`
- [ ] Verify emails are being sent
- [ ] Monitor cron job execution

---

## 🎯 **What Gets Checked**

The command finds tasks where:
- ✅ `deadline` is in the future (not past)
- ✅ `deadline` is within specified hours (default: 24)
- ✅ `completed = False` (not already done)
- ✅ Belongs to the user (for API endpoint)

---

## 📧 **Email Reminders**

When `--send-email` flag is used:
- ✅ Sends reminder email to task owner
- ✅ Shows time until deadline
- ✅ Includes task details
- ✅ Beautiful HTML formatted email

---

**Your cron job system is ready! Set it up and users will get automatic deadline reminders! ⏰📧**

