from rest_framework import generics ,status 
from rest_framework.permissions import IsAuthenticated
from .models import Allocation
from .serializers import AllocationSerializer
from rest_framework.response import Response
from .permissions import IsAdminUser
from .serializers import AllocationSerializer

class AllocationListCreateView(generics.ListCreateAPIView):
    queryset = Allocation.objects.all()
    serializer_class = AllocationSerializer
    permission_classes = [IsAdminUser]

class AllocationRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Allocation.objects.all()
    serializer_class = AllocationSerializer
    permission_classes = [IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Room deleted successfully"}, 
            status=status.HTTP_200_OK # Changed from 204 to 200 to return body
        )

class MyAllocationView(generics.ListAPIView):
    """
    Allows a student to see only their own room allocation
    """
    serializer_class = AllocationSerializer

    def get_queryset(self):
        # Only allocations for the logged-in student
        return Allocation.objects.filter(student=self.request.user.student_profile)
