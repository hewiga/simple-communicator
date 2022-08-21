from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User
from .models import Profile

class SignIn(forms.Form):
    username = forms.CharField(max_length=50, 
    widget=forms.TextInput(attrs={'class': 'input-field', 'placeholder': 'Username'}))

    password = forms.CharField(max_length=50, 
    widget=forms.PasswordInput(attrs={'class': 'input-field', 'placeholder': 'Password'}))

    confirm_password  = forms.CharField(max_length=50, 
    widget=forms.PasswordInput(attrs={'class': 'input-field', 'placeholder': 'Repeat Password'}))

    def clean_username(self):
        nick = self.cleaned_data['username']
        if User.objects.filter(username=nick).exists():
            raise ValidationError(_("The username you entered has already been taken. Please try another username."))
        return nick
    
    def clean_confirm_password(self):
        pass1 = self.cleaned_data.get("password")
        pass2 = self.cleaned_data.get("confirm_password")
        if pass1 != pass2:
            raise ValidationError(_("Repeated password is incorrect."))
        return pass1