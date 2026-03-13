from rest_framework import serializers
from .models import Allocation
from rooms.models import Room

class AllocationSerializer(serializers.ModelSerializer):
    room = serializers.SlugRelatedField(
        queryset=Room.objects.all(),
        slug_field='room_number'  # look up by room_number
    )

    class Meta:
        model = Allocation
        fields = ['id','student', 'room', 'date_allocated']