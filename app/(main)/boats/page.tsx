'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedDiv from '@/components/AnimatedDiv';
import Icon from '@/components/Icon';
import { Button } from '@/components/Button';
import { BOATS } from '@/data/boats';

const BoatMap = dynamic(() => import('@/components/BoatMap'), { ssr: false });

export default function BoatsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available'>('available');

  const visibleBoats = filter === 'available' ? BOATS.filter((b) => b.status === 'available') : BOATS;

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <AnimatedDiv animation="fadeIn">
          <h1 className="text-3xl font-bold lg:text-4xl">Boats Available Today</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Local fishing boats and dhonis docked at Hulhumalé Phase 2 port. Most return from night fishing around 4am
            and are free for day trips — book direct, no middlemen.
          </p>
        </AnimatedDiv>

        {/* Filter */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setFilter('available')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'available' ? 'bg-highlight text-white' : 'border border-border text-muted hover:bg-secondary'
            }`}
          >
            Available ({BOATS.filter((b) => b.status === 'available').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-highlight text-white' : 'border border-border text-muted hover:bg-secondary'
            }`}
          >
            All ({BOATS.length})
          </button>
        </div>

        {/* Map */}
        <AnimatedDiv animation="fadeIn" delay={100} className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <BoatMap boats={visibleBoats} selectedBoatId={selectedId} onSelectBoat={setSelectedId} height={460} />
          </div>
        </AnimatedDiv>

        {/* Boat list */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleBoats.map((boat, i) => {
            const isSelected = boat.id === selectedId;
            return (
              <AnimatedDiv key={boat.id} animation="scaleIn" delay={50 + i * 30}>
                <div
                  onMouseEnter={() => setSelectedId(boat.id)}
                  className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-secondary transition-all ${
                    isSelected ? 'border-highlight shadow-md' : 'border-border hover:shadow-sm'
                  }`}
                >
                  <div className="relative h-44 w-full">
                    <Image src={boat.image} alt={boat.name} fill className="object-cover" />
                    <div className="absolute right-3 top-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          boat.status === 'available'
                            ? 'bg-green-500/90 text-white'
                            : boat.status === 'booked'
                            ? 'bg-gray-500/90 text-white'
                            : 'bg-gray-700/90 text-white'
                        }`}
                      >
                        {boat.status === 'available' ? 'Available' : boat.status === 'booked' ? 'Booked' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{boat.name}</h3>
                        <p className="text-sm text-muted">{boat.operator}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${boat.pricePerDayUsd}</div>
                        <div className="text-xs text-muted">/ day</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                      <span className="flex items-center gap-1"><Icon name="Users" size={14} /> {boat.capacity}</span>
                      <span className="flex items-center gap-1"><Icon name="Clock" size={14} /> {boat.durationHours}h</span>
                      <span className="flex items-center gap-1">
                        <Icon name="Star" size={14} color="#FFD700" /> {boat.rating}
                        <span className="text-xs">({boat.reviewCount})</span>
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-muted line-clamp-3">{boat.description}</p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {boat.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted">
                          {a}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => setSelectedId(boat.id)}
                        className="flex-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-background"
                      >
                        View on map
                      </button>
                      {boat.status === 'available' ? (
                        <Link
                          href={`/boats/${boat.id}/checkout`}
                          className="flex-1 rounded-full bg-highlight px-4 py-2 text-center text-sm font-semibold text-white hover:opacity-90"
                        >
                          Book now
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="flex-1 cursor-not-allowed rounded-full bg-gray-300 px-4 py-2 text-sm font-semibold text-white opacity-60"
                        >
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedDiv>
            );
          })}
        </div>

        {/* For boat owners CTA */}
        <AnimatedDiv animation="scaleIn" delay={400} className="mt-12">
          <div className="gradient-cta overflow-hidden rounded-2xl p-8 text-white shadow-lg lg:p-10">
            <div className="mb-4 flex items-center gap-3">
              <Icon name="Anchor" size={24} color="white" />
              <h2 className="text-2xl font-bold">Own a Boat? List It Here.</h2>
            </div>
            <p className="text-white/90 leading-relaxed max-w-2xl">
              Most small fishing boats sit idle from sunrise until evening. List your dhoni or speedboat with us and turn
              that downtime into revenue with day trips for tourists. Direct payouts via Stripe — no commission haggling.
            </p>
            <div className="mt-6">
              <Button
                href="/partners"
                title="Become an Operator"
                variant="ghost"
                rounded="full"
                className="border border-white/30 text-white hover:bg-white/10"
                iconEnd="ArrowRight"
              />
            </div>
          </div>
        </AnimatedDiv>
      </div>
    </div>
  );
}
