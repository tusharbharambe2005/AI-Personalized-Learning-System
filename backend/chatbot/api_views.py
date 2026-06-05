"""
Chatbot API view exposed for the React frontend (JWT-authenticated).
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import json

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

from django.conf import settings
from recommendations.chatbot_engine import build_system_prompt, get_top_style_label
from accounts.models import UserProfile

try:
    if HAS_GENAI and settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
except Exception:
    pass


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_api_react(request):
    """
    POST /api/chatbot/
    Body: { "message": "<user text>", "history": [{role, parts:[{text}]}, ...] }
    Returns: { "reply": "<AI text>", "learner_label": "<style>" }
    No pro-gate here — frontend controls visibility.
    """
    if not HAS_GENAI:
        return Response({'error': 'Gemini SDK not installed.'}, status=500)
    if not settings.GEMINI_API_KEY:
        return Response({'error': 'Gemini API key not configured.'}, status=500)

    data = request.data
    user_message = data.get('message', '').strip()
    history = data.get('history', [])

    if not user_message:
        return Response({'error': 'Empty message.'}, status=400)

    system_prompt = build_system_prompt(request.user)

    gemini_history = [
        {"role": turn['role'], "parts": [{"text": turn['text']}]}
        for turn in history
        if 'role' in turn and 'text' in turn
    ]

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_prompt
        )
        chat = model.start_chat(history=gemini_history)
        response = chat.send_message(user_message)
        reply_text = response.text
    except Exception as e:
        reply_text = f"I'm having trouble connecting right now. Error: {str(e)}"

    return Response({
        'reply': reply_text,
        'learner_label': get_top_style_label(request.user),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chatbot_status(request):
    """GET /api/chatbot/status/ — returns whether the user can access the chatbot."""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    label = get_top_style_label(request.user)
    return Response({
        'is_pro': profile.is_pro,
        'pro_requested': profile.pro_requested,
        'has_gemini_key': bool(settings.GEMINI_API_KEY),
        'learner_label': label,
        'username': request.user.first_name or request.user.username,
    })
