from django.urls import path
from .views import AllocationListCreateView, AllocationRetrieveUpdateDestroyView,MyAllocationView


urlpatterns = [
    # List all allocations and create new allocation
    path('', AllocationListCreateView.as_view(), name='allocation-list-create'),

    # Retrieve, update, delete a specific allocation
    path('<int:pk>/', AllocationRetrieveUpdateDestroyView.as_view(), name='allocation-detail'),


    # Student route
    path('my/', MyAllocationView.as_view(), name='my-allocation'),
]