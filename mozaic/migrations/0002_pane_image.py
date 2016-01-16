# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mozaic', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='pane',
            name='image',
            field=models.ImageField(null=True, upload_to='', verbose_name='self'),
            preserve_default=True,
        ),
    ]
