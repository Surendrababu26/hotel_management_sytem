import uuid
from django.db import models
from students.models import Student

class Payment(models.Model):

    PAYMENT_STATUS = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    )

    PAYMENT_METHOD = (
        ('UPI', 'UPI'),
        ('CARD', 'Card'),
        ('CASH', 'Cash'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.CharField(max_length=20)
    year = models.IntegerField()

    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD)

    transaction_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='PENDING')

    payment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'month', 'year')

    def __str__(self):
        return f"{self.student.name} - {self.month} {self.year}"