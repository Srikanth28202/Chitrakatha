import { Badge, type BadgeVariant } from '@/components/ui/badge';

type StatusTone = 'neutral' | 'positive' | 'warning' | 'danger' | 'info';

const TONE_VARIANTS: Record<StatusTone, BadgeVariant> = {
  neutral: 'paper',
  positive: 'sage',
  warning: 'terracotta',
  danger: 'rose',
  info: 'outline',
};

const STATUS_TONES: Record<string, StatusTone> = {
  placed: 'neutral',
  confirmed: 'positive',
  packed: 'warning',
  dispatched: 'info',
  delivered: 'positive',
  cancelled: 'danger',
  pending: 'warning',
  authorized: 'info',
  captured: 'positive',
  success: 'positive',
  failed: 'danger',
  refunded: 'neutral',
  active: 'positive',
  paused: 'warning',
  past_due: 'danger',
  created: 'neutral',
  scheduled: 'info',
  expired: 'neutral',
  inactive: 'neutral',
  exhausted: 'danger',
  manifested: 'neutral',
  in_transit: 'info',
  out_for_delivery: 'warning',
  returned: 'danger',
};

function humanize(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function AdminStatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const tone = STATUS_TONES[status] ?? 'neutral';
  return <Badge variant={TONE_VARIANTS[tone]}>{label ?? humanize(status)}</Badge>;
}
