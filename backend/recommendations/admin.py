"""
Recommendations app admin.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import UserPreference, UserInteraction


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'preferred_style', 'interaction_count',
        'diagram_preference', 'analogy_preference',
        'example_preference', 'theory_preference', 'logic_preference', 'updated_at'
    ]
    list_filter = ['preferred_style']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['updated_at', 'interaction_count']

    def style_badge(self, obj):
        colors = {
            'diagram': '#00b4d8', 'analogy': '#f9c74f',
            'example': '#06d6a0', 'theory': '#4361ee',
            'logic': '#ef233c', 'balanced': '#6c757d'
        }
        color = colors.get(obj.preferred_style, '#6c757d')
        return format_html(
            '<span style="background:{};color:white;padding:2px 10px;border-radius:12px;">{}</span>',
            color, obj.preferred_style.capitalize()
        )
    style_badge.short_description = 'Style'


@admin.register(UserInteraction)
class UserInteractionAdmin(admin.ModelAdmin):
    list_display = ['user', 'topic', 'content_version', 'rating', 'timestamp']
    list_filter = ['rating', 'topic__subject', 'timestamp']
    search_fields = ['user__username', 'topic__title']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
