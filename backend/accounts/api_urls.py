"""
Accounts app API URL configuration.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import api_views

urlpatterns = [
    path('register/', api_views.RegisterAPIView.as_view(), name='api_register'),
    path('login/', api_views.LoginAPIView.as_view(), name='api_login'),
    path('logout/', api_views.LogoutAPIView.as_view(), name='api_logout'),
    path('me/', api_views.MeAPIView.as_view(), name='api_me'),
    path('change-password/', api_views.ChangePasswordAPIView.as_view(), name='api_change_password'),
    path('upgrade-request/', api_views.UpgradeRequestAPIView.as_view(), name='api_upgrade_request'),
    path('token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
]
