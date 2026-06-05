"""
Auth API endpoints for the React frontend.
Handles: register, login (JWT), logout, current user info, profile update, upgrade request.
"""
import os
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from accounts.models import UserProfile
from recommendations.models import UserPreference, UserInteraction


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def user_data(user):
    """Serialize user + profile for the frontend."""
    profile, _ = UserProfile.objects.get_or_create(user=user)
    pref, _ = UserPreference.objects.get_or_create(user=user)
    return {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'profile': {
            'is_pro': profile.is_pro,
            'pro_requested': profile.pro_requested,
            'institution': profile.institution,
            'bio': profile.bio,
            'avatar_url': profile.get_avatar_url(),
            'avatar_initial': profile.get_avatar_initial(),
            'preferred_style': pref.preferred_style,
            'interaction_count': pref.interaction_count,
        }
    }


class RegisterAPIView(APIView):
    """POST /api/auth/register/"""
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        email = data.get('email', '').strip()
        institution = data.get('institution', '').strip()

        errors = {}
        if not username:
            errors['username'] = 'Username is required.'
        elif User.objects.filter(username=username).exists():
            errors['username'] = 'Username already taken.'
        if not password or len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters.'
        if not first_name:
            errors['first_name'] = 'First name is required.'

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if institution:
            profile.institution = institution
            profile.save()

        tokens = get_tokens_for_user(user)
        return Response({
            'user': user_data(user),
            **tokens,
        }, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    """POST /api/auth/login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        tokens = get_tokens_for_user(user)
        return Response({
            'user': user_data(user),
            **tokens,
        })


class LogoutAPIView(APIView):
    """POST /api/auth/logout/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except (TokenError, Exception):
            pass
        return Response({'message': 'Logged out successfully.'})


class MeAPIView(APIView):
    """GET /api/auth/me/ — current user info"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(user_data(request.user))

    def patch(self, request):
        """Update profile info."""
        user = request.user
        data = request.data
        profile, _ = UserProfile.objects.get_or_create(user=user)

        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        if 'username' in data and data['username'] != user.username:
            new_username = data['username']
            if User.objects.filter(username=new_username).exclude(id=user.id).exists():
                return Response({'username': 'Username already taken.'}, status=400)
            user.username = new_username
        user.save()

        if 'institution' in data:
            profile.institution = data['institution']
        if 'bio' in data:
            profile.bio = data['bio']
        profile.save()

        return Response(user_data(user))


class ChangePasswordAPIView(APIView):
    """POST /api/auth/change-password/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password1', '')
        confirm_password = request.data.get('new_password2', '')

        if not user.check_password(old_password):
            return Response({'old_password': 'Incorrect current password.'}, status=400)
        if len(new_password) < 8:
            return Response({'new_password1': 'New password must be at least 8 characters.'}, status=400)
        if new_password != confirm_password:
            return Response({'new_password2': 'Passwords do not match.'}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully.'})


class UpgradeRequestAPIView(APIView):
    """POST /api/auth/upgrade-request/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        VALID_COUPON = "TUSHAR123"
        coupon = request.data.get('coupon', '').strip()

        if profile.is_pro:
            return Response({'message': 'Already Pro.'}, status=400)
        if profile.pro_requested:
            return Response({'message': 'Request already pending.'}, status=400)
        if coupon != VALID_COUPON:
            return Response({'error': 'Invalid coupon code.'}, status=400)

        profile.pro_requested = True
        profile.pro_request_at = timezone.now()
        profile.pro_coupon_used = coupon
        profile.save()
        return Response({'message': 'Pro request submitted successfully.', 'pro_requested': True})
