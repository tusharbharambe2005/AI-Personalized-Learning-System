import json
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False
from django.conf import settings
from django.shortcuts import render, redirect
from django.http import JsonResponse
from recommendations.chatbot_engine import build_system_prompt, get_top_style_label

try:
    if HAS_GENAI and settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
except Exception:
    pass

def pro_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        if not request.user.profile.is_pro:
            from django.contrib import messages
            if request.user.profile.pro_requested:
                messages.warning(request, "⏳ Your Pro request is pending admin approval.")
            else:
                messages.warning(request, "🔒 This feature requires Pro. Upgrade to continue.")
            return redirect('upgrade')
        return view_func(request, *args, **kwargs)
    return wrapper


@pro_required
def chatbot_page(request):
    context = {
        'learner_label': get_top_style_label(request.user)
    }
    return render(request, 'chatbot/chatbot.html', context)


@pro_required
def chatbot_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)

    if not HAS_GENAI:
        return JsonResponse({'error': 'Gemini SDK is not installed in this environment.'}, status=500)

    if not settings.GEMINI_API_KEY:
        return JsonResponse({
            'error': 'Gemini API key is not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY in your environment or .env file.'
        }, status=500)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
    user_message = data.get('message', '').strip()
    history      = data.get('history', [])   # [{role, text}, ...] from frontend

    if not user_message:
        return JsonResponse({'error': 'Empty message'}, status=400)

    system_prompt = build_system_prompt(request.user)

    # Build Gemini-format history
    gemini_history = [
        {"role": turn['role'], "parts": [{"text": turn['text']}]}
        for turn in history
    ]

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_prompt
        )

        chat     = model.start_chat(history=gemini_history)
        response = chat.send_message(user_message)
        reply_text = response.text
    except Exception as e:
        reply_text = f"API Error: {str(e)}"

    return JsonResponse({
        'reply':          reply_text,
        'learner_label':  get_top_style_label(request.user)
    })
