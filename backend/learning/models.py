"""
Learning app models - Subject, Topic, ContentVersion, VideoResource
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Subject(models.Model):
    """A top-level subject like DBMS, DSA, Engineering Mathematics."""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, default='bi-book', help_text='Bootstrap icon class')
    color = models.CharField(max_length=20, default='#6c5ce7', help_text='Hex color for card')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_topic_count(self):
        return self.topics.count()


class Topic(models.Model):
    """A topic under a subject. Each topic has multiple explanation versions."""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=300)
    slug = models.SlugField(blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0, help_text='Display order in subject')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'title']
        unique_together = ('subject', 'slug')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.subject.name} - {self.title}"

    def get_content_versions(self):
        return self.content_versions.all()

    def get_videos(self):
        return self.videos.all()


class ContentVersion(models.Model):
    """
    A specific explanation version of a topic.
    Each version is styled for a particular learning style.
    """
    STYLE_CHOICES = [
        ('diagram', 'Diagram-Focused'),
        ('analogy', 'Analogy-Focused'),
        ('example', 'Example-Focused'),
        ('theory', 'Theory-Focused'),
        ('logic', 'Logic-Focused'),
    ]

    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='content_versions')
    title = models.CharField(max_length=300)
    style_type = models.CharField(max_length=20, choices=STYLE_CHOICES)
    content = models.TextField(help_text='The actual explanation content for this style')

    # Style scores (0-100) — how much this content aligns with each learning style
    diagram_score = models.IntegerField(default=0, help_text='0-100: How diagram-heavy is this content')
    analogy_score = models.IntegerField(default=0, help_text='0-100: How analogy-heavy is this content')
    example_score = models.IntegerField(default=0, help_text='0-100: How example-heavy is this content')
    theory_score = models.IntegerField(default=0, help_text='0-100: How theory-heavy is this content')
    logic_score = models.IntegerField(default=0, help_text='0-100: How logic-heavy is this content')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['style_type']

    def __str__(self):
        return f"{self.topic.title} - {self.get_style_type_display()}"

    def get_style_badge_color(self):
        color_map = {
            'diagram': 'info',
            'analogy': 'warning',
            'example': 'success',
            'theory': 'primary',
            'logic': 'danger',
        }
        return color_map.get(self.style_type, 'secondary')

    def get_style_icon(self):
        icon_map = {
            'diagram': 'bi-diagram-3',
            'analogy': 'bi-lightbulb',
            'example': 'bi-code-slash',
            'theory': 'bi-journal-text',
            'logic': 'bi-cpu',
        }
        return icon_map.get(self.style_type, 'bi-book')


class VideoResource(models.Model):
    """
    A YouTube video resource tagged by learning style scores.
    """
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=300)
    youtube_url = models.URLField(help_text='Full YouTube URL')
    description = models.TextField(blank=True)

    # Style scores (0-100)
    diagram_score = models.IntegerField(default=0)
    analogy_score = models.IntegerField(default=0)
    example_score = models.IntegerField(default=0)
    theory_score = models.IntegerField(default=0)
    logic_score = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.topic.title} - {self.title}"

    def get_youtube_embed_url(self):
        """Convert YouTube watch URL to embed URL."""
        url = self.youtube_url
        video_id = None
        if 'youtu.be/' in url:
            video_id = url.split('youtu.be/')[-1].split('?')[0]
        elif 'v=' in url:
            video_id = url.split('v=')[-1].split('&')[0]
        if video_id:
            return f"https://www.youtube.com/embed/{video_id}"
        return url

    def get_youtube_thumbnail(self):
        """Get thumbnail URL from YouTube video ID."""
        url = self.youtube_url
        video_id = None
        if 'youtu.be/' in url:
            video_id = url.split('youtu.be/')[-1].split('?')[0]
        elif 'v=' in url:
            video_id = url.split('v=')[-1].split('&')[0]
        if video_id:
            return f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
        return '/static/img/video-placeholder.png'
