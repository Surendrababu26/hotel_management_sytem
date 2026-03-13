from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/students/', include('students.urls')), 
    path('api/rooms/', include('rooms.urls')), 
    path('api/allocations/', include('allocations.urls')),
    path('api/payments/', include('payments.urls')),
]