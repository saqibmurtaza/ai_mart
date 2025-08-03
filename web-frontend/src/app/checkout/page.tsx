'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { checkout, CartItem } from '@/lib/api'; // Ensure CartItem is imported here

export default function CheckoutPage() {
  // Use 'cart' instead of 'cartItems'
  const { cart, cartTotal, loadingCart, errorCart, removeItemFromCart, addItemToCart, updateItemQuantity } = useCart();
  const router = useRouter();

  // You can later add clearCart() in context and call it here if you want to clear cart after checkout
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof formData>>({});

  // Guest user assumed for now
  const user = { id: 'guest' };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors: Partial<typeof formData> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Valid email is required.';
    if (!formData.addressLine1.trim()) errors.addressLine1 = 'Address is required.';
    if (!formData.city.trim()) errors.city = 'City is required.';
    if (!formData.state.trim()) errors.state = 'State is required.';
    if (!formData.zipCode.trim()) errors.zipCode = 'Zip code is required.';
    if (!formData.country.trim()) errors.country = 'Country is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix form errors before submitting.');
      return;
    }

    setIsProcessing(true);
    const shippingAddressString = [
      formData.fullName,
      formData.addressLine1,
      `${formData.city}, ${formData.state} ${formData.zipCode}`,
      formData.country,
    ].filter(Boolean).join(', ');

    const orderPayload = {
      user_id: user.id,
      email: formData.email,
      shipping_address: shippingAddressString,
      cart_items: cart.map((item: CartItem) => ({
        user_id: item.user_id,        // <-- Added user_id as required by backend
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        imageUrl: item.imageUrl,
        slug: item.slug,
        sku: item.sku,
      })),
    };

    try {
      const result = await checkout(orderPayload);
      toast.success(`Order placed successfully! Order ID: ${result.order_id}`);

      // Optionally clear cart here if you add `clearCart()` in useCart context

      router.push(`/orders`);
    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast.error(`Failed to process checkout: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingCart) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    );
  }

  if (errorCart) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load cart for checkout: {errorCart}</p>
        <Link href="/cart" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Cart
        </Link>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p>Please add items to your cart before checking out.</p>
        <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Order</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                name="fullName"
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className={`input input-bordered w-full ${formErrors.fullName ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.fullName && <p className="text-red-500 text-sm">{formErrors.fullName}</p>}
            </div>
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`input input-bordered w-full ${formErrors.email ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
            </div>
            <div>
              <input
                name="addressLine1"
                type="text"
                placeholder="Address Line 1"
                value={formData.addressLine1}
                onChange={handleChange}
                className={`input input-bordered w-full ${formErrors.addressLine1 ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.addressLine1 && <p className="text-red-500 text-sm">{formErrors.addressLine1}</p>}
            </div>
            <div>
              <input
                name="city"
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className={`input input-bordered w-full ${formErrors.city ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.city && <p className="text-red-500 text-sm">{formErrors.city}</p>}
            </div>
            <div>
              <input
                name="state"
                type="text"
                placeholder="State/Province"
                value={formData.state}
                onChange={handleChange}
                className={`input input-bordered w-full ${formErrors.state ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.state && <p className="text-red-500 text-sm">{formErrors.state}</p>}
            </div>
            <div>
              <input
                name="zipCode"
                type="text"
                placeholder="Zip/Postal Code"
                value={formData.zipCode}
                onChange={handleChange}
                className={`input input-bordered w-full ${formErrors.zipCode ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.zipCode && <p className="text-red-500 text-sm">{formErrors.zipCode}</p>}
            </div>
            <div>
              <input
                name="country"
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                className={`input input-bordered w-full ${formErrors.country ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.country && <p className="text-red-500 text-sm">{formErrors.country}</p>}
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={isProcessing}
            >
              {isProcessing ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
          <div className="space-y-4">
            {cart.map((item: CartItem) => (
              <div key={item.product_id} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-lg" />
                  )}
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="divider my-6"></div>
          <div className="flex justify-between text-xl font-bold">
            <span>Order Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <Link href="/cart" className="btn btn-ghost w-full mt-4">
            Edit Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
