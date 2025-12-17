from rest_framework import serializers

from api.models import TaskTemplate, TaskTemplateItem


class TaskTemplateItemSerializer(serializers.ModelSerializer):
    start_time = serializers.TimeField(required=False, input_formats=['%H:%M:%S', '%H:%M', '%I:%M %p', '%I:%M:%S %p'])
    end_time = serializers.TimeField(required=False, input_formats=['%H:%M:%S', '%H:%M', '%I:%M %p', '%I:%M:%S %p'])

    class Meta:
        model = TaskTemplateItem
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'category',
            'start_time',
            'end_time',
            'duration',
            'order',
        ]
        read_only_fields = ['id']


class TaskTemplateSerializer(serializers.ModelSerializer):
    items = TaskTemplateItemSerializer(many=True)

    class Meta:
        model = TaskTemplate
        fields = [
            'id',
            'name',
            'description',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        template = TaskTemplate.objects.create(**validated_data)
        items_to_create = []
        for idx, item in enumerate(items_data):
            if 'order' not in item:
                item['order'] = idx
            items_to_create.append(TaskTemplateItem(template=template, **item))
        if items_to_create:
            TaskTemplateItem.objects.bulk_create(items_to_create)
        return template

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            items_to_create = []
            for idx, item in enumerate(items_data):
                if 'order' not in item:
                    item['order'] = idx
                items_to_create.append(TaskTemplateItem(template=instance, **item))
            if items_to_create:
                TaskTemplateItem.objects.bulk_create(items_to_create)

        return instance
