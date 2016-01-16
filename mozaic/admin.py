from django.contrib.gis import admin

import mozaic.models as models


admin.site.register(models.Pane, admin.ModelAdmin)
admin.site.register(models.Sheet, admin.ModelAdmin)
