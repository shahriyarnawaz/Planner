from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_templatecategory'),
    ]

    operations = [
        migrations.AddField(
            model_name='tasktemplateitem',
            name='task_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
