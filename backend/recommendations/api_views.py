"""
DRF API views for the recommendations app.
Handles: preference profile, submit interaction, recommended topics, recommended videos,
         next-content (sequential delivery).
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
    get_next_content_for_topic,
)
from learning.serializers import TopicSerializer, VideoResourceSerializer, ContentVersionSerializer


def _serialize_content_version(cv):
    """Serialize a ContentVersion into a dict for JSON response."""
    return {
        'id': cv.id,
        'title': cv.title,
        'style_type': cv.style_type,
        'style_display': cv.get_style_type_display(),
        'badge_color': cv.get_style_badge_color(),
        'style_icon': cv.get_style_icon(),
        'content': cv.content,
    }


class UserPreferenceAPIView(APIView):
    """GET /api/preferences/ — fetch current user's preference profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(pref)
        return Response(serializer.data)


class NextContentAPIView(APIView):
    """
    GET /api/next-content/<topic_id>/
    Returns the next unseen ContentVersion for the user on this topic,
    based on their preference priority order.
    Returns {"exhausted": true} if all 5 styles have been seen/skipped.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)
        cv = get_next_content_for_topic(request.user, topic)
        if cv is None:
            return Response({'exhausted': True})
        return Response(_serialize_content_version(cv))


class SubmitInteractionAPIView(APIView):
    """
    POST /api/submit-interaction/
    Body: { "content_version_id": <int>, "rating": <1-5|null>, "skipped": <bool> }

    If skipped=true:
        - Save interaction with skipped=True, rating=None
        - Apply global -10 penalty to the skipped style's preference
        - Return next content card data (for instant AJAX replacement)
    If skipped=false (rating submitted):
        - Save interaction with rating
        - Update preference using existing weighted formula
        - Return thank_you=true (no next card until next visit)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SubmitInteractionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cv_id = serializer.validated_data['content_version_id']
        rating = serializer.validated_data.get('rating')
        skipped = serializer.validated_data.get('skipped', False)

        content_version = get_object_or_404(ContentVersion, id=cv_id)
        topic = content_version.topic
        pref, _ = UserPreference.objects.get_or_create(user=request.user)

        if skipped:
            # ── SKIP PATH ──────────────────────────────────────────
            # Save interaction with skipped=True
            UserInteraction.objects.get_or_create(
                user=request.user,
                content_version=content_version,
                defaults={'topic': topic, 'rating': None, 'skipped': True}
            )

            # Apply global penalty: -10 to this style's preference (floor at 0)
            style = content_version.style_type
            field_name = f'{style}_preference'
            current_val = getattr(pref, field_name)
            setattr(pref, field_name, max(0, current_val - 10))
            pref.save(update_fields=[field_name, 'updated_at'])
            pref.recalculate_preferred_style()

            # Get next content for immediate replacement
            next_cv = get_next_content_for_topic(request.user, topic)
            if next_cv is None:
                return Response({
                    'skipped': True,
                    'exhausted': True,
                    'preferred_style': pref.preferred_style,
                })
            return Response({
                'skipped': True,
                'exhausted': False,
                'next_content': _serialize_content_version(next_cv),
                'preferred_style': pref.preferred_style,
            })

        else:
            # ── RATE PATH ──────────────────────────────────────────
            # Create or update interaction with rating
            interaction, created = UserInteraction.objects.get_or_create(
                user=request.user,
                content_version=content_version,
                defaults={'topic': topic, 'rating': rating, 'skipped': False}
            )
            if not created and rating:
                interaction.rating = rating
                interaction.skipped = False
                interaction.save()

            # Update preference profile using existing weighted formula
            pref.update_from_interaction(content_version, rating)

            # Find next topic in same subject
            from django.urls import reverse
            seen_topic_ids = set(
                UserInteraction.objects.filter(
                    user=request.user,
                    topic__subject=topic.subject
                ).values_list('topic_id', flat=True)
            )
            next_topic = (
                topic.subject.topics
                .filter(order__gt=topic.order)
                .exclude(id__in=seen_topic_ids)
                .order_by('order')
                .first()
            )
            if not next_topic:
                next_topic = (
                    topic.subject.topics
                    .filter(order__gt=topic.order)
                    .order_by('order')
                    .first()
                )

            next_topic_url = ''
            next_topic_title = ''
            if next_topic:
                next_topic_url = reverse(
                    'topic_detail',
                    kwargs={
                        'subject_slug': topic.subject.slug,
                        'topic_slug': next_topic.slug,
                    }
                )
                next_topic_title = next_topic.title

            return Response({
                'thank_you': True,
                'preferred_style': pref.preferred_style,
                'interaction_count': pref.interaction_count,
                'next_topic_url': next_topic_url,
                'next_topic_title': next_topic_title,
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
