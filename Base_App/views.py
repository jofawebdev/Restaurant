from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib import messages
from .forms import RegisterForm, LoginForm, UserUpdateForm, ProfileUpdateForm
from django.http import HttpResponse
from Base_App.models import BookTable, AboutUs, Feedback, ItemList, Items, Profile
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


def HomeView(request):
    items = Items.objects.all()
    list = ItemList.objects.all()
    review = Feedback.objects.all()
    return render(request, 'Base_App/home.html', {'items': items, 'list': list, 'review': review})


def AboutView(request):
    data = AboutUs.objects.all()

    # Add default content if no about data exists
    if not data:
        # You could create a default About Us object here or handle it in the template
        pass

    return render(request, 'Base_App/about.html', {'data': data})


def MenuView(request):
    items = Items.objects.all()
    list = ItemList.objects.all()

    # Pagination for menu items
    paginator = Paginator(items, 8) # Show 8 items per page
    page = request.GET.get('page')
    try:
        items = paginator.page(page)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)


    return render(request, 'Base_App/menu.html', {'items': items, 'list': list})


def BookTableView(request):
    success_message = None

    if request.method == 'POST':
        name = request.POST.get('user_name')
        phone_number = request.POST.get('phone_number')
        email = request.POST.get('user_email')
        total_person = request.POST.get('total_person')
        booking_date = request.POST.get('booking_date')
        special_requests = request.POST.get('special_requests', '')

        if name and len(phone_number) == 10 and email and total_person and booking_date:
            data = BookTable(Name=name, Phone_number=phone_number, Email=email, Total_person=total_person, Booking_date=booking_date, Special_requests=special_requests)
            data.save()
            success_message = "Your table has been booked successfully! We'll confirm shortly."

    return render(request, "Base_App/book_table.html", {'success_message': success_message})


def FeedbackView(request):
    success_message = None

    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.Post.get('email')
        phone = request.POST.get('phone')
        message = request.POST.get('message')
        rating = request.POST.get('rating')

        if name and email and message:
            feedback = Feedback(name=name, email=email, phone=phone, message=message, rating=rating)
            feedback.save()
            success_message = "Thank you for your feedback! We appreciate your input."


    return render(request, 'Base_App/feedback.html', {'success_message': success_message})


class RegisterView(View):
    """
    Handles User Registration
    GET: Displays Registration Form
    POST: Processes registration data and creates new user
    """
    template_name = 'registration/register.html'
    form_class = RegisterForm

    def get(self, request):
        """
        Redirect authenticated users away from registration page
        """
        if request.user.is_authenticated:
            return redirect('Home')
        form = self.form_class()
        return render(request, self.template_name, {'form': form})
    

    def post(self, request):
        """
        Validate form and create new user account
        """
        form = self.form_class(request.POST)
        if form.is_valid():
            user = form.save()
            # Create profile for new user
            Profile.objects.get_or_create(user=user)
            login(request, user)
            messages.success(request, "Registration Successful!")
            return redirect('Home')
        return render(request, self.template_name, {'form': form})
    


class LoginView(View):
    """
    Handles user authentication
    GET: Displays login form
    POST: Validates credentials and logs in User
    """
    template_name = 'registration/login.html'
    form_class = LoginForm

    def get(self, request):
        """
        Redirect authenticated users away from login page
        """
        if request.user.is_authenticated:
            return redirect('Home')
        form = self.form_class()
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        """
        Authenticate User and create session
        """
        form = self.form_class(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)

            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {username}!")
                return redirect('Home')
        return render(request, self.template_name, {'form': form})
    


def logout_view(request):
    """
    Handles user logout
    1. Ends User Session
    2. Displays logout message
    3. Redirects to home page
    """
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('Home')



@login_required
def profile(request):
    # Get or create a profile
    profile, created = Profile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=profile)

        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            messages.success(request, 'Your account has been updated!')
            return redirect('profile')
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=profile)

    context = {
        'u_form': u_form,
        'p_form': p_form
    }

    return render(request, 'registration/profile.html', context)

