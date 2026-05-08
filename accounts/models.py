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
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    institution = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username}"

    def get_avatar_initial(self):
        if self.user.first_name:
            return self.user.first_name[0].upper()
        return self.user.username[0].upper()

    def get_avatar_url(self):
        """Return avatar URL or None if no avatar uploaded."""
        if self.avatar and hasattr(self.avatar, 'url'):
            try:
                return self.avatar.url
            except Exception:
                return None
        return None


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create UserProfile when a new User is created."""
    if created:
        UserProfile.objects.get_or_create(user=instance)
