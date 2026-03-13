import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel_backend.settings')
django.setup()

from students.models import Student
from django.contrib.auth.models import User

with open('diag_utf8.txt', 'w', encoding='utf-8') as f:
    f.write('---Students---\n')
    for s in Student.objects.all():
        f.write(f'ID: {s.id}, Name: {s.name}, Email: {s.email}, UserID: {s.user.id}\n')

    f.write('---Unlinked Users---\n')
    for u in User.objects.filter(student_profile__isnull=True):
        f.write(f'ID: {u.id}, Username: {u.username}, Email: {u.email}\n')
