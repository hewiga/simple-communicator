from http.client import HTTPResponse
from queue import Empty
from django.shortcuts import render
from .forms import SignIn
from .models import *
from django.contrib.auth import authenticate
from django.contrib.auth.models import User, auth
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from django.shortcuts import redirect
import json
from django.http import HttpResponse

def welcome(request):

    user = request.user
    if user.is_authenticated:
        profile = Profile.objects.get(user = user)
        return render(request, 'user-view.html', {'user': profile})

    return render(request, 'welcome.html', {})

def login(request):
    form = SignIn()
    return render(request, 'login.html', {'form': form})

def signin(request):
    form = SignIn()
    return render(request, "signin.html", {'form': form})

def create_new_user(request):

    if request.method == "POST":
        form = SignIn(request.POST)
        if form.is_valid():

            nick = form.cleaned_data['username']
            password = form.cleaned_data['password']

            pass_hash = make_password(password)
            user = User.objects.create(username = nick, password = pass_hash)

            auth.login(request, user)

            new_user = Profile()
            new_user.user = user
            new_user.username = nick
            new_user.save()

            return redirect('welcome')

        return render(request, "signin.html", {'form': form})


def login_user(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        user  = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            return redirect('welcome')
        else:
            messages.info(request, 'Invalid Username or Password')
            return redirect('login')

def logout(request):
    auth.logout(request)
    return redirect('welcome')

def add_friend(request):
    if request.method == 'POST':
        friends_nick = request.POST['friends_nick']

        #try to find profile with the given nickname
        try:
            friends_profile = Profile.objects.get(username = friends_nick)
        except Profile.DoesNotExist:
            friends_profile = None

        #send invitation if profile exist
        if friends_profile is not None:
            users_profile = Profile.objects.get(username = request.user)
            friends_profile.add_friend_request.add(users_profile)
    
    return redirect('welcome')

def accept(request):
    #accept friend request

    data = json.loads(request.body)
    friends_username = data["Friend"]
    users_username = request.user

    friends_profile = Profile.objects.get(username = friends_username)
    users_profile = Profile.objects.get(username = users_username)

    #creating new chat
    new_chat = Chat()
    new_chat.user1 = users_username
    new_chat.user2 = friends_username
    new_chat.save()
    friends_profile.chats.add(new_chat)
    users_profile.chats.add(new_chat)

    #create new friends and delete invitation to friends 
    users_profile.friends.add(friends_profile)
    users_profile.add_friend_request.remove(friends_profile)

    response = HttpResponse()
    response.status_code = 200
    return response

def delete(request):
    #decline friend request

    if request.method == "POST":
        data = json.loads(request.body)
        friends_username = data["Friend"]
        users_username = request.user

        users_profile = Profile.objects.get(username = users_username)
        friends_profile = Profile.objects.get(username = friends_username)
        users_profile.add_friend_request.remove(friends_profile)

        response = HttpResponse()
        response.status_code = 200
        return response

    #if not POST return "Bad request"
    response = HttpResponse()
    response.status_code = 400
    return response

def join_chat(request):
    if request.method == "POST":
        data = json.loads(request.body)
        sender = data["User1"]
        receiver = data["User2"]

        #find chat between two users
        sender_profile = Profile.objects.get(username = sender)
        chat = sender_profile.chats.all().filter(user1 = receiver)
        if len(chat) == 0:
            chat = sender_profile.chats.all().filter(user2 = receiver)

        #download all messages from chat and send them back to user
        data = []
        messages = chat[0].messages.all()
        for message in messages:
            data.append({
                "Sender": message.sender,
                "Receiver": message.receiver,
                "Content": message.content
            })

        data = json.dumps(data)
        response = HttpResponse(data)
        response.status_code = 200
        return response

    #if not POST return "Bad request"
    response = HttpResponse()
    response.status_code = 400
    return response
        
def send_message(request):
    if request.method == "POST":
        data = json.loads(request.body)
        sender = data['Sender']
        receiver = data['Receiver']
        message_content = data['Content']

        #create new message
        new_message = Message()
        new_message.sender = sender
        new_message.receiver = receiver
        new_message.content = message_content
        new_message.is_readed = False
        new_message.save()

        #find chat between users
        sender_profile = Profile.objects.get(username = sender)
        chat = sender_profile.chats.all().filter(user1 = receiver)
        if len(chat) == 0:
            chat = sender_profile.chats.all().filter(user2 = receiver)

        chat.first().messages.add(new_message)
        response = HttpResponse()
        response.status_code = 200
        return response
    
    #if not POST return "Bad request"
    response = HttpResponse()
    response.status_code = 400
    return response 

def get_messages(request):

    if request.method == "POST":
        data = json.loads(request.body)
        sender = data['Sender']
        receiver = data['Receiver']

        #find chat between users
        sender_profile = Profile.objects.get(username = sender)
        chat = sender_profile.chats.all().filter(user1 = receiver)
        if len(chat) == 0:
            chat = sender_profile.chats.all().filter(user2 = receiver)

        data = []
        messages = chat[0].messages.all()
        for message in messages:
            if message.is_readed == False and message.sender != sender:
                data.append({
                    "Sender": message.sender,
                    "Receiver": message.receiver,
                    "Content": message.content
                })
                message.is_readed = True
                message.save()

        data = json.dumps(data)
        response = HttpResponse(data)
        response.status_code = 200

        return response

    #if not POST return "Bad request"
    response = HttpResponse()
    response.status_code = 400
    return response