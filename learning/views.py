"""
Learning app views - Home, Dashboard, Subjects, Topics, Topic Detail.
"""
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.decorators import method_decorator
from django.views import View
from django.db.models import Q
import json

from .models import Subject, Topic, ContentVersion, VideoResource
from .forms import ContentSelectionForm
from recommendations.models import UserPreference, UserInteraction
from recommendations.engine import (
    get_recommended_content_versions,
    get_recommended_topics,
    get_recommended_videos,
    get_user_progress,
)


class HomeView(View):
    """Public landing/home page."""
    template_name = 'learning/home.html'

    def get(self, request):
        subjects = Subject.objects.all()[:6]
        total_subjects = Subject.objects.count()
        total_topics = Topic.objects.count()
        total_content = ContentVersion.objects.count()
        context = {
            'subjects': subjects,
            'total_subjects': total_subjects,
            'total_topics': total_topics,
            'total_content': total_content,
        }
        return render(request, self.template_name, context)


@method_decorator(login_required, name='dispatch')
class DashboardView(View):
    """Student dashboard with recommendations, progress, preference chart."""
    template_name = 'learning/dashboard.html'

    def get(self, request):
        user = request.user
        pref, _ = UserPreference.objects.get_or_create(user=user)
        progress = get_user_progress(user)
        recommended_topics = get_recommended_topics(user, limit=6)
        recommended_videos = get_recommended_videos(user, limit=6)
        recent_interactions = UserInteraction.objects.filter(
            user=user
        ).select_related('topic', 'content_version', 'topic__subject')[:5]

        # Chart data for preference radar/bar chart
        norm_scores = pref.get_normalized_scores()
        chart_data = {
            'labels': ['Diagram', 'Analogy', 'Example', 'Theory', 'Logic'],
            'values': [
                norm_scores['diagram'],
                norm_scores['analogy'],
                norm_scores['example'],
                norm_scores['theory'],
                norm_scores['logic'],
            ]
        }

        subjects = Subject.objects.all()
        context = {
            'pref': pref,
            'progress': progress,
            'recommended_topics': recommended_topics,
            'recommended_videos': recommended_videos,
            'recent_interactions': recent_interactions,
            'chart_data_json': json.dumps(chart_data),
            'subjects': subjects,
            'norm_scores': norm_scores,
        }
        return render(request, self.template_name, context)


@method_decorator(login_required, name='dispatch')
class SubjectListView(View):
    """List all subjects."""
    template_name = 'learning/subject_list.html'

    def get(self, request):
        subjects = Subject.objects.all()
        context = {'subjects': subjects}
        return render(request, self.template_name, context)


@method_decorator(login_required, name='dispatch')
class TopicListView(View):
    """List topics for a given subject."""
    template_name = 'learning/topic_list.html'

    def get(self, request, subject_slug):
        subject = get_object_or_404(Subject, slug=subject_slug)
        topics = subject.topics.prefetch_related('content_versions', 'videos')

        # Mark which topics have been interacted with by this user
        seen_ids = set(
            UserInteraction.objects.filter(
                user=request.user
            ).values_list('topic_id', flat=True)
        )
        topics_with_status = []
        for t in topics:
            topics_with_status.append({
                'topic': t,
                'completed': t.id in seen_ids,
                'content_count': t.content_versions.count(),
                'video_count': t.videos.count(),
            })

        context = {
            'subject': subject,
            'topics_with_status': topics_with_status,
        }
        return render(request, self.template_name, context)


@method_decorator(login_required, name='dispatch')
class TopicDetailView(View):
    """
    Topic detail page — shows multiple explanation versions sorted by user preference.
    Student selects the version that helped most.
    """
    template_name = 'learning/topic_detail.html'

    def get(self, request, subject_slug, topic_slug):
        topic = get_object_or_404(
            Topic, slug=topic_slug, subject__slug=subject_slug
        )
        # Get content versions sorted by user preference match score
        content_versions = get_recommended_content_versions(request.user, topic, limit=5)

        # Check if user already interacted with this topic
        user_interactions = UserInteraction.objects.filter(
            user=request.user, topic=topic
        ).values_list('content_version_id', flat=True)

        # Recommended videos for this topic
        recommended_videos = get_recommended_videos(request.user, limit=3, topic=topic)

        # User preference profile (needed for "Best for you" badge)
        pref, _ = UserPreference.objects.get_or_create(user=request.user)

        context = {
            'topic': topic,
            'content_versions': content_versions,
            'user_interacted_ids': list(user_interactions),
            'recommended_videos': recommended_videos,
            'pref': pref,
            'selection_form': ContentSelectionForm(),
        }
        return render(request, self.template_name, context)

    def post(self, request, subject_slug, topic_slug):
        """Handle content version selection."""
        topic = get_object_or_404(
            Topic, slug=topic_slug, subject__slug=subject_slug
        )
        form = ContentSelectionForm(request.POST)
        if form.is_valid():
            cv_id = form.cleaned_data['content_version_id']
            rating_str = form.cleaned_data.get('rating')
            rating = int(rating_str) if rating_str else None

            content_version = get_object_or_404(ContentVersion, id=cv_id, topic=topic)

            # Create or update interaction
            interaction, created = UserInteraction.objects.get_or_create(
                user=request.user,
                content_version=content_version,
                defaults={'topic': topic, 'rating': rating}
            )
            if not created and rating:
                interaction.rating = rating
                interaction.save()

            # Update user preference profile
            pref, _ = UserPreference.objects.get_or_create(user=request.user)
            pref.update_from_interaction(content_version, rating)

            messages.success(
                request,
                f'✓ Preference updated — '
                f'<strong>{pref.preferred_style.capitalize()}</strong> style noted!'
            )

            # ── Stay within the SAME subject ──────────────────────
            # Find the next topic in this subject (by order), that the
            # user hasn't visited yet.
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

            if next_topic:
                # Go to next unvisited topic in same subject
                return redirect(
                    'topic_detail',
                    subject_slug=subject_slug,
                    topic_slug=next_topic.slug
                )

            # All topics in this subject done → go to subject topic list
            messages.info(
                request,
                f'🎉 You have completed all topics in <strong>{topic.subject.name}</strong>!'
            )

        return redirect('topic_list', subject_slug=subject_slug)



@method_decorator(login_required, name='dispatch')
class InteractionHistoryView(View):
    """Shows the user's full interaction history."""
    template_name = 'learning/interaction_history.html'

    def get(self, request):
        interactions = UserInteraction.objects.filter(
            user=request.user
        ).select_related(
            'topic', 'topic__subject', 'content_version'
        ).order_by('-timestamp')

        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        context = {
            'interactions': interactions,
            'pref': pref,
        }
        return render(request, self.template_name, context)


@method_decorator(login_required, name='dispatch')
class VideoRecommendationView(View):
    """Full video recommendation page sorted by user preference."""
    template_name = 'learning/video_recommendations.html'

    def get(self, request):
        subject_id = request.GET.get('subject')
        topic_id = request.GET.get('topic')

        topic = None
        if topic_id:
            topic = get_object_or_404(Topic, id=topic_id)

        videos = get_recommended_videos(request.user, limit=20, topic=topic)
        subjects = Subject.objects.all()
        pref, _ = UserPreference.objects.get_or_create(user=request.user)

        context = {
            'videos': videos,
            'subjects': subjects,
            'selected_topic': topic,
            'pref': pref,
        }
        return render(request, self.template_name, context)
