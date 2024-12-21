# Generated by Django 5.1.4 on 2024-12-20 19:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('medtech', '0002_alter_prescription_options_remove_patient_sleep_time_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='name',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='prescribeddrug',
            name='amt_remaining',
            field=models.FloatField(default=0, editable=False),
        ),
        migrations.AlterField(
            model_name='prescription',
            name='notes',
            field=models.TextField(blank=True, null=True),
        ),
    ]