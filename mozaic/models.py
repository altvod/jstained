import os

from django.conf import settings
from django.db import models


# Create your models here.

class Image(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100, blank=True)


class Pane(models.Model):
    id = models.AutoField(primary_key=True)
    parent = models.ForeignKey('self', null=True, related_name='children')
    border = models.IntegerField(null=True)
    next_pane = models.ForeignKey('self', null=True, related_name='previous_pane')
    direction = models.CharField(max_length=10, choices=(
        ('right', 'right'),
        ('down', 'down'),
        ('left', 'left'),
        ('up', 'up'),
    ))
    text = models.TextField(max_length=2000, blank=True, null=True)
#    image = models.ImageField(upload_to=os.path.join(settings.MEDIA_ROOT, 'paneimg'), null=True)
    image = models.ImageField(upload_to='paneimg', null=True)

    def rotate(self, rotateDir=1):
        dirs = ['up', 'right', 'down', 'left']
        self.direction = dirs[(dirs.index(self.direction) + rotateDir) % len(dirs)]
        self.save()
        for child in self.children.all():
            child.rotate(rotateDir)

    def __str__(self):
        return 'pane {0}'.format(self.id)


class Sheet(models.Model):
    id = models.AutoField(primary_key=True)
    pane = models.ForeignKey(Pane, null=False)
    alias = models.SlugField(max_length=50, blank=True)
    title = models.CharField(max_length=100, blank=True)
    description = models.TextField(max_length=2000)

#    class Meta:
#        unique_together = (('id', 'alias'),)

    def __str__(self):
        'sheet {0}'.format(self.id)
