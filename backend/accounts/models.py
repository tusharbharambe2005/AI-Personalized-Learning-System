"""
Accounts app models - UserProfile (lightweight extension).
UserPreference and UserInteraction live in the recommendations app.
"""
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Extended profile for regular users."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    avatar_initial = models.CharField(max_length=2, blank=True)  # For generated avatar
    avatar = models.URLField(max_length=500, blank=True)  # Cloudinary URL
    institution = models.CharField(max_length=200, blank=True)
    
    # Pro upgrade fields
    is_pro = models.BooleanField(default=False)
    pro_requested = models.BooleanField(default=False)       # True after coupon submitted
    pro_request_at = models.DateTimeField(null=True, blank=True)  # When student submitted
    pro_approved_at = models.DateTimeField(null=True, blank=True) # When admin approved
    pro_coupon_used = models.CharField(max_length=50, blank=True) # Store coupon used
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username}"

    def get_avatar_initial(self):
        if self.user.first_name:
            return self.user.first_name[0].upper()
        return self.user.username[0].upper()

    def get_avatar_url(self):
        """Return Cloudinary avatar URL or None."""
        return self.avatar if self.avatar else None


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create UserProfile when a new User is created."""
    if created:
        UserProfile.objects.get_or_create(user=instance)
