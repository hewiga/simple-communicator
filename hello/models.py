from asyncio import SendfileNotAvailableError
from email.policy import default
from tkinter import CASCADE
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Profile(models.Model):

    user = models.OneToOneField(User, on_delete = models.CASCADE)
    username = models.CharField(max_length=50)
    friends = models.ManyToManyField("self")
    add_friend_request = models.ManyToManyField("self", symmetrical=False)
    chats = models.ManyToManyField("Chat")

    def __str__(self):
        return str(self.username)

class Chat(models.Model):
    user1 = models.CharField(max_length=50)
    user2 = models.CharField(max_length=50)
    messages = models.ManyToManyField("Message")

    def __str__(self):
        string = self.user1 + ":" + self.user2
        return str(string)

class Message(models.Model):
    sender = models.CharField(max_length=50)
    receiver = models.CharField(max_length=50)

    content = models.TextField()
    is_readed = models.BooleanField()

    def __str__(self):
        return str(self.sender)