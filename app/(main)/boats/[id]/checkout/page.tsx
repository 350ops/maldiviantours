'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import AnimatedDiv from '@/components/AnimatedDiv';
import Icon from '@/components/Icon';
import { Button } from '@/components/Button';
import { getBoatById, type Boat } from '@/data/boats';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function BoatCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const boatId = params?.id as string;
  const boat = getBoatById(boatId);

  const [guestCount, setGuestCount] = useState(2);
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);

  const total = boat ? boat.pricePerDayUsd : 0;
  const totalCents = Math.round(total * 100);

  useEffect(() => {
    if (!boat || totalCents < 50) return;
    setLoadingIntent(true);
    setClientSecret(null);
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalCents,
        currency: 'usd',
        description: `Boat charter — ${boat.name} (${boat.operator})`,
        metadata: { boatId: boat.id, guests: String(guestCount), date },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        setLoadingIntent(false);
      })
      .catch(() => setLoadingIntent(false));
  }, [boat, totalCents, guestCount, date]);

  if (!boat) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Boat not found</h2>
          <Button href="/boats" title="See available boats" variant="outline" className="mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
        <AnimatedDiv animation="fadeIn">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <Icon name="ArrowLeft" size={16} /> Back to boats
          </button>
          <h1 className="text-2xl font-bold lg:text-3xl">Book {boat.name}</h1>
        </AnimatedDiv>

        <AnimatedDiv animation="fadeIn" delay={100} className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
            <div className="relative h-48 w-full">
              <Image src={boat.image} alt={boat.name} fill className="object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{boat.name}</h3>
                  <p className="text-sm text-muted">
                    {boat.operator} · up to {boat.capacity} guests
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${boat.pricePerDayUsd}</div>
                  <div className="text-xs text-muted">full day</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{boat.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {boat.amenities.map((a) => (
                  <span key={a} className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedDiv>

        <AnimatedDiv animation="fadeIn" delay={150} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Guests</label>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight"
            >
              {Array.from({ length: boat.capacity }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} guest{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </AnimatedDiv>

        <AnimatedDiv animation="fadeIn" delay={200} className="mt-6">
          <div className="rounded-2xl border border-border bg-secondary p-5">
            <h3 className="mb-3 font-semibold">Price details</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Full-day charter</span>
              <span>${boat.pricePerDayUsd}</span>
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total}</span>
              </div>
              <div className="mt-1 text-xs text-muted">
                Pickup at Hulhumalé Phase 2 port from {boat.availableFrom}.
              </div>
            </div>
          </div>
        </AnimatedDiv>

        <AnimatedDiv animation="scaleIn" delay={250} className="mt-6">
          {loadingIntent && (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-border p-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-highlight border-t-transparent" />
              <span className="ml-3 text-muted">Preparing checkout...</span>
            </div>
          )}

          {!loadingIntent && clientSecret && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: { borderRadius: '12px', fontFamily: 'Outfit, system-ui, sans-serif' },
                },
              }}
            >
              <BoatCheckoutForm boat={boat} total={total} />
            </Elements>
          )}

          {!loadingIntent && !clientSecret && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-muted">Unable to initialize payment. Please try again.</p>
              <Button
                title="Retry"
                variant="outline"
                rounded="xl"
                className="mt-4"
                onPress={() => window.location.reload()}
              />
            </div>
          )}
        </AnimatedDiv>

        <p className="mt-4 text-center text-xs text-muted">Free cancellation up to 24 hours before pickup.</p>
      </div>
    </div>
  );
}

function BoatCheckoutForm({ boat, total }: { boat: Boat; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [expressReady, setExpressReady] = useState(false);

  const onExpressConfirm = useCallback(async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage('');
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/booking/success?boat=${boat.id}` },
    });
    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  }, [stripe, elements, boat.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage('');
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success?boat=${boat.id}`,
        payment_method_data: {
          billing_details: { name: name || undefined, email: email || undefined },
        },
      },
    });
    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <ExpressCheckoutElement
          onConfirm={onExpressConfirm}
          onReady={({ availablePaymentMethods }) => {
            if (availablePaymentMethods) setExpressReady(true);
          }}
          options={{ buttonType: { applePay: 'book', googlePay: 'book' }, buttonHeight: 52 }}
        />
      </div>

      {expressReady && (
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">or pay with card</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight"
          />
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">
            <Icon name="AlertCircle" size={16} />
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full rounded-full bg-highlight py-4 text-center text-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </span>
          ) : (
            `Pay $${total}`
          )}
        </button>
      </form>
    </div>
  );
}
