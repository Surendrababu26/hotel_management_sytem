from rest_framework import generics
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .models import Student
from .serializers import StudentSerializer,StudentSelfUpdateSerializer
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer


# =========================
# ADMIN VIEWS
# =========================

class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAdminUser]


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAdminUser]


# =========================
# STUDENT VIEW (Own Profile)
# =========================

class MyStudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.student_profile
        except Student.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Student profile not found. Please contact admin to link your account.")
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StudentSelfUpdateSerializer  # only phone and email
        return StudentSerializer  # full profile on GET


# Serializer for showing user info
class AdminUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# View to get all users without a student profile
class AdminUnlinkedUsersView(generics.ListAPIView):
    """
    GET /api/users/ → Admin only
    Returns all users who do not yet have a Student profile
    """
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        # Exclude users who already have a Student profile
        return User.objects.filter(student_profile__isnull=True)



