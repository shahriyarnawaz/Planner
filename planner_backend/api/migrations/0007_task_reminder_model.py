from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_task_reminder_email_tracking'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskReminder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reminder_type', models.CharField(choices=[('day_before', '1 day before'), ('hour_before', '1 hour before'), ('minutes_15', '15 minutes before')], max_length=20)),
                ('scheduled_for', models.DateTimeField()),
                ('sent_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reminders', to='api.task')),
            ],
            options={
                'db_table': 'task_reminders',
            },
        ),
        migrations.AddConstraint(
            model_name='taskreminder',
            constraint=models.UniqueConstraint(condition=models.Q(('sent_at__isnull', True)), fields=('task', 'reminder_type'), name='uniq_unsent_task_reminder_type'),
        ),
    ]
