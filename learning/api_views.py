"""
DRF API views for the learning app.
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404

from .models import Subject, Topic
from .serializers import (
    SubjectSerializer, SubjectDetailSerializer,
    TopicSerializer, TopicDetailSerializer,
)


class SubjectListAPIView(generics.ListAPIView):
    """GET /api/subjects/ — list all subjects."""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class SubjectDetailAPIView(generics.RetrieveAPIView):
    """GET /api/subjects/<slug>/ — subject with its topics."""
    queryset = Subject.objects.all()
    serializer_class = SubjectDetailSerializer
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedOrReadOnly]


class TopicsBySubjectAPIView(generics.ListAPIView):
    """GET /api/subjects/<slug>/topics/ — topics for a given subject."""
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        subject_slug = self.kwargs['subject_slug']
        subject = get_object_or_404(Subject, slug=subject_slug)
        return subject.topics.all()


class TopicDetailAPIView(generics.RetrieveAPIView):
    """GET /api/topics/<pk>/ — full topic detail with content versions."""
    queryset = Topic.objects.all()
    serializer_class = TopicDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
