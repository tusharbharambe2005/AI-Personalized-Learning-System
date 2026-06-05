from django.urls import path
from . import views, api_views

urlpatterns = [
    path('chatbot/', views.chatbot_page, name='chatbot'),
    path('chatbot/api/', views.chatbot_api, name='chatbot_api'),
    # React JWT-authenticated API endpoints
    path('api/chatbot/', api_views.chatbot_api_react, name='api_chatbot'),
    path('api/chatbot/status/', api_views.chatbot_status, name='api_chatbot_status'),
]
