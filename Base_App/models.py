from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from PIL import Image


class ItemList(models.Model):
    Category_name = models.CharField(max_length=15)

    def __str__(self):
        return self.Category_name
    

    
class Items(models.Model):
    Item_name = models.CharField(max_length=40)
    description = models.TextField(blank=False)
    Price = models.IntegerField()
    Category = models.ForeignKey(ItemList, related_name='Name', on_delete=models.CASCADE)
    Image = models.ImageField(upload_to='items/')

    def __str__(self):
        return self.Item_name
    


class AboutUs(models.Model):
    Description = models.TextField(blank=False)


class Feedback(models.Model):
    User_name = models.CharField(max_length=15)
    Description = models.TextField(blank=False)
    Rating = models.IntegerField()
    Image = models.ImageField(upload_to='items/', blank=True)


    def __str__(self):
        return self.User_name
    

class BookTable(models.Model):
    Name = models.CharField(max_length=15)
    Phone_number = models.IntegerField()
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

        img = Image.open(self.image.path)

        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)
