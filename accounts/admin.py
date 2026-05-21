"""
Accounts app admin.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'


class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline]


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_pro', 'pro_requested', 'pro_request_at', 'pro_coupon_used', 'pro_approved_at']
    list_filter = ['is_pro', 'pro_requested']
    search_fields = ['user__username', 'user__email', 'institution']
    actions = ['approve_pro_requests']

    def approve_pro_requests(self, request, queryset):
        from django.utils import timezone
        updated = 0
        for profile in queryset.filter(pro_requested=True, is_pro=False):
            profile.is_pro = True
            profile.pro_approved_at = timezone.now()
            profile.save()
            updated += 1
        self.message_user(request, f"✅ {updated} student(s) approved as Pro.")
    approve_pro_requests.short_description = "Approve selected Pro upgrade requests"
