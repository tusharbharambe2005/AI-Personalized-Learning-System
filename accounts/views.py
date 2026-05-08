"""
Accounts app views - Register, Login, Logout, Profile.
"""
import os
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views import View
from django.utils.decorators import method_decorator
from .forms import RegisterForm, LoginForm, ProfileInfoForm, ProfileAvatarForm, ProfilePasswordForm
from .models import UserProfile


class RegisterView(View):
    template_name = 'accounts/register.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard')
        form = RegisterForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Welcome, {user.first_name or user.username}! Your account is ready.')
            return redirect('dashboard')
        return render(request, self.template_name, {'form': form})


class LoginView(View):
    template_name = 'accounts/login.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard')
        form = LoginForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back, {user.first_name or user.username}!')
            next_url = request.GET.get('next', 'dashboard')
            return redirect(next_url)
        return render(request, self.template_name, {'form': form})


class LogoutView(View):
    def post(self, request):
        logout(request)
        messages.info(request, 'You have been logged out.')
        return redirect('home')

    def get(self, request):
        logout(request)
        return redirect('home')


@method_decorator(login_required, name='dispatch')
class ProfileView(View):
    template_name = 'accounts/profile.html'

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        info_form = ProfileInfoForm(user=request.user, initial={
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'username': request.user.username,
            'email': request.user.email,
            'institution': profile.institution,
            'bio': profile.bio,
        })
        avatar_form = ProfileAvatarForm(instance=profile)
        password_form = ProfilePasswordForm(user=request.user)

        # Stats
        from recommendations.models import UserInteraction, UserPreference
        interaction_count = UserInteraction.objects.filter(user=request.user).count()
        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        scores = {
            'diagram': pref.diagram_preference,
            'analogy': pref.analogy_preference,
            'example': pref.example_preference,
            'theory': pref.theory_preference,
            'logic': pref.logic_preference,
        }
        preferred_style = max(scores, key=scores.get) if any(scores.values()) else 'balanced'

        ctx = {
            'profile': profile,
            'info_form': info_form,
            'avatar_form': avatar_form,
            'password_form': password_form,
            'interaction_count': interaction_count,
            'preferred_style': preferred_style,
            'active_tab': request.GET.get('tab', 'info'),
        }
        return render(request, self.template_name, ctx)


@method_decorator(login_required, name='dispatch')
class ProfileUpdateView(View):
    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        form = ProfileInfoForm(request.POST, user=request.user)
        if form.is_valid():
            user = request.user
            user.first_name = form.cleaned_data['first_name']
            user.last_name = form.cleaned_data['last_name']
            user.username = form.cleaned_data['username']
            user.email = form.cleaned_data['email']
            user.save()
            profile.institution = form.cleaned_data['institution']
            profile.bio = form.cleaned_data['bio']
            profile.save()
            messages.success(request, '✅ Profile updated successfully!')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
        return redirect('profile')


@method_decorator(login_required, name='dispatch')
class AvatarUpdateView(View):
    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        action = request.POST.get('action', 'upload')

        if action == 'remove':
            # Delete old avatar file
            if profile.avatar:
                try:
                    if os.path.isfile(profile.avatar.path):
                        os.remove(profile.avatar.path)
                except Exception:
                    pass
                profile.avatar = None
                profile.save()
            messages.success(request, 'Profile picture removed.')
            return redirect('profile')

        # Upload new avatar
        form = ProfileAvatarForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            # Remove old avatar before saving new
            if profile.avatar:
                try:
                    if os.path.isfile(profile.avatar.path):
                        os.remove(profile.avatar.path)
                except Exception:
                    pass
            form.save()
            messages.success(request, '✅ Profile picture updated!')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{error}')
        return redirect('profile')


@method_decorator(login_required, name='dispatch')
class PasswordUpdateView(View):
    def post(self, request):
        form = ProfilePasswordForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
            messages.success(request, '✅ Password changed successfully!')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{error}')
        return redirect('profile' + '?tab=password')
