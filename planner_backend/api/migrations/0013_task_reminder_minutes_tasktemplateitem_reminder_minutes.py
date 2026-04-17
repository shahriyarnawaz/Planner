import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_userprofile_email_notifications_enabled_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='reminder_minutes',
            field=models.IntegerField(
                blank=True,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(1440),
                ],
                help_text='Minutes before task start for reminder preference; null uses account default.',
            ),
        ),
        migrations.AddField(
            model_name='tasktemplateitem',
            name='reminder_minutes',
            field=models.IntegerField(
                blank=True,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(1440),
                ],
                help_text='Minutes before task start when applying this template; null uses account default.',
            ),
        ),
    ]
