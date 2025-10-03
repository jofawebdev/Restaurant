# Base_App/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from django.db import transaction
from .forms import RegisterForm, LoginForm, UserUpdateForm, ProfileUpdateForm, CheckoutForm
from Base_App.models import BookTable, AboutUs, Feedback, ItemList, Items, Profile, Offer, Order, OrderItem


# =========================
# Home Page View
# =========================
def HomeView(request):
    items = Items.objects.all()
    categories = ItemList.objects.all()
    reviews = Feedback.objects.all()

    # Get active offers
    now = timezone.now()
    active_offers = Offer.objects.filter(
        start_date__lte=now,
        end_date__gte=now,
        is_active=True
    )

    return render(
        request,
        'Base_App/home.html',
        {
            'items': items,
            'categories': categories,
            'review': reviews,
            'offers': active_offers,
        },
    )


# =========================
# About Page View
# =========================
def AboutView(request):
    data = AboutUs.objects.all()

    # Handle case when no AboutUs entries exist
    # (template should display fallback if data is empty)
    return render(request, 'Base_App/about.html', {'data': data})


# =========================
# Menu Page View
# Supports filtering by category (via ?category=slug)
# and paginates menu items (8 items per page).
# =========================
def MenuView(request):
    categories = ItemList.objects.all()

    # Get current category if filter applied
    category_slug = request.GET.get('category')
    current_category = None
    items_qs = Items.objects.all()

    if category_slug:
        current_category = get_object_or_404(ItemList, slug=category_slug)
        items_qs = items_qs.filter(Category=current_category)

    # Get active offers to display discount badges
    now = timezone.now()
    active_offers = Offer.objects.filter(
        start_date__lte=now,
        end_date__gte=now,
        is_active=True
    )

    # Annotate items with their discounted prices
    for item in items_qs:
        item.discounted_price = item.get_discounted_price()
        item.has_discount = item.discounted_price != item.Price

    # Pagination: 8 items per page
    paginator = Paginator(items_qs, 8)
    page_number = request.GET.get('page')

    try:
        items = paginator.page(page_number)
    except PageNotAnInteger:
        items = paginator.page(1)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)

    return render(
        request,
        'Base_App/menu.html',
        {
            'categories': categories,
            'items': items,
            'current_category': current_category,
            'paginate': True,  # Template flag to render pagination controls
            'offers': active_offers,
        },
    )


# =========================
# Book Table View
# Handles POST form submissions for booking
# =========================
def BookTableView(request):
    success_message = None

    if request.method == 'POST':
        name = request.POST.get('user_name')
        phone_number = request.POST.get('phone_number')
        email = request.POST.get('user_email')
        total_person = request.POST.get('total_person')
        booking_date = request.POST.get('booking_date')
        special_requests = request.POST.get('special_requests', '')

        # Basic validation before saving
        if (
            name
            and len(phone_number) == 10
            and email
            and total_person
            and booking_date
        ):
            BookTable.objects.create(
                Name=name,
                Phone_number=phone_number,
                Email=email,
                Total_person=total_person,
                Booking_date=booking_date,
                Special_requests=special_requests,
            )
            success_message = "Your table has been booked successfully! We'll confirm shortly."

    return render(
        request,
        "Base_App/book_table.html",
        {'success_message': success_message},
    )


# =========================
# Feedback View
# Handles user feedback submissions
# =========================
def FeedbackView(request):
    success_message = None

    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        message = request.POST.get('message')
        rating = request.POST.get('rating')

        if name and email and message:
            Feedback.objects.create(
                User_name=name,
                Email=email,
                Phone_number=phone,
                Message=message,
                Rating=rating,
            )
            success_message = "Thank you for your feedback! We appreciate your input."

    return render(
        request,
        'Base_App/feedback.html',
        {'success_message': success_message},
    )


# =========================
# User Registration View
# =========================
class RegisterView(View):
    """
    Handles User Registration
    GET: Displays registration form
    POST: Processes registration data and creates new user
    """

    template_name = 'registration/register.html'
    form_class = RegisterForm

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('Home')
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            user = form.save()
            # Create profile for new user
            Profile.objects.get_or_create(user=user)
            login(request, user)
            messages.success(request, "Registration Successful!")
            return redirect('Home')
        return render(request, self.template_name, {'form': form})


# =========================
# User Login View
# =========================
class LoginView(View):
    """
    Handles user authentication
    GET: Displays login form
    POST: Validates credentials and logs in user
    """

    template_name = 'registration/login.html'
    form_class = LoginForm

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('Home')
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
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


# =========================
# User Logout View
# =========================
def logout_view(request):
    """
    Handles user logout
    - Ends user session
    - Displays logout message
    - Redirects to home page
    """
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('Home')


# =========================
# User Profile View
# Protected by login_required
# Allows updating of user and profile details
# =========================
@login_required
def profile(request):
    """
    Displays and updates user profile.
    """
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

    return render(
        request,
        'registration/profile.html',
        {
            'u_form': u_form,
            'p_form': p_form,
        },
    )


# CART FUNCTIONALITY (Session-based)
def add_to_cart(request, item_id):
    """
    Add an item to the session cart.
    - If already in cart, increment quantity.
    - Otherwise, add new item.
    """
    item = get_object_or_404(Items, id=item_id)

    cart = request.session.get('cart', {})
    cart[str(item_id)] = cart.get(str(item_id), 0) + 1

    request.session['cart'] = cart
    request.session.modified = True

    messages.success(request, f"{item.Item_name} added to your cart.")
    return redirect('Menu')

