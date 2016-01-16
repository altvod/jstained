# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Image',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=100, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Pane',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('border', models.IntegerField(null=True)),
                ('direction', models.CharField(max_length=10, choices=[('right', 'right'), ('down', 'down'), ('left', 'left'), ('up', 'up')])),
                ('text', models.TextField(max_length=2000, blank=True, null=True)),
                ('next_pane', models.ForeignKey(to='mozaic.Pane', null=True, related_name='previous_pane')),
                ('parent', models.ForeignKey(to='mozaic.Pane', null=True, related_name='children')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Sheet',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('alias', models.SlugField(blank=True)),
                ('title', models.CharField(max_length=100, blank=True)),
                ('description', models.TextField(max_length=2000)),
                ('pane', models.ForeignKey(to='mozaic.Pane')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
