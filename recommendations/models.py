"""
Recommendations app models - UserPreference and UserInteraction.
These drive the recommendation engine.
"""
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserPreference(models.Model):
    """
    Stores cumulative learning style preference scores for a user.
    Updated each time the user selects a content version.
    """
    STYLE_CHOICES = [
        ('diagram', 'Diagram'),
        ('analogy', 'Analogy'),
        ('example', 'Example'),
        ('theory', 'Theory'),
        ('logic', 'Logic'),
        ('balanced', 'Balanced'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preference')

    # Cumulative preference scores (sum of all selected content scores)
    diagram_preference = models.FloatField(default=0.0)
    analogy_preference = models.FloatField(default=0.0)
    example_preference = models.FloatField(default=0.0)
    theory_preference = models.FloatField(default=0.0)
    logic_preference = models.FloatField(default=0.0)

    # Total interactions used to compute preferences
    interaction_count = models.PositiveIntegerField(default=0)

    # The computed dominant learning style
    preferred_style = models.CharField(
        max_length=20, choices=STYLE_CHOICES, default='balanced'
    )

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Preferred: {self.preferred_style}"

    def recalculate_preferred_style(self):
        """Recalculate and save the dominant preferred style."""
        scores = {
            'diagram': self.diagram_preference,
            'analogy': self.analogy_preference,
            'example': self.example_preference,
            'theory': self.theory_preference,
            'logic': self.logic_preference,
        }
        total = sum(scores.values())
        if total == 0:
            self.preferred_style = 'balanced'
        else:
            self.preferred_style = max(scores, key=scores.get)
        self.save(update_fields=['preferred_style', 'updated_at'])

    def get_normalized_scores(self):
        """Return preference scores normalized to percentages."""
        total = (self.diagram_preference + self.analogy_preference +
                 self.example_preference + self.theory_preference + self.logic_preference)
        if total == 0:
            return {k: 20.0 for k in ['diagram', 'analogy', 'example', 'theory', 'logic']}
        return {
            'diagram': round((self.diagram_preference / total) * 100, 1),
            'analogy': round((self.analogy_preference / total) * 100, 1),
            'example': round((self.example_preference / total) * 100, 1),
            'theory': round((self.theory_preference / total) * 100, 1),
            'logic': round((self.logic_preference / total) * 100, 1),
        }

    def update_from_interaction(self, content_version, rating=None):
        """
        Update preference scores based on a selected content version.
        Uses the content version's style scores as weights.
        rating: 1-5 multiplier (optional), defaults to 1.0
        """
        multiplier = (rating / 5.0) if rating else 1.0

        self.diagram_preference += content_version.diagram_score * multiplier
        self.analogy_preference += content_version.analogy_score * multiplier
        self.example_preference += content_version.example_score * multiplier
        self.theory_preference += content_version.theory_score * multiplier
        self.logic_preference += content_version.logic_score * multiplier
        self.interaction_count += 1

        self.save(update_fields=[
            'diagram_preference', 'analogy_preference', 'example_preference',
            'theory_preference', 'logic_preference', 'interaction_count', 'updated_at'
        ])
        self.recalculate_preferred_style()

    def get_style_badge_color(self):
        color_map = {
            'diagram': 'info',
            'analogy': 'warning',
            'example': 'success',
            'theory': 'primary',
            'logic': 'danger',
            'balanced': 'secondary',
        }
        return color_map.get(self.preferred_style, 'secondary')


class UserInteraction(models.Model):
    """
    Records each time a user selects a content version as helpful.
    This is the core interaction log for the recommendation engine.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    content_version = models.ForeignKey(
        'learning.ContentVersion', on_delete=models.CASCADE, related_name='interactions'
    )
    topic = models.ForeignKey(
        'learning.Topic', on_delete=models.CASCADE, related_name='user_interactions'
    )
    rating = models.PositiveIntegerField(
        null=True, blank=True, help_text='Optional 1-5 rating from user'
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        # Allow multiple interactions with different content versions for same topic
        unique_together = ('user', 'content_version')

    def __str__(self):
        return f"{self.user.username} → {self.content_version} (rating: {self.rating})"


@receiver(post_save, sender=User)
def create_user_preference(sender, instance, created, **kwargs):
    """Auto-create UserPreference when a new User is created."""
    if created:
        UserPreference.objects.get_or_create(user=instance)
