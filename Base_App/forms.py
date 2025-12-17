from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import Profile, Order


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


class CheckoutForm(forms.ModelForm):
    """
    Form for collecting customer information during checkout
    """
    # Add additional fields for validation if needed
    agree_terms = forms.BooleanField(
        required=True,
        error_messages={'required': 'You must agree to the terms and conditions'},
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )

    class Meta:
        model = Order
        fields = ['customer_name', 'customer_email', 'customer_phone', 'customer_address', 'special_instructions']
        widgets = {
            'customer_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Full Name',
                'required': True
            }),
            'customer_email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Email Address',
                'required': True
            }),
            'customer_phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Phone Number',
                'required': True
            }),
            'customer_address': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Delivery Address (if applicable)',
                'rows': 3
            }),
            'special_instructions': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Any special instructions for your order...',
                'rows': 3
            }),
        }
        labels = {
            'customer_address': 'Delivery Address',
            'special_instructions': 'Special Instructions'
        }

    def clean_customer_phone(self):
        """
        Validate Phone number format
        """
        phone = self.cleaned_data.get('customer_phone')
        # Basic phone validation - you can enhance this as needed
        if len(phone) < 10:
            raise forms.ValidationError("Please enter a valid phone number")
        return phone