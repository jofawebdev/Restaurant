from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.contrib.auth.models import User
from PIL import Image

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
        Calculate total price of all items in the cart
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
        return self.quantity * self.item.Price
    


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
