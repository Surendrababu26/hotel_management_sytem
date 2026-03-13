import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel_backend.settings')
django.setup()

from students.models import Student
from django.contrib.auth.models import User
from students.serializers import StudentSerializer

print('---Checking User IDs in Dropdown---')
dropdown_ids = [2, 3, 4, 9, 10, 12, 14, 17, 18, 21, 22, 26, 29, 30]
for uid in dropdown_ids:
    try:
        u = User.objects.get(id=uid)
        has_profile = hasattr(u, 'student_profile')
        print(f'ID: {uid}, User: {u.username}, IsStaff: {u.is_staff}, HasProfile: {has_profile}')
    except User.DoesNotExist:
        print(f'ID: {uid} Not found')

print('\n---Attempting Manual Creation for USER 2 (sai)---')
data = {
    'user': 2,
    'name': 'Sai Test',
    'email': 'sai@gmail.com',
    'phone': '1234567890',
    'address': 'Test Address',
    'gender': 'Male'
}
serializer = StudentSerializer(data=data)
if serializer.is_valid():
    print('Serializer is VALID')
    try:
        serializer.save()
        print('SUCCESS: Student created')
    except Exception as e:
        print(f'ERROR during save: {e}')
else:
    print(f'SERIALIZER ERRORS: {serializer.errors}')
