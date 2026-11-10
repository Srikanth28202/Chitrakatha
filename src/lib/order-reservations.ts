import { Coupon } from '@/models/Coupon';
import { Edition } from '@/models/Edition';

/**
 * Reservation release helpers shared by admin order cancellation and
 * payment refunds.
 *
 * Stock and coupon usage are reserved atomically when a pending order is
 * created (see checkout.service.ts). When an order is cancelled or refunded
 * those reservations must be returned so inventory and coupon limits stay
 * accurate.
 */

export interface ReservationItem {
  editionId: string;
  quantity: number;
}

export async function releaseOrderStock(items: ReservationItem[]): Promise<void> {
  await Promise.all(
    items.map((item) =>
      Edition.updateOne(
        { _id: item.editionId },
        { $inc: { stock: item.quantity } }
      ).catch(() => undefined)
    )
  );
}

export async function releaseOrderCouponUsage(couponId: string): Promise<void> {
  await Coupon.updateOne(
    { _id: couponId, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } }
  ).catch(() => undefined);
}
