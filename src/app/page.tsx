import { HeroSection } from '@/components/home/hero-section';
import { BrandStory } from '@/components/home/brand-story';
import { MonthlyCollections } from '@/components/home/monthly-collections';
import { WhatsInside } from '@/components/home/whats-inside';
import { HowItWorks } from '@/components/home/how-it-works';
import { SubscriptionPlans } from '@/components/home/subscription-plans';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { FaqSection } from '@/components/home/faq-section';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* 3. Hero Section: Emotional Storytelling & Visual Stationery Composition */}
      <HeroSection />

      {/* 4. Brand Story: Revival of Slow Letters & Kannada Literature */}
      <BrandStory />

      {/* 5. Monthly Collections: Curated Anthology & Collector Details */}
      <MonthlyCollections />

      {/* 6. What's Inside: 6 Visual Highlights (Letter, Cards, Stickers, Bookmark, Puzzle, Colouring) */}
      <WhatsInside />

      {/* 7. How It Works: 3 Effortless Steps */}
      <HowItWorks />

      {/* 8. Subscription Highlight: Starting from ₹499 (Recurring vs One-Time) */}
      <SubscriptionPlans />

      {/* 9. Testimonials: Identified Community Preview Reflections */}
      <TestimonialsSection />

      {/* 10. FAQ: Expandable Bilingual Questions & Answers */}
      <FaqSection />
    </div>
  );
}
