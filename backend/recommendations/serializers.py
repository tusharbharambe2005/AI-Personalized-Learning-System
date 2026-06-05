"""
DRF Serializers for recommendations app.
"""
from rest_framework import serializers
from .models import UserPreference, UserInteraction
from learning.serializers import ContentVersionSerializer, VideoResourceSerializer


class UserPreferenceSerializer(serializers.ModelSerializer):
    normalized_scores = serializers.SerializerMethodField()
    badge_color = serializers.CharField(source='get_style_badge_color', read_only=True)
    # Normalized score fields for the React radar chart / bars
    diagram_score = serializers.SerializerMethodField()
    analogy_score = serializers.SerializerMethodField()
    example_score = serializers.SerializerMethodField()
    theory_score  = serializers.SerializerMethodField()
    logic_score   = serializers.SerializerMethodField()

    class Meta:
        model = UserPreference
        fields = [
            'id', 'preferred_style', 'diagram_preference', 'analogy_preference',
            'example_preference', 'theory_preference', 'logic_preference',
            'interaction_count', 'normalized_scores', 'badge_color',
            'diagram_score', 'analogy_score', 'example_score', 'theory_score', 'logic_score',
            'updated_at'
        ]

    def get_normalized_scores(self, obj):
        return obj.get_normalized_scores()

    def _ns(self, obj):
        return obj.get_normalized_scores()

    def get_diagram_score(self, obj): return round(self._ns(obj).get('diagram', 0))
    def get_analogy_score(self, obj): return round(self._ns(obj).get('analogy', 0))
    def get_example_score(self, obj): return round(self._ns(obj).get('example', 0))
    def get_theory_score(self, obj):  return round(self._ns(obj).get('theory',  0))
    def get_logic_score(self, obj):   return round(self._ns(obj).get('logic',   0))


class UserInteractionSerializer(serializers.ModelSerializer):
    content_version_detail = ContentVersionSerializer(source='content_version', read_only=True)
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    subject_name = serializers.CharField(source='topic.subject.name', read_only=True)
    subject_slug = serializers.CharField(source='topic.subject.slug', read_only=True)
    topic_slug = serializers.CharField(source='topic.slug', read_only=True)
    # Flat convenience fields for React table
    style_type = serializers.CharField(source='content_version.style_type', read_only=True)
    content_version_title = serializers.CharField(source='content_version.title', read_only=True)

    class Meta:
        model = UserInteraction
        fields = [
            'id', 'content_version', 'content_version_detail', 'topic',
            'topic_title', 'subject_name', 'subject_slug', 'topic_slug',
            'style_type', 'content_version_title',
            'rating', 'skipped', 'timestamp'
        ]
        read_only_fields = ['timestamp']


class SubmitInteractionSerializer(serializers.Serializer):
    """Serializer for submitting a content version selection (rate or skip)."""
    content_version_id = serializers.IntegerField()
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False, allow_null=True)
    skipped = serializers.BooleanField(required=False, default=False)


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
