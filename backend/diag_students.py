from django.contrib.auth.models import User
from students.models import Student
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel_backend.settings')
django.setup()

u_count = User.objects.count()
s_count = Student.objects.count()
unlinked = list(User.objects.filter(student_profile__isnull=True).values_list('username', flat=True))

print(f'Users: {u_count}')
print(f'Students: {s_count}')
print(f'Unlinked Users: {unlinked}')

for s in Student.objects.all()[:5]:
    print(f'Student: {s.name}, User: {s.user.username if s.user else "None"}')
