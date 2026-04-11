"""
Recommendation Engine - Core rule-based matching logic.
No AI APIs used. Pure weighted score matching.
"""
from learning.models import Topic, ContentVersion, VideoResource
from recommendations.models import UserPreference, UserInteraction


def compute_match_score(user_pref: UserPreference, item) -> float:
    """
    Compute how well an item (ContentVersion or VideoResource) matches user preference.

    Match Score Formula:
    match_score = (user.diagram_pref * item.diagram_score) +
                  (user.analogy_pref * item.analogy_score) +
                  (user.example_pref * item.example_score) +
                  (user.theory_pref  * item.theory_score)  +
                  (user.logic_pref   * item.logic_score)

    Returns a raw float score (higher = better match).
    """
    return (
        user_pref.diagram_preference * item.diagram_score +
        user_pref.analogy_preference * item.analogy_score +
        user_pref.example_preference * item.example_score +
        user_pref.theory_preference  * item.theory_score  +
        user_pref.logic_preference   * item.logic_score
    )


def get_recommended_content_versions(user, topic, limit=5):
    """
    Get content versions for a topic sorted by match score for the user.
    Falls back to default ordering if user has no preferences.
    """
    try:
        pref = user.preference
    except UserPreference.DoesNotExist:
        pref = UserPreference.objects.create(user=user)

    versions = list(topic.content_versions.all())

    if pref.interaction_count == 0:
        # No history yet — return balanced (default order)
        return versions[:limit]

    # Score each version and sort descending
    scored = [(v, compute_match_score(pref, v)) for v in versions]
    scored.sort(key=lambda x: x[1], reverse=True)

    return [v for v, _ in scored[:limit]]


def get_recommended_topics(user, limit=6):
    """
    Recommend unseen topics to the user based on their learning preference.
    Priority: unseen topics, sorted by best-matching content version score.
    """
    try:
        pref = user.preference
    except UserPreference.DoesNotExist:
        pref = UserPreference.objects.create(user=user)

    # Get topics the user has already interacted with
    seen_topic_ids = UserInteraction.objects.filter(
        user=user
    ).values_list('topic_id', flat=True).distinct()

    # Unseen topics only
    unseen_topics = Topic.objects.exclude(id__in=seen_topic_ids).prefetch_related('content_versions')

    if pref.interaction_count == 0 or not unseen_topics.exists():
        # No history or all topics seen — just return recent topics
        return list(Topic.objects.all().order_by('-created_at')[:limit])

    # Score each unseen topic by the best-matching content version it has
    scored_topics = []
    for topic in unseen_topics:
        versions = topic.content_versions.all()
        if not versions:
            topic_score = 0
        else:
            topic_score = max(compute_match_score(pref, v) for v in versions)
        scored_topics.append((topic, topic_score))

    scored_topics.sort(key=lambda x: x[1], reverse=True)
    return [t for t, _ in scored_topics[:limit]]


def get_recommended_videos(user, limit=6, topic=None):
    """
    Recommend videos sorted by match score for the user.
    Optionally filter by topic.
    """
    try:
        pref = user.preference
    except UserPreference.DoesNotExist:
        pref = UserPreference.objects.create(user=user)

    if topic:
        videos = list(topic.videos.all())
    else:
        videos = list(VideoResource.objects.all().select_related('topic', 'topic__subject'))

    # Always compute and attach match_score to every video object
    if pref.interaction_count == 0:
        # No history yet — equal scores; order by topic
        for video in videos:
            video.match_score = 0.0
        return videos[:limit]

    scored = [(v, compute_match_score(pref, v)) for v in videos]
    scored.sort(key=lambda x: x[1], reverse=True)

    result = []
    for video, score in scored[:limit]:
        video.match_score = round(score, 2)
        result.append(video)
    return result


def get_user_progress(user):
    """
    Compute user learning progress stats.
    Returns dict with completion percentage and topics completed.
    """
    total_topics = Topic.objects.count()
    seen_topic_ids = UserInteraction.objects.filter(
        user=user
    ).values_list('topic_id', flat=True).distinct()
    completed = seen_topic_ids.count()
    pct = round((completed / total_topics) * 100, 1) if total_topics > 0 else 0
    return {
        'total_topics': total_topics,
        'completed_topics': completed,
        'progress_pct': pct,
    }
