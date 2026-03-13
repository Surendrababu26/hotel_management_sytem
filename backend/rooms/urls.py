from django.urls import path
from .views import RoomListCreateView, RoomRetrieveUpdateDestroyView

urlpatterns = [
    path('', RoomListCreateView.as_view(), name='room-list-create'),
    path('<int:pk>/', RoomRetrieveUpdateDestroyView.as_view(), name='room-detail'),
]
