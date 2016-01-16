import json

import django.middleware.csrf
from django.shortcuts import render

import mozaic.models as models
import api1.serializers as serializers


def get_client_page(request, client_mode='remote', api_url='/api/1'):
    content = {
        'what': 'sheet',
        'sheet': serializers.SheetSerializer.expand(models.Sheet.objects.get(id=1)),
    }
    source_data = json.dumps({
        'content': content,
        'client': {
            'mode': client_mode,
            'remote': {
                'url': api_url,
                'token': django.middleware.csrf.get_token(request),
            },
        },
    })
    return render(request, 'main.html', {'source_data': source_data})
