from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Message, Conversation
import requests

chat_history = []

@api_view(['POST'])
def chat_with_ai(request):
    prompt = request.data.get("prompt")
    convo_id = request.data.get("conversation_id")

    convo = Conversation.objects.get(id=convo_id)

    Message.objects.create(conversation=convo, role="user", content=prompt)

    history = Message.objects.filter(conversation=convo).order_by('-created_at')[:10]
    history = list(reversed(history))

    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in history
    ]

    res = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": "qwen:4b",
            "messages": messages,
            "stream": False
        }
    )

    data = res.json()
    reply = data.get("message", {}).get("content", "").strip()

    Message.objects.create(conversation=convo, role="assistant", content=reply)

    if convo.title == "New Chat":
        title_prompt = f"Generate a short title (max 5 words) for this: {prompt}"

        title_res = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "qwen:4b",
                "messages": [
                    {"role": "user", "content": title_prompt}
                ],
                "stream": False
            }
        )

        title_data = title_res.json()
        title = title_data.get("message", {}).get("content", "").strip()

        if title:
            convo.title = title[:40]
            convo.save()

    return Response({"response": reply})
    


@api_view(['GET'])
def get_history(request):
    messages = Message.objects.order_by('created_at')

    data = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]

    return Response(data)

@api_view(['POST'])
def create_chat(request):
    convo = Conversation.objects.create(title="New Chat")
    return Response({"id": convo.id})

@api_view(['GET'])
def get_conversations(request):
    chats = Conversation.objects.all().order_by('-created_at')

    data = [
        {"id": c.id, "title": c.title}
        for c in chats
    ]

    return Response(data)

@api_view(['GET'])
def get_chat_messages(request, chat_id):
    messages = Message.objects.filter(conversation_id=chat_id)

    data = [
        {"role": m.role, "content": m.content}
        for m in messages
    ]

    return Response(data)


@api_view(['DELETE'])
def delete_chat(request, chat_id):
    Conversation.objects.filter(id=chat_id).delete()
    return Response({"message": "Deleted"})


@api_view(['PUT'])
def rename_chat(request, chat_id):
    title = request.data.get("title")
    convo = Conversation.objects.get(id=chat_id)
    convo.title = title
    convo.save()
    return Response({"message": "Updated"})