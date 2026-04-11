"""
DRF API views for the recommendations app.
Handles: preference profile, submit interaction, recommended topics, recommended videos.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from learning.models import ContentVersion, Topic
from .models import UserPreference, UserInteraction
from .serializers import (
    UserPreferenceSerializer,
    UserInteractionSerializer,
    SubmitInteractionSerializer,
)
from .engine import (
    get_recommended_topics,
    get_recommended_videos,
    compute_match_score,
)
from learning.serializers import TopicSerializer, VideoResourceSerializer


class UserPreferenceAPIView(APIView):
    """GET /api/preferences/ — fetch current user's preference profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(pref)
        return Response(serializer.data)


class SubmitInteractionAPIView(APIView):
    """
    POST /api/submit-interaction/
    Body: { "content_version_id": <int>, "rating": <1-5 optional> }
    Updates preference and logs the interaction.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SubmitInteractionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cv_id = serializer.validated_data['content_version_id']
        rating = serializer.validated_data.get('rating')

        content_version = get_object_or_404(ContentVersion, id=cv_id)
        topic = content_version.topic

        # Create or update interaction
        interaction, created = UserInteraction.objects.get_or_create(
            user=request.user,
            content_version=content_version,
            defaults={'topic': topic, 'rating': rating}
        )
        if not created and rating:
            interaction.rating = rating
            interaction.save()

        # Update preference profile
        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        pref.update_from_interaction(content_version, rating)

        return Response({
            'message': 'Interaction recorded successfully.',
            'preferred_style': pref.preferred_style,
            'interaction_count': pref.interaction_count,
        }, status=status.HTTP_200_OK)


class RecommendedTopicsAPIView(APIView):
    """GET /api/recommended-topics/ — get recommended topics for user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        topics = get_recommended_topics(request.user, limit=6)
        serializer = TopicSerializer(topics, many=True)
        return Response({
            'count': len(topics),
            'results': serializer.data
        })


class RecommendedVideosAPIView(APIView):
    """GET /api/recommended-videos/ — get recommended videos for user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        topic_id = request.query_params.get('topic')
        topic = None
        if topic_id:
            topic = get_object_or_404(Topic, id=topic_id)

        videos = get_recommended_videos(request.user, limit=12, topic=topic)
        serializer = VideoResourceSerializer(videos, many=True)
        return Response({
            'count': len(videos),
            'results': serializer.data
        })


class UserInteractionHistoryAPIView(APIView):
    """GET /api/interaction-history/ — list user's interaction history."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interactions = UserInteraction.objects.filter(
            user=request.user
        ).select_related('content_version', 'topic', 'topic__subject')
        serializer = UserInteractionSerializer(interactions, many=True)
        return Response({
            'count': interactions.count(),
            'results': serializer.data
        })
