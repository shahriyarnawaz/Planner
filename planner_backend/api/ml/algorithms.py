"""
ML Algorithms for Smart Task Recommendations
Simple, effective pattern detection and predictions
"""

from collections import Counter
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Q
from difflib import SequenceMatcher
import re


class TaskAnalyzer:
    """Analyzes task patterns and provides intelligent recommendations"""
    
    def __init__(self, user):
        self.user = user
    
    def detect_recurring_tasks(self, tasks):
        """
        Detect recurring tasks based on title similarity
        Returns list of tasks that appear to repeat
        """
        recurring = []
        
        # Normalize titles for comparison
        normalized_tasks = {}
        for task in tasks:
            normalized = self.normalize_title(task.title)
            if normalized not in normalized_tasks:
                normalized_tasks[normalized] = []
            normalized_tasks[normalized].append(task)
        
        # Find tasks with multiple occurrences
        for normalized_title, task_list in normalized_tasks.items():
            if len(task_list) >= 2:  # At least 2 similar tasks
                # Calculate frequency
                total_days = (timezone.now() - task_list[-1].created_at).days + 1
                frequency = len(task_list) / max(total_days, 1)
                
                recurring.append({
                    'title': task_list[0].title,
                    'count': len(task_list),
                    'frequency': round(frequency * 7, 2),  # per week
                    'last_completed': task_list[0].created_at if task_list[0].completed else None,
                    'category': task_list[0].category,
                    'avg_duration': self.calculate_avg_duration(task_list),
                })
        
        # Sort by frequency
        recurring.sort(key=lambda x: x['count'], reverse=True)
        
        return recurring[:10]  # Top 10 recurring tasks
    
    def predict_best_time(self, tasks):
        """
        Predict best time to complete tasks based on completion history
        Returns recommended hours for different task types
        """
        completed_tasks = [t for t in tasks if t.completed and t.updated_at]
        
        if not completed_tasks:
            return self.get_default_time_suggestions()
        
        # Analyze completion times by category
        time_by_category = {}
        
        for task in completed_tasks:
            category = task.category
            hour = task.updated_at.hour
            
            if category not in time_by_category:
                time_by_category[category] = []
            time_by_category[category].append(hour)
        
        # Find most common completion hour for each category
        best_times = {}
        for category, hours in time_by_category.items():
            if hours:
                most_common_hour = Counter(hours).most_common(1)[0][0]
                best_times[category] = {
                    'hour': most_common_hour,
                    'time_range': self.format_time_range(most_common_hour),
                    'confidence': round(hours.count(most_common_hour) / len(hours) * 100, 1)
                }
        
        return best_times
    
    def suggest_task_order(self, pending_tasks):
        """
        Suggest optimal task order based on multiple factors
        Returns sorted list with reasoning
        """
        if not pending_tasks:
            return []
        
        scored_tasks = []
        
        for task in pending_tasks:
            score = self.calculate_task_score(task)
            
            scored_tasks.append({
                'task_id': task.id,
                'title': task.title,
                'category': task.category,
                'priority': task.priority,
                'deadline': task.deadline,
                'score': score['total'],
                'reasons': score['reasons']
            })
        
        # Sort by score (highest first)
        scored_tasks.sort(key=lambda x: x['score'], reverse=True)
        
        return scored_tasks
    
    def calculate_task_score(self, task):
        """
        Calculate priority score for a task
        Higher score = should be done sooner
        """
        score = 0
        reasons = []
        
        # Priority scoring
        priority_scores = {'high': 50, 'medium': 30, 'low': 10}
        score += priority_scores.get(task.priority, 0)
        reasons.append(f"{task.priority.title()} priority")
        
        # Deadline urgency
        if task.deadline:
            time_until_deadline = task.deadline - timezone.now()
            days_until = time_until_deadline.total_seconds() / 86400
            
            if days_until < 0:
                score += 100  # Overdue!
                reasons.append("⚠️ OVERDUE")
            elif days_until < 1:
                score += 80  # Due today
                reasons.append("Due today")
            elif days_until < 3:
                score += 60  # Due soon
                reasons.append("Due in next 3 days")
            elif days_until < 7:
                score += 40
                reasons.append("Due this week")
            else:
                score += 20
                reasons.append("Has deadline")
        
        # Duration consideration (short tasks first)
        if task.duration:
            if task.duration <= 30:
                score += 15
                reasons.append("Quick task (≤30 min)")
            elif task.duration <= 60:
                score += 10
                reasons.append("Medium task (≤1 hour)")
        
        # Category importance (study and work higher)
        if task.category in ['study', 'work']:
            score += 15
            reasons.append(f"Important category: {task.category}")
        
        return {
            'total': score,
            'reasons': reasons
        }
    
    def get_task_insights(self, tasks):
        """
        Get overall insights about user's task patterns
        """
        if not tasks:
            return {}
        
        completed = [t for t in tasks if t.completed]
        pending = [t for t in tasks if not t.completed]
        
        # Completion rate
        completion_rate = (len(completed) / len(tasks) * 100) if tasks else 0
        
        # Most productive category
        category_completion = {}
        for task in completed:
            category_completion[task.category] = category_completion.get(task.category, 0) + 1
        
        most_productive_category = max(category_completion.items(), key=lambda x: x[1])[0] if category_completion else None
        
        # Average task duration
        durations = [t.duration for t in tasks if t.duration]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        # Task completion streak
        recent_completed = [t for t in completed if (timezone.now() - t.updated_at).days <= 7]
        
        return {
            'total_tasks': len(tasks),
            'completed_tasks': len(completed),
            'pending_tasks': len(pending),
            'completion_rate': round(completion_rate, 1),
            'most_productive_category': most_productive_category,
            'average_duration': round(avg_duration, 0) if avg_duration else None,
            'tasks_completed_this_week': len(recent_completed),
            'overdue_tasks': len([t for t in pending if t.is_overdue]),
        }
    
    # Helper methods
    
    def normalize_title(self, title):
        """Normalize task title for comparison"""
        # Remove special characters, lowercase, remove extra spaces
        normalized = re.sub(r'[^a-zA-Z0-9\s]', '', title.lower())
        normalized = ' '.join(normalized.split())
        return normalized
    
    def calculate_avg_duration(self, tasks):
        """Calculate average duration of tasks"""
        durations = [t.duration for t in tasks if t.duration]
        return round(sum(durations) / len(durations), 0) if durations else None
    
    def format_time_range(self, hour):
        """Format hour into readable time range"""
        if 5 <= hour < 12:
            return "Morning (5 AM - 12 PM)"
        elif 12 <= hour < 17:
            return "Afternoon (12 PM - 5 PM)"
        elif 17 <= hour < 21:
            return "Evening (5 PM - 9 PM)"
        else:
            return "Night (9 PM - 5 AM)"
    
    def get_default_time_suggestions(self):
        """Default time suggestions when no history available"""
        return {
            'study': {
                'hour': 9,
                'time_range': 'Morning (5 AM - 12 PM)',
                'confidence': 0,
                'note': 'Default suggestion - no history yet'
            },
            'work': {
                'hour': 10,
                'time_range': 'Morning (5 AM - 12 PM)',
                'confidence': 0,
                'note': 'Default suggestion - no history yet'
            },
            'health': {
                'hour': 7,
                'time_range': 'Morning (5 AM - 12 PM)',
                'confidence': 0,
                'note': 'Default suggestion - no history yet'
            },
        }

