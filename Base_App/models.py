from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.contrib.auth.models import User
from PIL import Image
from django.core.validators import MinValueValidator, MaxValueValidator

# Category list for items (e.g., burger, pasta, sandwich)
class ItemList(models.Model):
    Category_name = models.CharField(max_length=50, unique=True)
    # slug is used for safe CSS classes and URLS (no spaces/special chars)
    slug = models.SlugField(max_length=60, unique=True)

    def __str__(self):
        return self.Category_name
    
    def save(self, *args, **kwargs):
        """
        Ensure a slug exists and is unique-ish before saving.
        Uses django.utils.text.slugify to make a CSS/URL-safe string.
        """
        if not self.slug:
            base = slugify(self.Category_name)
            slug = base
            # If collision, append a numeric suffix
            counter = 1
            while ItemList.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    

# Single menu item model     
class Items(models.Model):
    Item_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    Price = models.DecimalField(max_digits=8, decimal_places=2)
    # Use a ForeignKey to ItemList. related_name changed to 'items' for readability.
    Category = models.ForeignKey(ItemList, related_name='items', on_delete=models.CASCADE)
    Image = models.ImageField(upload_to='items/', blank=True, null=True)

    def __str__(self):
        return self.Item_name

    def get_discounted_price(self):
        """
        Calculate discounted price if item is on offer
        Returns original price if no active offer exists
        """
        now = timezone.now()
        # Get active offers for this item
        active_offers = self.offers.filter(
            start_date__lte=now,
            end_date__gte=now,
            is_active=True
        )

        if active_offers.exists():
            # Get the offer with highest discount (assuming multiple offers shouldn't overlap)
            best_offer = active_offers.order_by('-discount_percent').first()
            discount_amount = (self.Price * best_offer.discount_percent) / 100
            return self.Price - discount_amount
        return self.Price
    

# Offer Model
class Offer(models.Model):
    """
    Model for storing promotional ofers
    """
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    items = models.ManyToManyField(Items, related_name='offers', blank=True)
    categories = models.ManyToManyField(ItemList, related_name='offers', blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='offers/', blank=True, null=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.title} - {self.discount_percent}% Off"

    def is_currently_active(self):
        """
        Check if offer is currently active
        """
        now = timezone.now()
        return self.start_date <= now <= self.end_date and self.is_active
    
    def get_discounted_price(self, original_price):
        """
        Calculate discounted price for any item
        """
        discount_amount = (original_price * self.discount_percent) / 100
        return original_price - discount_amount




# Cart Models
class Cart(models.Model):
    """
    A Cart belongs to a user (if logged in).
    For anonymous users, we will use sessions (not persisted here)
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"
    
    def total_price(self):
        """
        Calculate total price of all items in the cart with discounts applied
        """
        return sum(item.subtotal() for item in self.items.all())
    


class CartItem(models.Model):
    """
    Represents a single menu item inside a cart
    """
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    item = models.ForeignKey(Items, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "item") # Prevent duplicates

    def __str__(self):
        return f"{self.quantity} x {self.item.Item_name}"    

    def subtotal(self):
        # Use discounted price if available
        return self.quantity * self.item.get_discounted_price()



class Order(models.Model):
    """
    Model to store order information including customer details and order status
    """
    # Order status choices
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready for Pickup/Delivery'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    # Payment status choices
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    # Order Information
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    # Customer Information
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=15)
    customer_address = models.TextField(blank=True, null=True)
    special_instructions = models.TextField(blank=True, null=True)

    # Order Details
    items = models.ManyToManyField(Items, through='OrderItem')
    original_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Status and timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} - {self.customer_name}"
    
    def save(self, *args, **kwargs):
        """
        Generate unique order number before saving if it's a new order
        Format: ORDYYYYMMDDXXXX (Where XXXX is sequential number)
        """
        if not self.order_number:
            today = timezone.now().strftime('%Y%m%d')
            last_order = Order.objects.filter(
                order_number__startswith=f'ORD{today}'
            ).order_by('-order_number').first()

            if last_order:
                last_num = int(last_order.order_number[-4:])
                new_num = last_num + 1
            else:
                new_num = 1

            self.order_number = f'ORD{today}{new_num:04d}'

        super().save(*args, **kwargs)

    
    def calculate_totals(self):
        """
        Calculate order totals based on order itesms
        """
        order_items = self.orderitem_set.all()
        self.original_total = sum(item.original_price * item.quantity for item in order_items)
        self.final_total = sum(item.final_price * item.quantity for item in order_items)
        self.discount_amount = self.original_total - self.final_total
        self.save()


class OrderItem(models.Model):
    """
    Intermediate model to store items belonging to an order with their prices at time of order.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    item = models.ForeignKey(Items, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    original_price = models.DecimalField(max_digits=8, decimal_places=2)
    final_price = models.DecimalField(max_digits=8, decimal_places=2)
    item_name = models.CharField(max_length=100) # Store item name at time of order

    class Meta:
        unique_together = ('order', 'item')

    def __str__(self):
        return f"{self.quantity} x {self.item_name} (Order # {self.order.order_number})"
    

    def save(self, *args, **kwargs):
        """
        Store item name and prices when saving
        """
        if not self.item_name:
            self.item_name = self.item.Item_name
        if not self.original_price:
            self.original_price = self.item.Price
        if not self.final_price:
            self.final_price = self.item.get_discounted_price()

        super().save(*args, **kwargs)

    def subtotal(self):
        return self.final_price * self.quantity

    


class AboutUs(models.Model):
    Description = models.TextField(blank=False)


class Feedback(models.Model):
    User_name = models.CharField(max_length=50)
    Description = models.TextField(blank=False)
    Rating = models.IntegerField()
    Image = models.ImageField(upload_to='items/', blank=True)

    def __str__(self):
        return self.User_name
    

class BookTable(models.Model):
    Name = models.CharField(max_length=50)
    Phone_number = models.CharField(max_length=20) # Store as char to preserve formatting
    Email = models.EmailField()
    Total_person = models.IntegerField()
    Booking_date = models.DateField()

    def __str__(self):
        return self.Name
    

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='default.jpg', upload_to='profile_pics', help_text="Upload a profile picture (300x300 recommended)")

    def __str__(self):
        return f'{self.user.username} Profile'
    

    def save(self, *args, **kwargs):
        # Call the original save() method with all parameters.
        super().save(*args, **kwargs)
        
        try:
            img = Image.open(self.image.path)
        except Exception:
            return

        # Resize large images to a max of 300x300
        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)
