from django.contrib import admin
from Base_App.models import *
from django.utils import timezone

class OfferAdmin(admin.ModelAdmin):
    list_display = ('title', 'discount_percent', 'start_date', 'end_date', 'is_active', 'is_currently_active')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('title', 'description')
    filter_horizontal = ('items', 'categories')

    def is_currently_active(self, obj):
        return obj.is_currently_active()
    is_currently_active.boolean = True
    is_currently_active.short_description = 'Currently Active'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0  # No empty extra lines
    readonly_fields = ('item_name', 'original_price', 'final_price')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'final_total', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]
    readonly_fields = ('order_number', 'original_total', 'discount_amount', 'final_total')


admin.site.register(ItemList)
admin.site.register(Items)
admin.site.register(Offer, OfferAdmin)
admin.site.register(AboutUs)
admin.site.register(Feedback)
admin.site.register(BookTable)
admin.site.register(OrderItem)