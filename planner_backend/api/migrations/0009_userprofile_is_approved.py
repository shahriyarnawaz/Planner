from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_task_templates'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_approved',
            field=models.BooleanField(default=False),
        ),
    ]
