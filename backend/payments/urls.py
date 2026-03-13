from django.urls import path
from payments.views import (
    PaymentListView,
    PaymentStatusView,
    PendingPaymentsView,
    TotalRevenueView,
    StudentPaymentView,
    AdminStudentPaymentStatusView
)

urlpatterns = [
    path('', PaymentListView.as_view(), name='payments'),
    path('status/<int:student_id>/<str:month>/<int:year>/', PaymentStatusView.as_view(), name='payment-status'),
    path('pending/<int:student_id>/', PendingPaymentsView.as_view(), name='pending-payments'),
    path('total-revenue/', TotalRevenueView.as_view(), name='total-revenue'),
    path('pay/', StudentPaymentView.as_view(), name='student-pay'),
    path('admin/student-payment-status/', AdminStudentPaymentStatusView.as_view()),
]