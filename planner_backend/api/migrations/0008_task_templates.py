from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_task_reminder_model'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='task_templates', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Task Template',
                'verbose_name_plural': 'Task Templates',
                'db_table': 'task_templates',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='TaskTemplateItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium', max_length=10)),
                ('category', models.CharField(choices=[('study', 'Study'), ('work', 'Work'), ('health', 'Health'), ('personal', 'Personal'), ('shopping', 'Shopping'), ('other', 'Other')], default='other', max_length=20)),
                ('start_time', models.TimeField(blank=True, null=True)),
                ('end_time', models.TimeField(blank=True, null=True)),
                ('duration', models.IntegerField(blank=True, null=True)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('template', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='api.tasktemplate')),
            ],
            options={
                'db_table': 'task_template_items',
                'ordering': ['order', 'id'],
            },
        ),
    ]
