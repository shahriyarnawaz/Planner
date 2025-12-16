from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_task_completion_email_sent_task_creation_email_sent_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='reminder_email_sent',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='task',
            name='reminder_email_sent_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
