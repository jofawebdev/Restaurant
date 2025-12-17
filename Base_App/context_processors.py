from Base_App.models import Items

def cart_summary(request):
    """
    Custom context processor to provide global cart summary
    (Item count and total price) for all templates.
    """
    cart = request.session.get('cart', {}) # {item_id: quantity}
    total_items = sum(cart.values())
    total_price = 0

    for item_id, qty in cart.items():
        try:
            item = Items.objects.get(id=item_id)
            total_price += item.Price * qty
        except Items.DoesNotExist:
            continue # skip missing items


    return {
        'cart_item_count': total_items,
        'cart_total_price': total_price,
    }