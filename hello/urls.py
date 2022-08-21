from django.urls import path
from . import views

urlpatterns = [
    path('', views.welcome, name='welcome'),
    path('login/', views.login, name='login'),
    path('signin/', views.signin, name='signin'),
    path('signin/signin_user', views.create_new_user, name='cn_user'),
    path('login/login_user', views.login_user, name='login_user'),
    path('logout/', views.logout, name='logout'),
    path('add_friend', views.add_friend, name='add_friend'),
    path('accept', views.accept, name='accept'),
    path('delete', views.delete, name='delete'),
    path('join_chat', views.join_chat, name='join_chat'),
    path('send_message', views.send_message, name='send_message'),
    path('get_messages', views.get_messages, name='get_messages')
]