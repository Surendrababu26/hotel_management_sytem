from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id',
            'user',
            'name',
            'email',
            'phone',
            'address',
            'gender',
            'admission_date'
        ]
        read_only_fields = ['admission_date']

class StudentSelfUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['name', 'email', 'phone', 'address', 'gender']
