"""
Learning app API URL configuration.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    path('subjects/', api_views.SubjectListAPIView.as_view(), name='api_subjects'),
    path('subjects/<slug:slug>/', api_views.SubjectDetailAPIView.as_view(), name='api_subject_detail'),
    path('subjects/<slug:subject_slug>/topics/', api_views.TopicsBySubjectAPIView.as_view(), name='api_topics_by_subject'),
    path('subjects/<slug:subject_slug>/topics/<slug:topic_slug>/', api_views.TopicBySlugAPIView.as_view(), name='api_topic_by_slug'),
    path('topics/<int:pk>/', api_views.TopicDetailAPIView.as_view(), name='api_topic_detail'),
]
