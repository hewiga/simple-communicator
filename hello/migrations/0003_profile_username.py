# Generated by Django 4.1 on 2022-08-14 00:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hello', '0002_profile_delete_post'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='username',
            field=models.CharField(default='asdf', max_length=50),
            preserve_default=False,
        ),
    ]
