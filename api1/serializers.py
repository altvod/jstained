import rest_framework.serializers as serializers

import mozaic.models as models


class PaneSerializer(serializers.ModelSerializer):
    children = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = models.Pane
        fields = ('id', 'parent', 'border', 'direction', 'children', 'text', 'image')

    @classmethod
    def expand(cls, pane):
        serialized_pane = cls(pane).data
        expanded_children = []
        for child in serialized_pane['children']:
            expanded_children.append(cls.expand(cls.Meta.model.objects.get(id=child)))

        serialized_pane['children'] = expanded_children
        return serialized_pane


class SheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Sheet
        fields = ('id', 'pane', 'alias', 'title', 'description')

    @classmethod
    def expand(cls, sheet):
        pane_serializer = PaneSerializer
        serialized_sheet = cls(sheet).data
        serialized_sheet['pane'] = pane_serializer.expand(
            pane_serializer.Meta.model.objects.get(id=serialized_sheet['pane'])
        )
        return serialized_sheet
