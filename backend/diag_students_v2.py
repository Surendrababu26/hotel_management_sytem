import os
import django
import sys

# Add the project root to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel_backend.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Student

print("--- DIAGNOSTIC START ---")
users = User.objects.all()
students = Student.objects.all()

print(f"Total Users: {users.count()}")
print(f"Total Students: {students.count()}")

linked_user_ids = students.values_list('user_id', flat=True)
unlinked_users = users.exclude(id__in=linked_user_ids)

print(f"Unlinked Users Count: {unlinked_users.count()}")
for u in unlinked_users:
    print(f"  - Unlinked User: {u.username}")

print("\nLinked Students (Sample):")
for s in students[:10]:
    print(f"  - Student: {s.name}, Linked User: {s.user.username if s.user else 'None'}")

print("--- DIAGNOSTIC END ---")
