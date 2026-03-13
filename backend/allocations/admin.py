from django.contrib import admin
from .models import Allocation

@admin.register(Allocation)
class AllocationAdmin(admin.ModelAdmin):
    list_display = ('student', 'room', 'date_allocated')
    search_fields = ('student__name', 'room__room_number')
    list_filter = ('date_allocated',)