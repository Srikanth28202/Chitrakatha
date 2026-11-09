import { Badge, type BadgeVariant } from '@/components/ui/badge';
import type { EditionStatusValue } from '@/lib/validations/admin-edition';

const STATUS_STYLES: Record<
  EditionStatusValue,
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: 'Draft', variant: 'paper' },
  upcoming: { label: 'Upcoming', variant: 'terracotta' },
  active: { label: 'Active', variant: 'sage' },
  sold_out: { label: 'Sold out', variant: 'rose' },
  archived: { label: 'Archived', variant: 'outline' },
};

export function EditionStatusBadge({ status }: { status: EditionStatusValue }) {
  const entry = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
