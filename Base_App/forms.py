from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import Profile


class RegisterForm(UserCreationForm):
    """
    Custom registration form extending Django's UserCreationForm
    Adds email field with validation
    """
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'})
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Add Bootstrap classes to password fields
        self.fields['password1'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Password'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Confirm Password'})


class LoginForm(AuthenticationForm):
    """
    Custom Login Form with Bootstrap Styling
    """
    username = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'})
    )

    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'})
    )


class UserUpdateForm(forms.ModelForm):
    """
    Form for updating User model fields (username and email)
    """
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email']


class ProfileUpdateForm(forms.ModelForm):
    """
    Form for updating Profile model fields (profile image)
    Uses a clean FileInput (no 'Clear' or 'Change' text).
    """

    image = forms.ImageField(
        required=False,
        widget=forms.FileInput(
            attrs={
                'class': 'form-control custom-file-input', # Adds custom CSS class
                'accept': 'image/*', # Restrict file types to images only
                'id': 'profile-image-input' # Unique ID for JS targeting
            }
        ),
        label="Profile Image"
    )

    class Meta:
        model = Profile
        fields = ['image']