def view_cart(request):
    """
    Displays all items currently in the user's session cart.

    - Fetches cart from session (dict {item_id: quantity}).
    - Builds a list of cart items with details, quantity, and subtotal.
    - Calculates the cart total with discounts applied.
    """
    cart = request.session.get('cart', {})  # session cart: {"1": 2, "3": 1}
    cart_items = []
    cart_total = 0
    original_total = 0
    total_discount = 0

    # Loop through cart items stored in session
    for item_id, quantity in cart.items():
        try:
            item = Items.objects.get(id=item_id)  # get product details
            original_price = item.Price
            discounted_price = item.get_discounted_price()
            subtotal = discounted_price * quantity
            original_subtotal = original_price * quantity
            item_discount = original_subtotal - subtotal

            cart_items.append({
                'item': item,
                'quantity': quantity,
                'subtotal': subtotal,
                'original_price': original_price,
                'discounted_price': discounted_price,
                'has_discount': discounted_price != original_price,
                'item_discount': item_discount
            })

            cart_total += subtotal
            original_total += original_subtotal
            total_discount += item_discount

        except Items.DoesNotExist:
            continue  # skip items that no longer exist in DB

    context = {
        'cart_items': cart_items,
        'cart_total': cart_total,
        'original_total': original_total,
        'total_discount': total_discount,
        'cart_item_count': len(cart_items),
    }
    return render(request, 'Base_App/view_cart.html', context)


def update_cart(request, item_id):
    """
    Update quantity or remove item from the cart.
    - If quantity is set to 0 → item removed.
    """
    if request.method == 'POST':
        new_qty = int(request.POST.get('quantity', 1))
        cart = request.session.get('cart', {})

        if str(item_id) in cart:
            if new_qty > 0:
                cart[str(item_id)] = new_qty
                messages.success(request, "Cart updated successfully.")
            else:
                del cart[str(item_id)]
                messages.info(request, "Item removed from your cart.")

        request.session['cart'] = cart
        request.session.modified = True

    return redirect('view_cart')


# Checkout Functionality Views
@login_required
def checkout_view(request):
    """
    Handle the checkout process - display form and process order creation
    """
    # Get cart from session
    cart = request.session.get('cart', {})
    
    # Check if cart is empty
    if not cart:
        messages.warning(request, "Your cart is empty. Please add items before checkout.")
        return redirect('view_cart')
    
    # Calculate cart totals
    cart_items = []
    cart_total = 0
    original_total = 0
    
    for item_id, quantity in cart.items():
        try:
            item = Items.objects.get(id=item_id)
            discounted_price = item.get_discounted_price()
            subtotal = discounted_price * quantity
            
            cart_items.append({
                'item': item,
                'quantity': quantity,
                'subtotal': subtotal,
                'discounted_price': discounted_price,
            })
            
            cart_total += subtotal
            original_total += item.Price * quantity
            
        except Items.DoesNotExist:
            continue
    
    # If user is authenticated, pre-fill form with user data
    initial_data = {}
    if request.user.is_authenticated:
        initial_data = {
            'customer_name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
            'customer_email': request.user.email,
        }
    
    if request.method == 'POST':
        form = CheckoutForm(request.POST, initial=initial_data)
        
        if form.is_valid():
            try:
                # Use transaction to ensure data consistency
                with transaction.atomic():
                    # Create order
                    order = form.save(commit=False)
                    if request.user.is_authenticated:
                        order.user = request.user
                    
                    # Save order first to get ID
                    order.save()
                    
                    # Create order items
                    for cart_item in cart_items:
                        OrderItem.objects.create(
                            order=order,
                            item=cart_item['item'],
                            quantity=cart_item['quantity'],
                            original_price=cart_item['item'].Price,
                            final_price=cart_item['discounted_price'],
                            item_name=cart_item['item'].Item_name
                        )
                    
                    # Calculate and save final totals
                    order.calculate_totals()
                    
                    # Clear the cart session
                    request.session['cart'] = {}
                    request.session.modified = True
                    
                    # Success message
                    messages.success(
                        request, 
                        f"Order placed successfully! Your order number is #{order.order_number}. "
                        f"We'll contact you at {order.customer_phone} for confirmation."
                    )
                    
                    # Redirect to order confirmation page
                    return redirect('order_confirmation', order_id=order.id)
                    
            except Exception as e:
                # Log the error (in production, use proper logging)
                print(f"Error creating order: {e}")
                messages.error(
                    request, 
                    "There was an error processing your order. Please try again or contact support."
                )
                # Don't clear cart on error
                
    else:
        form = CheckoutForm(initial=initial_data)
    
    context = {
        'form': form,
        'cart_items': cart_items,
        'cart_total': cart_total,
        'original_total': original_total,
        'total_discount': original_total - cart_total,
    }
    
    return render(request, 'Base_App/checkout.html', context)


def order_confirmation(request, order_id):
    """
    Display order confirmation page after successful checkout
    """
    order = get_object_or_404(Order, id=order_id)

    # Additional security: if user is logged in, verify they own this order
    if request.user.is_authenticated and order.user != request.user:
        messages.error(request, "You don't have permission to view this order")
        return redirect('Home')
    
    context = {
        'order': order,
        'order_items': order.orderitem_set.all(),
    }

    return render(request, 'Base_App/order_confirmation.html', context)


@login_required
def order_history(request):
    """
    Display order history for logged-in users
    """
    orders = Order.objects.filter(user=request.user).order_by('-created_at')

    context = {
        'orders': orders,
    }

    return render(request, 'Base_App/order_history.html', context)


@login_required
def order_detail(request, order_id):
    """
    Display detailed view of a specific order
    """
    order = get_object_or_404(Order, id=order_id, user=request.user)

    context = {
        'order': order,
        'order_items': order.orderitem_set.all(),
    }

    return render(request, 'Base_App/order_detail.html', context)