"""
Learning app admin configuration.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Subject, Topic, ContentVersion, VideoResource


class ContentVersionInline(admin.TabularInline):
    model = ContentVersion
    extra = 2
    fields = ['title', 'style_type', 'diagram_score', 'analogy_score',
               'example_score', 'theory_score', 'logic_score']


class VideoResourceInline(admin.TabularInline):
    model = VideoResource
    extra = 1
    fields = ['title', 'youtube_url', 'diagram_score', 'analogy_score',
               'example_score', 'theory_score', 'logic_score']


class TopicInline(admin.TabularInline):
    model = Topic
    extra = 1
    fields = ['title', 'order', 'description']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'get_topic_count', 'color_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [TopicInline]

    def color_preview(self, obj):
        return format_html(
            '<span style="background:{};padding:3px 12px;border-radius:4px;color:white;">{}</span>',
            obj.color, obj.color
        )
    color_preview.short_description = 'Color'

    def get_topic_count(self, obj):
        return obj.get_topic_count()
    get_topic_count.short_description = 'Topics'


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'order', 'get_content_count', 'get_video_count', 'created_at']
    list_filter = ['subject', 'created_at']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ContentVersionInline, VideoResourceInline]

    def get_content_count(self, obj):
        return obj.content_versions.count()
    get_content_count.short_description = 'Versions'

    def get_video_count(self, obj):
        return obj.videos.count()
    get_video_count.short_description = 'Videos'


@admin.register(ContentVersion)
class ContentVersionAdmin(admin.ModelAdmin):
    list_display = ['title', 'topic', 'style_type', 'diagram_score', 'analogy_score',
                    'example_score', 'theory_score', 'logic_score']
    list_filter = ['style_type', 'topic__subject']
    search_fields = ['title', 'topic__title']
    readonly_fields = ['created_at']


@admin.register(VideoResource)
class VideoResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'topic', 'video_link', 'diagram_score', 'analogy_score',
                    'example_score', 'theory_score', 'logic_score']
    list_filter = ['topic__subject']
    search_fields = ['title', 'topic__title']

    def video_link(self, obj):
        return format_html('<a href="{}" target="_blank">▶ Watch</a>', obj.youtube_url)
    video_link.short_description = 'YouTube'
