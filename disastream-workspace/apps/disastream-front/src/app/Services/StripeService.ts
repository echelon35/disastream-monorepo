import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripePromise = loadStripe('pk_live_51QQbQgLvieZJRKCkUtGXIpzSg3N1EA61EwY4jIL4vxROUkVMgq0qTvNea6qXMrltmdODiSf4QaVa2UDpiWyfOfCt00LLdr3uby');

  constructor(private http: HttpClient) {}

  async initiatePayment(amount: number, currency: string) {
    const stripe = await this.stripePromise;
    const paymentIntent = await this.http.post('/api/stripe/create-payment-intent', { amount, currency }).toPromise();

    if (stripe && paymentIntent) {
      await (stripe as any).redirectToCheckout({ sessionId: paymentIntent!['id'] });
    }
  }
}
