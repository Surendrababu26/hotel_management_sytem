from django.urls import path
from .views import (
    StudentListCreateView,
    StudentDetailView,
    MyStudentProfileView,AdminUnlinkedUsersView
)

urlpatterns = [

    path('users/', AdminUnlinkedUsersView.as_view(), name='admin-unlinked-users'),
    path('me/', MyStudentProfileView.as_view(), name='my-student-profile'),
    path('', StudentListCreateView.as_view(), name='student-list-create'),
    path('<int:pk>/', StudentDetailView.as_view(), name='student-detail'),
]
