"""
Learning app URL configuration.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('subjects/', views.SubjectListView.as_view(), name='subject_list'),
    path('subjects/<slug:subject_slug>/topics/', views.TopicListView.as_view(), name='topic_list'),
    path('subjects/<slug:subject_slug>/topics/<slug:topic_slug>/', views.TopicDetailView.as_view(), name='topic_detail'),
    path('history/', views.InteractionHistoryView.as_view(), name='interaction_history'),
    path('videos/', views.VideoRecommendationView.as_view(), name='video_recommendations'),
]
