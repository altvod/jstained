from rest_framework_extensions import routers

import api1.views as views


# Routers provide an easy way of automatically determining the URL conf.

api_router = routers.ExtendedSimpleRouter()
panes_router = api_router.register(r'panes', views.PaneViewSet, base_name='pane')
sheets_router = api_router.register(r'sheets', views.SheetViewSet, base_name='sheet')
