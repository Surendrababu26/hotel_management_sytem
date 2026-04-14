from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Sum
from django.core.mail import send_mail
from django.contrib.auth.models import User
from datetime import datetime

from payments.models import Payment
from students.models import Student
from payments.serializers import PaymentSerializer

# List of all months
ALL_MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
]

# ---------------------------
# Admin & Student: List/Create Payments
# ---------------------------
class PaymentListView(generics.ListCreateAPIView):
    queryset = Payment.objects.all().order_by('-payment_date')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Determine student: use student_profile if student, or ID from body if Admin
        if not self.request.user.is_staff and hasattr(self.request.user, 'student_profile'):
            student = self.request.user.student_profile
        else:
            student_id = self.request.data.get('student')
            if not student_id:
                raise PermissionDenied("Student ID is required for Admin to create payment.")
            from students.models import Student
            student = Student.objects.get(id=student_id)
        
        serializer.save(student=student, status='PAID')


# ---------------------------
# Check Payment Status
# ---------------------------
class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id, month, year):
        # Security: Students can only see their own status, Admins can see any
        if not request.user.is_staff and hasattr(request.user, 'student_profile'):
            if request.user.student_profile.id != student_id:
                raise PermissionDenied("You cannot access other students' payment status.")

        payment = Payment.objects.filter(
            student_id=student_id,
            month=month,
            year=year
        ).first()

        status = payment.status if payment else "NOT PAID"

        return Response({
            "student_id": student_id,
            "month": month,
            "year": year,
            "status": status
        })


# ---------------------------
# Pending Payments
# ---------------------------
class PendingPaymentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        # Security: Students can only see their own pending months, Admins can see any
        if not request.user.is_staff and hasattr(request.user, 'student_profile'):
            if request.user.student_profile.id != student_id:
                raise PermissionDenied("You cannot access other students' pending months.")

        paid_months = Payment.objects.filter(
            student_id=student_id,
            status='PAID'
        ).values_list('month', flat=True)

        pending_months = [month for month in ALL_MONTHS if month not in paid_months]

        return Response({
            "student_id": student_id,
            "pending_months": pending_months
        })


# ---------------------------
# Total Revenue collected (Admin Only)
# ---------------------------
class TotalRevenueView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total = Payment.objects.filter(status='PAID').aggregate(total_amount=Sum('amount'))
        return Response({
            "total_revenue": float(total['total_amount'] or 0)
        })


# ---------------------------
# Student Payment with Email Notification
# ---------------------------


class StudentPaymentView(generics.CreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Determine student early to perform cleanup
        if hasattr(request.user, 'student_profile'):
            student = request.user.student_profile
        elif request.user.is_staff:
            student_id = request.data.get('student')
            if not student_id:
                 return Response({"student": ["Student ID required"]}, status=400)
            student = Student.objects.get(id=student_id)
        else:
            return Response({"detail": "Not authorized"}, status=403)

        # Cleanup FAILED payments BEFORE validation
        month = request.data.get('month', '').strip().capitalize()
        year = request.data.get('year')
        if month and year:
            Payment.objects.filter(student=student, month=month, year=year, status='FAILED').delete()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

    def perform_create(self, serializer):
        # We handle student determination in create() to allow cleanup, 
        # so we fetch it again or pass it here. 
        if hasattr(self.request.user, 'student_profile'):
            student = self.request.user.student_profile
        else:
            student = Student.objects.get(id=self.request.data.get('student'))

        payment_status = self.request.data.get('status', 'PAID')
        payment = serializer.save(student=student, status=payment_status)

        if payment_status == 'FAILED':
            return

        # Rest of the logic (emails etc)
        paid_months = list(Payment.objects.filter(student=student, status='PAID')
                           .values_list('month', flat=True))
        paid_lower = [m.lower() for m in paid_months]
        unpaid_months = [m for m in ALL_MONTHS if m.lower() not in paid_lower]
        # ... (rest of method follows)

        #  Calculate paid and unpaid months for this student
        paid_months = list(Payment.objects.filter(student=student, status='PAID')
                           .values_list('month', flat=True))

        # Normalize for comparison to avoid duplicates
        paid_lower = [m.lower() for m in paid_months]
        unpaid_months = [m for m in ALL_MONTHS if m.lower() not in paid_lower]

        #  Prepare message (same for student and admin)
        message = f"Dear {student.name},\n\n" \
                  f"Your payment of ₹{payment.amount} for {payment.month} {payment.year} has been received.\n\n" \
                  f"Paid months: {', '.join(paid_months)}\n" \
                  f"Pending months: {', '.join(unpaid_months) if unpaid_months else 'None'}\n\n" \
                  f"Thank you."

        #  Send email to student
        send_mail(
            subject=f"Payment Confirmation - {payment.month} {payment.year}",
            message=message,
            from_email=None,  # Uses DEFAULT_FROM_EMAIL
            recipient_list=[student.email],
            fail_silently=False
        )

        #  Send email to admin (only for this student)
        admins = User.objects.filter(is_superuser=True)
        for admin in admins:
            admin_message = f"Payment Update for {student.name} ({student.email}):\n\n" \
                            f"Paid months: {', '.join(paid_months)}\n" \
                            f"Pending months: {', '.join(unpaid_months) if unpaid_months else 'None'}\n\n" \
                            f"Latest Payment: ₹{payment.amount} for {payment.month} {payment.year}"

            send_mail(
                subject=f"Payment Update - {student.name}",
                message=admin_message,
                from_email=None,
                recipient_list=[admin.email],
                fail_silently=False
            )


# ---------------------------
# Admin Dashboard - All Students Payment Status
# ---------------------------
class AdminStudentPaymentStatusView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):

        students = Student.objects.all()
        result = []

        for student in students:

            paid_months = list(
                Payment.objects.filter(student=student, status='PAID')
                .values_list('month', flat=True)
            )

            paid_lower = [m.lower() for m in paid_months]

            unpaid_months = [
                month for month in ALL_MONTHS
                if month.lower() not in paid_lower
            ]

            status = "PAID" if not unpaid_months else "PARTIAL"

            result.append({
                "student_id": student.id,
                "student_name": student.name,
                "email": student.email,
                "paid_months": paid_months,
                "unpaid_months": unpaid_months,
                "status": status
            })

        return Response(result)