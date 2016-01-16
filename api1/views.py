from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_extensions.mixins import NestedViewSetMixin
from rest_framework.decorators import detail_route


import mozaic.models as models
import api1.serializers as serializers


class ExpandableViewSet(NestedViewSetMixin, ModelViewSet):
    @detail_route(methods=['get', 'put'])
    def expanded(self, request, pk):
        """Returns an expanded version of the pane"""
        if request.method.lower() == 'put':
            self.update(request, pk)

        obj = self.queryset.get(id=pk)
        return Response(self.serializer_class.expand(obj))


class PaneViewSet(ExpandableViewSet):
    queryset = models.Pane.objects.all()
    serializer_class = serializers.PaneSerializer

    def _split(self, request, pk, orientation):
        original_pane = self.queryset.get(id=pk)
        new_parent = models.Pane(parent=original_pane.parent, direction=orientation)
        new_parent.save()
        original_pane.parent = new_parent
        original_pane.save()
        new_sibling = models.Pane(parent=new_parent, direction=orientation)
        new_sibling.save()
        return Response(self.serializer_class.expand(new_parent))

    @detail_route(methods=['post'])
    def hsplit(self, request, pk):
        """"""
        return self._split(request, pk, 'right')

    @detail_route(methods=['post'])
    def vsplit(self, request, pk):
        """"""
        return self._split(request, pk, 'down')

    @detail_route(methods=['put'])
    def rotatecw(self, request, pk):
        """Rotate pane clockwise"""
        pane = self.queryset.get(id=pk)
        pane.rotate(1)
        return Response(self.serializer_class.expand(pane))

    @detail_route(methods=['put'])
    def rotateccw(self, request, pk):
        """Rotate pane counterclockwise"""
        pane = self.queryset.get(id=pk)
        pane.rotate(-1)
        return Response(self.serializer_class.expand(pane))

    @detail_route(methods=['put'])
    def image(self, request, pk):
        """"""
        image_file = request.FILES['image']
        pane = self.queryset.get(id=pk)
        pane.image = image_file
        pane.save()
        return Response(self.serializer_class(pane).data)



class SheetViewSet(ExpandableViewSet):
    queryset = models.Sheet.objects.all()
    serializer_class = serializers.SheetSerializer


