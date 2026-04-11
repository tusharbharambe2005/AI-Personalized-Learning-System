"""
DRF Serializers for the learning app.
"""
from rest_framework import serializers
from .models import Subject, Topic, ContentVersion, VideoResource


class ContentVersionSerializer(serializers.ModelSerializer):
    style_display = serializers.CharField(source='get_style_type_display', read_only=True)
    badge_color = serializers.CharField(source='get_style_badge_color', read_only=True)
    style_icon = serializers.CharField(source='get_style_icon', read_only=True)

    class Meta:
        model = ContentVersion
        fields = [
            'id', 'title', 'style_type', 'style_display', 'badge_color',
            'style_icon', 'content', 'diagram_score', 'analogy_score',
            'example_score', 'theory_score', 'logic_score', 'created_at'
        ]


class VideoResourceSerializer(serializers.ModelSerializer):
    embed_url = serializers.CharField(source='get_youtube_embed_url', read_only=True)
    thumbnail = serializers.CharField(source='get_youtube_thumbnail', read_only=True)

    class Meta:
        model = VideoResource
        fields = [
            'id', 'title', 'youtube_url', 'embed_url', 'thumbnail',
            'description', 'diagram_score', 'analogy_score',
            'example_score', 'theory_score', 'logic_score', 'created_at'
        ]


class TopicSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    content_version_count = serializers.SerializerMethodField()
    video_count = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            'id', 'title', 'slug', 'description', 'subject',
            'subject_name', 'order', 'content_version_count',
            'video_count', 'created_at'
        ]

    def get_content_version_count(self, obj):
        return obj.content_versions.count()

    def get_video_count(self, obj):
        return obj.videos.count()


class TopicDetailSerializer(serializers.ModelSerializer):
    """Full topic detail with content versions and videos."""
    content_versions = ContentVersionSerializer(many=True, read_only=True)
    videos = VideoResourceSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Topic
        fields = [
            'id', 'title', 'slug', 'description', 'subject',
            'subject_name', 'order', 'content_versions', 'videos', 'created_at'
        ]


class SubjectSerializer(serializers.ModelSerializer):
    topic_count = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'topic_count', 'created_at']

    def get_topic_count(self, obj):
        return obj.topics.count()


class SubjectDetailSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'topics', 'created_at']
