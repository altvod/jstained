from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings
admin.autodiscover()

from api1.routing import api_router as api1_router

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'jstained.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api/1/', include(api1_router.urls)),

    url(r'^console/?$', 'client.views.get_client_page'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
