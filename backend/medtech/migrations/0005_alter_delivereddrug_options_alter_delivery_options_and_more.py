# Generated by Django 5.1.4 on 2024-12-22 08:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('medtech', '0004_alter_prescribeddrug_custom_qty_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='delivereddrug',
            options={'verbose_name': 'Order Item', 'verbose_name_plural': 'Order Items'},
        ),
        migrations.AlterModelOptions(
            name='delivery',
            options={'verbose_name': 'Order', 'verbose_name_plural': 'Orders'},
        ),
        migrations.AddField(
            model_name='delivery',
            name='status',
            field=models.CharField(choices=[('open', 'Order Recieved'), ('out_for_delivery', 'Out for delivery'), ('delivered', 'Delivered')], default='open', max_length=20),
        ),
        migrations.AlterField(
            model_name='delivereddrug',
            name='delivery',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='all_drugs', to='medtech.delivery'),
        ),
    ]
