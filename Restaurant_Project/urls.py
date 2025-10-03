"""
URL configuration for Restaurant_Project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from Base_App.views import *

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Core Pages
    path('', HomeView, name="Home"), # Home Page
    path('book_table', BookTableView, name="Book_Table"), # Table Booking Form
    path('menu/', MenuView, name="Menu"), # Menu (food items list)
    path('about', AboutView, name="About"), # About Us Page
    path('feedback', FeedbackView, name="Feedback_Form"), # Feedback Form

    # View for User Profile
    path('profile/', profile, name='profile'),

    # User Authentication URLs (Login, Register, Logout, Password Reset)
    path('register/', RegisterView.as_view(), name='register'), # User Registration
    
    path('login/', LoginView.as_view(), name='login'), # User Login

    path('logout/', logout_view, name='logout'), # User Logout
    
    # Cart Functionality
    path('cart/', view_cart, name="view_cart"), # View cart contents
    path('cart/add/<int:item_id>/', add_to_cart, name="add_to_cart"), # Add item to cart
    path('cart/update/<int:item_id>/', update_cart, name="update_cart"), # Update item qty / remove

    # Order and Checkout URLs
    path('checkout/', checkout_view, name="checkout"),
    path('order/confirmation/<int:order_id>/', order_confirmation, name="order_confirmation"),
    path('order/history/', order_history, name="order_history"),
    path('order/detail/<int:order_id>/', order_detail, name="order_detail"),
]

# Serve media & static files during development 
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

