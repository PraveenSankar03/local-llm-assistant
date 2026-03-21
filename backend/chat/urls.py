from django.urls import path
from .views import chat_with_ai, get_history, create_chat, get_chat_messages, get_conversations, delete_chat, rename_chat

urlpatterns = [
    path('chat/', chat_with_ai),
    path('history/', get_history),
    path('create_chat/', create_chat),
    path('conversations/', get_conversations),
    path('chat/<int:chat_id>/', get_chat_messages),
    path('chat/<int:chat_id>/delete/', delete_chat),
    path('chat/<int:chat_id>/rename/', rename_chat),
]