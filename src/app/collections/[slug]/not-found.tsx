import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Container } from '@/components/ui/container';

export default function EditionNotFound() {
  return (
    <section className="bg-canvas py-20 md:py-28">
      <Container width="narrow">
        <div className="rounded-warm border border-border bg-canvas-card p-8 text-center shadow-card sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-terracotta-700">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>

          <h1 className="mt-5 font-serif text-3xl font-medium text-espresso-dark sm:text-4xl">
            Edition not found
          </h1>
          <p className="font-kannada mt-2 text-lg text-espresso-muted">
            ಈ ಸಂಚಿಕೆ ಲಭ್ಯವಿಲ್ಲ
          </p>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-espresso-muted">
            The edition you are looking for may have been moved, is not published
            yet, or is no longer part of the public catalogue.
          </p>
          <p className="font-kannada mx-auto mt-2 max-w-md text-sm leading-relaxed text-espresso-muted">
            ನೀವು ಹುಡುಕುತ್ತಿರುವ ಸಂಚಿಕೆ ಪ್ರಕಟವಾಗಿಲ್ಲ ಅಥವಾ ಸಾರ್ವಜನಿಕ ಸಂಗ್ರಹದಲ್ಲಿಲ್ಲ.
          </p>

          <Link
            href="/#collections"
            className="mt-6 inline-flex items-center gap-1.5 rounded-paper bg-terracotta-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to collections · ಸಂಗ್ರಹಗಳಿಗೆ ಹಿಂತಿರುಗಿ
          </Link>
        </div>
      </Container>
    </section>
  );
}
