import os
import django
import sys
from django.test import RequestFactory
from django.contrib.auth.models import User
from rest_framework import status

# Add the project root to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel_backend.settings')
django.setup()

from students.models import Student
from payments.views import StudentPaymentView
from payments.models import Payment

def test_admin_payment():
    print("--- ADMIN PAYMENT TEST START ---")
    
    # 1. Get or create an admin
    admin = User.objects.filter(is_staff=True).first()
    if not admin:
        admin = User.objects.create_superuser('admin_test', 'admin@test.com', 'pass')
    
    # 2. Get a student
    student = Student.objects.first()
    if not student:
        print("No student found to test with.")
        return

    # 3. Prepare request data
    # Use a month that is likely not paid to avoid validation error
    test_month = "December"
    test_year = 2029
    
    # Clean up any existing test payment
    Payment.objects.filter(student=student, month=test_month, year=test_year).delete()

    data = {
        "student": student.id,
        "month": test_month,
        "year": test_year,
        "amount": 5500.00,
        "payment_method": "CASH"
    }

    # 4. Mock request
    factory = RequestFactory()
    request = factory.post('/api/payments/pay/', data, content_type='application/json')
    request.user = admin

    # 5. Call view
    view = StudentPaymentView.as_view()
    try:
        response = view(request)
        print(f"Response Status: {response.status_code}")
        if response.status_code == status.HTTP_201_CREATED:
            print("SUCCESS: Admin recorded payment successfully.")
            # Verify in DB
            payment = Payment.objects.filter(student=student, month=test_month, year=test_year).first()
            if payment:
                print(f"Verified in DB: Payment for {payment.student.name}, Amount: {payment.amount}")
            else:
                print("ERROR: Payment not found in database despite success response.")
        else:
            print(f"FAILURE: {response.data}")
    except Exception as e:
        print(f"EXCEPTION: {str(e)}")

    print("--- ADMIN PAYMENT TEST END ---")

if __name__ == "__main__":
    test_admin_payment()
