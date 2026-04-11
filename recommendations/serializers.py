"""
DRF Serializers for recommendations app.
"""
from rest_framework import serializers
from .models import UserPreference, UserInteraction
from learning.serializers import ContentVersionSerializer, VideoResourceSerializer


class UserPreferenceSerializer(serializers.ModelSerializer):
    normalized_scores = serializers.SerializerMethodField()
    badge_color = serializers.CharField(source='get_style_badge_color', read_only=True)

    class Meta:
        model = UserPreference
        fields = [
            'id', 'preferred_style', 'diagram_preference', 'analogy_preference',
            'example_preference', 'theory_preference', 'logic_preference',
            'interaction_count', 'normalized_scores', 'badge_color', 'updated_at'
        ]

    def get_normalized_scores(self, obj):
        return obj.get_normalized_scores()


class UserInteractionSerializer(serializers.ModelSerializer):
    content_version_detail = ContentVersionSerializer(source='content_version', read_only=True)
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    subject_name = serializers.CharField(source='topic.subject.name', read_only=True)

    class Meta:
        model = UserInteraction
        fields = [
            'id', 'content_version', 'content_version_detail', 'topic',
            'topic_title', 'subject_name', 'rating', 'timestamp'
        ]
        read_only_fields = ['timestamp']


class SubmitInteractionSerializer(serializers.Serializer):
    """Serializer for submitting a content version selection."""
    content_version_id = serializers.IntegerField()
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False, allow_null=True)


class RecommendedContentSerializer(serializers.Serializer):
    """Serializer for recommended content with match score."""
    id = serializers.IntegerField()
    title = serializers.CharField()
    style_type = serializers.CharField()
    style_display = serializers.CharField()
    badge_color = serializers.CharField()
    style_icon = serializers.CharField()
    content = serializers.CharField()
    match_score = serializers.FloatField()
    topic_id = serializers.IntegerField()
    topic_title = serializers.CharField()


class RecommendedVideoSerializer(serializers.Serializer):
    """Serializer for recommended videos with match score."""
    id = serializers.IntegerField()
    title = serializers.CharField()
    youtube_url = serializers.CharField()
    embed_url = serializers.CharField()
    thumbnail = serializers.CharField()
    description = serializers.CharField()
    match_score = serializers.FloatField()
    topic_id = serializers.IntegerField()
    topic_title = serializers.CharField()
