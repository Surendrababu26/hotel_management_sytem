from rest_framework import serializers
from payments.models import Payment

class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['status', 'transaction_id', 'payment_date', 'student']

    def validate(self, data):
        request = self.context.get('request')
        month = data.get('month', '').strip().capitalize()
        year = data.get('year')
        data['month'] = month  # normalize casing always

        # For student payments
        if hasattr(request.user, 'student_profile'):
            student = request.user.student_profile
            # Only block if a PAID payment already exists (FAILED = allow retry)
            if Payment.objects.filter(student=student, month=month, year=year, status='PAID').exists():
                raise serializers.ValidationError(
                    f"You have already paid for {month} {year}."
                )

        # For admin payments
        else:
            student_id = request.data.get('student')
            if student_id and Payment.objects.filter(
                student_id=student_id, month=month, year=year, status='PAID'
            ).exists():
                raise serializers.ValidationError(
                    f"This student has already paid for {month} {year}."
                )

        return data

    def create(self, validated_data):
        return super().create(validated_data)