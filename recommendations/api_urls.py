"""
Recommendations app API URL configuration.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    path('preferences/', api_views.UserPreferenceAPIView.as_view(), name='api_preferences'),
    path('submit-interaction/', api_views.SubmitInteractionAPIView.as_view(), name='api_submit_interaction'),
    path('recommended-topics/', api_views.RecommendedTopicsAPIView.as_view(), name='api_recommended_topics'),
    path('recommended-videos/', api_views.RecommendedVideosAPIView.as_view(), name='api_recommended_videos'),
    path('interaction-history/', api_views.UserInteractionHistoryAPIView.as_view(), name='api_interaction_history'),
]
