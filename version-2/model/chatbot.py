"""شات بوت إيماء: يساعد الصم والبكم ويرد بجمل قصيرة يقدر الأفاتار يأشّرها.

يحتاج مفتاح Claude API في ملف model/.env بهذا الشكل (لا ترفعه على GitHub):
    ANTHROPIC_API_KEY=sk-ant-...
وبدون المفتاح يرد من public/data/dataset.json بس.
"""
import json
import os
from pathlib import Path

import anthropic

HERE = Path(__file__).parent
MODEL = os.environ.get('EMAA_CHAT_MODEL', 'claude-opus-5-5')

SYSTEM = """You are EMAA (إيماء), a friendly assistant inside an app for Deaf and mute people in Saudi Arabia.
Your replies are shown as text and signed by a 3D avatar, so:
- Use short, simple, clear sentences: at most 3 sentences and about 40 words.
- Use common everyday words. No emojis, no markdown, no lists, no links.
- Write `ar` in clear Modern Standard Arabic (Saudi-friendly wording), and `en` as the same meaning in English.

Be genuinely useful in daily life. The most helpful things you do:
- When the user needs to talk to a hearing person (doctor, pharmacist, cashier, police, employee, taxi driver),
  write the exact polite sentence they can show on their phone, starting with "اعرض هذه الجملة:".
- Explain forms, appointments, government and bank steps one small step at a time, and ask what they see next.
- In an emergency or danger, first tell them to call the unified emergency number 911 and to show their
  location and the problem in writing to anyone nearby; keep it calm and short.
- Help them learn signs and fingerspelling in Arabic and American Sign Language, and explain how this app works
  (it turns text into signs with the avatar, and reads fingerspelled letters from the camera).
- Encourage them and treat them with respect; never assume they cannot read or decide for themselves.
If you are not sure of an exact fact (a phone number, a fee, an office address), say so and tell them where to
check instead of guessing. The user may write with spelling mistakes or single words because they spell with
their hands, so guess the intended meaning and confirm briefly."""

REPLY_SCHEMA = {
    'type': 'object',
    'properties': {'ar': {'type': 'string'}, 'en': {'type': 'string'}},
    'required': ['ar', 'en'],
    'additionalProperties': False,
}


def _load_env():
    env = HERE / '.env'
    if env.exists():
        for line in env.read_text(encoding='utf-8').splitlines():
            key, sep, value = line.strip().partition('=')
            if sep and not key.startswith('#'):
                os.environ.setdefault(key.strip(), value.strip().strip('"'))


_load_env()
_client = anthropic.Anthropic() if os.environ.get('ANTHROPIC_API_KEY') else None

_replies_path = HERE.parent / 'public' / 'data' / 'dataset.json'
_replies = json.loads(_replies_path.read_text(encoding='utf-8')) if _replies_path.exists() else {}

FALLBACK = {
    'ar': 'عذرًا، المساعد غير متصل الآن. جرّب مرة ثانية بعد قليل.',
    'en': 'Sorry, the assistant is offline right now. Please try again shortly.',
}


def _offline_reply(text):
    key = next((k for k in sorted(_replies, key=len, reverse=True) if k in text), None)
    if key:
        return {'ar': _replies[key]['response'], 'en': '', 'source': 'dataset'}
    return {**FALLBACK, 'source': 'offline'}


def reply(messages):
    """messages: [{"role": "user"|"assistant", "content": str}, ...] ينتهي برسالة المستخدم."""
    if _client is None:
        return _offline_reply(messages[-1]['content'])
    history = messages[-20:]
    while history and history[0]['role'] != 'user':
        history = history[1:]
    try:
        response = _client.beta.messages.create(
            model=MODEL,
            max_tokens=1024,  # الردود قصيرة عمدًا
            system=SYSTEM,
            messages=history,
            output_config={'effort': 'low', 'format': {'type': 'json_schema', 'schema': REPLY_SCHEMA}},
            betas=['server-side-fallback-2026-07-01'],
            fallbacks='default',
        )
    except (anthropic.APIStatusError, anthropic.APIConnectionError) as e:
        print('chatbot error:', e)
        return _offline_reply(messages[-1]['content'])
    if response.stop_reason == 'refusal':
        return {'ar': 'لا أستطيع المساعدة في هذا الطلب.', 'en': "I can't help with that request.", 'source': 'claude'}
    text = next((b.text for b in response.content if b.type == 'text'), '')
    try:
        return {**json.loads(text), 'source': 'claude'}
    except json.JSONDecodeError:
        return _offline_reply(messages[-1]['content'])
