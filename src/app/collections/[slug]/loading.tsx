import { Container } from '@/components/ui/container';

export default function EditionLoading() {
  return (
    <div className="bg-canvas" aria-busy="true" aria-live="polite">
      <section className="subtle-paper-grain border-b border-border py-10 md:py-16">
        <Container width="wide" className="space-y-8">
          <div className="h-3 w-36 animate-pulse rounded-paper bg-canvas-paper" />

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <div className="aspect-[4/5] w-full animate-pulse rounded-warm border border-border bg-canvas-paper" />
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-paper border border-border bg-canvas-paper"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5 lg:col-span-6">
              <div className="h-5 w-28 animate-pulse rounded-paper bg-canvas-paper" />
              <div className="h-10 w-4/5 animate-pulse rounded-paper bg-canvas-paper" />
              <div className="h-6 w-2/5 animate-pulse rounded-paper bg-canvas-paper" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full animate-pulse rounded-paper bg-canvas-paper" />
                <div className="h-3 w-11/12 animate-pulse rounded-paper bg-canvas-paper" />
                <div className="h-3 w-3/4 animate-pulse rounded-paper bg-canvas-paper" />
              </div>
              <div className="h-32 w-full animate-pulse rounded-warm border border-border bg-canvas-paper" />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-canvas-paper/60 py-12 md:py-16">
        <Container width="wide" className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="h-7 w-56 animate-pulse rounded-paper bg-canvas-paper" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-warm border border-border bg-canvas-paper"
                />
              ))}
            </div>
          </div>
          <div className="h-64 animate-pulse rounded-warm border border-border bg-canvas-paper lg:col-span-4" />
        </Container>
      </section>
    </div>
  );
}
