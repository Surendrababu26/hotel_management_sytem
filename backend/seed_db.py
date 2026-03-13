import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel_backend.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Student
from rooms.models import Room
from allocations.models import Allocation

def seed():
    # Create superuser
    admin, created = User.objects.get_or_create(username='admin', defaults={'email': 'admin@example.com'})
    if created:
        admin.set_password('admin123')
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        print("Created admin user (admin / admin123)")

    demo_u1, c1 = User.objects.get_or_create(username='john', defaults={'email': 'john@example.com'})
    if c1:
        demo_u1.set_password('pass123')
        demo_u1.save()

    demo_u2, c2 = User.objects.get_or_create(username='jane', defaults={'email': 'jane@example.com'})
    if c2:
        demo_u2.set_password('pass123')
        demo_u2.save()

    demo_u3, c3 = User.objects.get_or_create(username='bob', defaults={'email': 'bob@example.com'})
    if c3:
        demo_u3.set_password('pass123')
        demo_u3.save()
        
    # Create Rooms
    r1, _ = Room.objects.get_or_create(room_number='101', defaults={'room_type': 'single', 'capacity': 1, 'available': True})
    r2, _ = Room.objects.get_or_create(room_number='102', defaults={'room_type': 'double', 'capacity': 2, 'available': True})
    r3, _ = Room.objects.get_or_create(room_number='103', defaults={'room_type': 'triple', 'capacity': 3, 'available': True})

    # Create Students
    s1, s_c1 = Student.objects.get_or_create(
        user=demo_u1,
        defaults={
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '1234567890',
            'address': '123 Main St',
            'gender': 'Male'
        }
    )
    s2, s_c2 = Student.objects.get_or_create(
        user=demo_u2,
        defaults={
            'name': 'Jane Doe',
            'email': 'jane@example.com',
            'phone': '0987654321',
            'address': '456 Elm St',
            'gender': 'Female'
        }
    )
    
    # Create Allocations
    if s_c1:
        Allocation.objects.get_or_create(student=s1, room=r1)
        r1.available = False
        r1.save()

    # Bob will remain unlinked so we can test the unlinked user dropdown

    print("Sample data populated successfully. Test users: admin/admin123 | john/pass123 | jane/pass123 | bob/pass123")

if __name__ == '__main__':
    seed()
