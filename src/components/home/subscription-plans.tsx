'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/context';
import { subscriptionOptionsData, SubscriptionOption } from '@/data/subscription-plans';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { Check, Sparkles, ArrowRight, X, ShieldCheck } from 'lucide-react';

export function SubscriptionPlans() {
  const { t, isKannada } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionOption | null>(null);
  const [isReservedSuccess, setIsReservedSuccess] = useState(false);
  const [selectedLanguagePref, setSelectedLanguagePref] = useState<'bilingual' | 'kannada' | 'english'>('bilingual');
  const [collectorName, setCollectorName] = useState('');
  const [collectorEmail, setCollectorEmail] = useState('');

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectorName || !collectorEmail) return;
    setIsReservedSuccess(true);
  };

  const closeModal = () => {
    setSelectedPlan(null);
    setIsReservedSuccess(false);
    setCollectorName('');
    setCollectorEmail('');
  };

  return (
    <section id="subscription" className="py-20 md:py-28 bg-canvas-warm/40 border-b border-border">
      <Container width="wide" className="space-y-16">
        <SectionHeading
          eyebrow={t.subscription.eyebrow}
          title={t.subscription.title}
          kannadaTitle={isKannada ? undefined : t.subscription.kannadaTitle}
          description={t.subscription.description}
          align="center"
        />

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {subscriptionOptionsData.map((plan) => {
            const isPopular = plan.isPopular;

            return (
              <Card
                key={plan.id}
                variant={isPopular ? 'elevated' : 'bordered'}
                className={`p-8 flex flex-col justify-between relative ${
                  isPopular
                    ? 'border-terracotta-500/80 ring-1 ring-terracotta-500/30 bg-canvas-card'
                    : 'bg-canvas-card/80'
                }`}
              >
                {/* Popular or Savings Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="terracotta" className="shadow-subtle">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isKannada ? plan.badgeKn : plan.badgeEn}
                    </Badge>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Cadence */}
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-espresso-dark">
                      {isKannada ? plan.nameKn : plan.nameEn}
                    </h3>
                    <p className="text-xs text-espresso-soft mt-1">
                      {isKannada ? plan.cadenceKn : plan.cadenceEn}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-4xl sm:text-5xl font-bold text-espresso-dark">
                        {formatINR(plan.priceInr)}
                      </span>
                      {plan.originalPriceInr && (
                        <span className="text-sm line-through text-espresso-soft font-sans">
                          {formatINR(plan.originalPriceInr)}
                        </span>
                      )}
                      <span className="text-xs text-espresso-soft font-sans">
                        / {plan.type === 'recurring' ? t.subscription.perMonth : (isKannada ? 'ಪೆಟ್ಟಿಗೆ' : 'parcel')}
                      </span>
                    </div>

                    {plan.savingsBadgeEn && (
                      <span className="inline-block text-[11px] font-semibold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-paper border border-sage-200">
                        {isKannada ? plan.savingsBadgeKn : plan.savingsBadgeEn}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-espresso-muted leading-relaxed font-sans">
                    {isKannada ? plan.summaryKn : plan.summaryEn}
                  </p>

                  {/* Features List */}
                  <div className="space-y-3 pt-4 border-t border-border-subtle">
                    <p className="text-xs font-semibold uppercase tracking-wider text-espresso-soft">
                      {isKannada ? 'ಪೆಟ್ಟಿಗೆಯ ಮುಖ್ಯಾಂಶಗಳು:' : 'Parcel Inclusions:'}
                    </p>
                    <ul className="space-y-2.5 text-xs text-espresso-muted">
                      {(isKannada ? plan.featuresKn : plan.featuresEn).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-8 space-y-2">
                  <Button
                    variant={isPopular ? 'primary' : 'outline'}
                    size="md"
                    className="w-full"
                    onClick={() => setSelectedPlan(plan)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {plan.type === 'recurring'
                      ? t.subscription.reserveButton
                      : t.subscription.inquiryButton}
                  </Button>
                  <p className="text-[11px] text-center text-espresso-soft">
                    {isKannada ? 'ಯಾವುದೇ ಮುಂಗಡ ಶುಲ್ಕವಿಲ್ಲದೆ ಕಾಯ್ದಿರಿಸಿ' : 'Reserve intent with zero upfront risk'}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Reassurance Banner */}
        <div className="p-6 rounded-warm bg-canvas-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-espresso-muted">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-sage-700 shrink-0" />
            <span>{t.subscription.noCommitmentNote}</span>
          </div>
          <span className="text-espresso-soft font-mono">
            {isKannada ? 'ಬೆಂಗಳೂರು ಅಂಚೆ ವಿಭಾಗ' : 'Bengaluru Postal Desk'}
          </span>
        </div>

        {/* Reservation Dialog (No fake payment, clean collector registration) */}
        {selectedPlan && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-dark/60 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-title"
          >
            <div className="bg-canvas-card border border-border rounded-warm max-w-md w-full p-6 sm:p-8 shadow-elevated space-y-6">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-terracotta-600">
                    {isKannada ? 'ಪೆಟ್ಟಿಗೆ ಕಾಯ್ದಿರಿಸುವಿಕೆ' : 'Reserve Your Edition'}
                  </span>
                  <h3 id="reservation-title" className="font-serif text-2xl text-espresso-dark font-medium mt-0.5">
                    {isKannada ? selectedPlan.nameKn : selectedPlan.nameEn}
                  </h3>
                  <p className="text-xs text-espresso-soft">
                    {formatINR(selectedPlan.priceInr)} · {isKannada ? selectedPlan.cadenceKn : selectedPlan.cadenceEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1 rounded-paper text-espresso-muted hover:text-espresso-main hover:bg-canvas-paper border border-border"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isReservedSuccess ? (
                <form onSubmit={handleReserveSubmit} className="space-y-4">
                  {/* Language Preference Choice */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-espresso-dark uppercase tracking-wider block">
                      {isKannada ? 'ಕಥನ ಪತ್ರದ ಭಾಷೆ ಆರಿಸಿ:' : 'Select Story Letter Language:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLanguagePref('bilingual')}
                        className={`px-2.5 py-2 text-xs rounded-paper border transition-colors ${
                          selectedLanguagePref === 'bilingual'
                            ? 'bg-terracotta-50 border-terracotta-500 text-terracotta-800 font-semibold'
                            : 'bg-canvas-paper border-border text-espresso-muted'
                        }`}
                      >
                        {isKannada ? 'ದ್ವಿಭಾಷಾ (KN+EN)' : 'Bilingual (KN+EN)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLanguagePref('kannada')}
                        className={`px-2.5 py-2 text-xs rounded-paper border font-kannada transition-colors ${
                          selectedLanguagePref === 'kannada'
                            ? 'bg-terracotta-50 border-terracotta-500 text-terracotta-800 font-semibold'
                            : 'bg-canvas-paper border-border text-espresso-muted'
                        }`}
                      >
                        ಕನ್ನಡ ಮಾತ್ರ
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLanguagePref('english')}
                        className={`px-2.5 py-2 text-xs rounded-paper border transition-colors ${
                          selectedLanguagePref === 'english'
                            ? 'bg-terracotta-50 border-terracotta-500 text-terracotta-800 font-semibold'
                            : 'bg-canvas-paper border-border text-espresso-muted'
                        }`}
                      >
                        English Only
                      </button>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-espresso-main block">
                      {isKannada ? 'ನಿಮ್ಮ ಹೆಸರು' : 'Your Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={collectorName}
                      onChange={(e) => setCollectorName(e.target.value)}
                      placeholder={isKannada ? 'ಉದಾ: ಕಾವ್ಯ ಹೆಗಡೆ' : 'e.g. Kavya Hegde'}
                      className="w-full text-sm px-3.5 py-2.5 rounded-paper border border-border bg-canvas text-espresso-main placeholder:text-espresso-faint focus:outline-none focus:ring-1 focus:ring-terracotta-600 focus:border-terracotta-600"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-espresso-main block">
                      {isKannada ? 'ಇಮೇಲ್ ವಿಳಾಸ' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={collectorEmail}
                      onChange={(e) => setCollectorEmail(e.target.value)}
                      placeholder="kavya@example.com"
                      className="w-full text-sm px-3.5 py-2.5 rounded-paper border border-border bg-canvas text-espresso-main placeholder:text-espresso-faint focus:outline-none focus:ring-1 focus:ring-terracotta-600 focus:border-terracotta-600"
                    />
                  </div>

                  <p className="text-[11px] text-espresso-soft leading-normal">
                    {isKannada
                      ? 'ಇದು ಪೂರ್ವನೋಂದಣಿ ಮಾತ್ರ. ಮುಂಬರುವ ಸಂಚಿಕೆ ಸಿದ್ಧವಾದಾಗ ನಿಮ್ಮ ವಿಳಾಸ ಮತ್ತು ಸುರಕ್ಷಿತ ಪಾವತಿ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗುವುದು.'
                      : 'This reserves your allocation for the upcoming edition. You will receive an invitation link with delivery address confirmation upon release.'}
                  </p>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="md" className="w-full">
                      {isKannada ? 'ನನ್ನ ಪೆಟ್ಟಿಗೆ ಕಾಯ್ದಿರಿಸಿ' : 'Confirm Allocation'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center mx-auto border border-sage-200">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-2xl font-semibold text-espresso-dark">
                      {isKannada ? 'ಧನ್ಯವಾದಗಳು!' : 'Allocation Reserved!'}
                    </h4>
                    <p className="text-sm text-espresso-muted">
                      {isKannada
                        ? `ನಿಮ್ಮ ಕಾಯ್ದಿರಿಸುವಿಕೆ ದೃಢಪಟ್ಟಿದೆ, ${collectorName}. ವಿವರಗಳನ್ನು ${collectorEmail} ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.`
                        : `Thank you, ${collectorName}. Your reservation for this month’s edition is noted, and confirmation has been sent to ${collectorEmail}.`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={closeModal} className="mt-4">
                    {isKannada ? 'ಮುಕ್ತಾಯ' : 'Close'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

