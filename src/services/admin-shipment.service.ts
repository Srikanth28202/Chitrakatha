import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import {
  SHIPMENT_STATUSES,
  type AdminShipmentListQuery,
  type ShipmentCreateInput,
  type ShipmentStatusValue,
  type ShipmentUpdateInput,
} from '@/lib/validations/admin-shipment';
import { Order, type IOrder } from '@/models/Order';
import { Shipment, type IShipment } from '@/models/Shipment';

if (typeof window !== 'undefined') {
  throw new Error(
    'src/services/admin-shipment.service.ts is a server-side module and cannot be loaded on the client.'
  );
}

type LeanShipment = IShipment & { _id: unknown };
type LeanOrder = IOrder & { _id: unknown };

export interface AdminShipmentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingFee: number;
  status: ShipmentStatusValue;
  dispatchDate?: string;
  deliveryDate?: string;
  statusHistory: Array<{
    status: ShipmentStatusValue;
    note?: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminShipmentListResult {
  items: AdminShipmentRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<ShipmentStatusValue | 'all', number>;
}

export class AdminShipmentServiceError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = 'SHIPMENT_ERROR', status = 400) {
    super(message);
    this.name = 'AdminShipmentServiceError';
    this.code = code;
    this.status = status;
  }
}

const ALLOWED_TRANSITIONS: Record<ShipmentStatusValue, ShipmentStatusValue[]> = {
  manifested: ['in_transit', 'failed', 'returned'],
  in_transit: ['out_for_delivery', 'failed', 'returned'],
  out_for_delivery: ['delivered', 'failed', 'returned'],
  delivered: [],
  returned: [],
  failed: ['in_transit', 'returned'],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toIso(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function serializeShipment(
  shipment: LeanShipment,
  order?: LeanOrder
): AdminShipmentRecord {
  return {
    id: String(shipment._id),
    orderId: String(shipment.orderId),
    orderNumber: order?.orderNumber ?? '',
    customerName: order?.customerDetails.name ?? '',
    customerEmail: order?.customerDetails.email ?? '',
    courierName: shipment.courierName,
    trackingNumber: shipment.trackingNumber,
    ...(shipment.trackingUrl ? { trackingUrl: shipment.trackingUrl } : {}),
    shippingFee: shipment.shippingFee,
    status: shipment.status,
    ...(shipment.dispatchDate
      ? { dispatchDate: toIso(shipment.dispatchDate) }
      : {}),
    ...(shipment.deliveryDate
      ? { deliveryDate: toIso(shipment.deliveryDate) }
      : {}),
    statusHistory: (shipment.statusHistory ?? []).map((entry) => ({
      status: entry.status,
      ...(entry.note ? { note: entry.note } : {}),
      timestamp: toIso(entry.timestamp) ?? '',
    })),
    createdAt: toIso(shipment.createdAt) ?? '',
    updatedAt: toIso(shipment.updatedAt) ?? '',
  };
}

async function loadOrdersByIds(ids: Types.ObjectId[]): Promise<Map<string, LeanOrder>> {
  if (ids.length === 0) return new Map();
  const orders = await Order.find({ _id: { $in: ids } }).lean<LeanOrder[]>();
  return new Map(orders.map((order) => [String(order._id), order]));
}

export async function listAdminShipments(
  query: AdminShipmentListQuery
): Promise<AdminShipmentListResult> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (query.status !== 'all') filter.status = query.status;

  if (query.q) {
    const pattern = new RegExp(escapeRegExp(query.q), 'i');
    filter.$or = [
      { courierName: pattern },
      { trackingNumber: pattern },
      { trackingUrl: pattern },
    ];
  }

  const [docs, total, statusAgg] = await Promise.all([
    Shipment.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<LeanShipment[]>(),
    Shipment.countDocuments(filter),
    Shipment.aggregate<{ _id: ShipmentStatusValue; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const orders = await loadOrdersByIds(
    docs.map((shipment) => shipment.orderId as Types.ObjectId)
  );

  const statusCounts = SHIPMENT_STATUSES.reduce(
    (counts, status) => {
      counts[status] = 0;
      return counts;
    },
    { all: 0 } as Record<ShipmentStatusValue | 'all', number>
  );

  for (const row of statusAgg) {
    if (row?._id in statusCounts) statusCounts[row._id] = row.count;
    statusCounts.all += row?.count ?? 0;
  }

  return {
    items: docs.map((shipment) =>
      serializeShipment(shipment, orders.get(String(shipment.orderId)))
    ),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
    statusCounts,
  };
}

export async function getAdminShipmentById(
  id: string
): Promise<AdminShipmentRecord | null> {
  await connectToDatabase();
  const shipment = await Shipment.findById(id).lean<LeanShipment | null>();
  if (!shipment) return null;

  const order = await Order.findById(shipment.orderId).lean<LeanOrder | null>();
  return serializeShipment(shipment, order ?? undefined);
}

async function syncOrderStatus(
  orderId: Types.ObjectId,
  shipmentStatus: ShipmentStatusValue
): Promise<void> {
  if (
    shipmentStatus === 'in_transit' ||
    shipmentStatus === 'out_for_delivery'
  ) {
    await Order.updateOne(
      {
        _id: orderId,
        orderStatus: { $in: ['placed', 'confirmed', 'packed'] },
      },
      { $set: { orderStatus: 'dispatched' } }
    );
    return;
  }

  if (shipmentStatus === 'delivered') {
    await Order.updateOne(
      { _id: orderId, orderStatus: { $ne: 'cancelled' } },
      { $set: { orderStatus: 'delivered' } }
    );
  }
}

export async function createAdminShipment(
  input: ShipmentCreateInput
): Promise<AdminShipmentRecord> {
  await connectToDatabase();

  const order = await Order.findById(input.orderId).lean<LeanOrder | null>();
  if (!order) {
    throw new AdminShipmentServiceError('Order not found.', 'ORDER_NOT_FOUND', 404);
  }

  if (order.orderStatus === 'cancelled') {
    throw new AdminShipmentServiceError(
      'Cannot create a shipment for a cancelled order.',
      'ORDER_CANCELLED',
      409
    );
  }

  // One active shipment per order. A replacement shipment is only allowed
  // once the previous one ended in a terminal state (failed / returned).
  const activeShipment = await Shipment.findOne({
    orderId: order._id,
    status: { $nin: ['failed', 'returned'] },
  })
    .sort({ createdAt: -1 })
    .lean<LeanShipment | null>();

  if (activeShipment) {
    throw new AdminShipmentServiceError(
      'This order already has an active shipment. Update it instead of creating a duplicate.',
      'SHIPMENT_ALREADY_EXISTS',
      409
    );
  }

  const shipment = await Shipment.create({
    orderId: order._id,
    courierName: input.courierName,
    trackingNumber: input.trackingNumber,
    trackingUrl: input.trackingUrl,
    shippingFee: input.shippingFee,
    dispatchDate: input.dispatchDate,
    status: input.status,
    statusHistory: [
      {
        status: input.status,
        note: input.note,
        timestamp: new Date(),
      },
    ],
  });

  await syncOrderStatus(order._id as Types.ObjectId, input.status);

  return serializeShipment(
    shipment.toObject() as LeanShipment,
    order
  );
}

export async function updateAdminShipment(
  id: string,
  input: ShipmentUpdateInput
): Promise<AdminShipmentRecord | null> {
  await connectToDatabase();

  const existing = await Shipment.findById(id).lean<LeanShipment | null>();
  if (!existing) return null;

  const update: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};

  if (input.status && input.status !== existing.status) {
    const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(input.status)) {
      throw new AdminShipmentServiceError(
        `Cannot move a shipment from ${existing.status} to ${input.status}.`,
        'INVALID_SHIPMENT_TRANSITION',
        409
      );
    }
    update.status = input.status;
  }

  if (input.courierName !== undefined) update.courierName = input.courierName;
  if (input.trackingNumber !== undefined) update.trackingNumber = input.trackingNumber;
  if (input.shippingFee !== undefined) update.shippingFee = input.shippingFee;
  if (input.dispatchDate !== undefined) update.dispatchDate = input.dispatchDate;

  if (input.trackingUrl === undefined) {
    unset.trackingUrl = 1;
  } else if (input.trackingUrl.length > 0) {
    update.trackingUrl = input.trackingUrl;
  } else {
    unset.trackingUrl = 1;
  }

  if (input.status === 'delivered' && input.deliveryDate === undefined) {
    update.deliveryDate = new Date();
  } else if (input.deliveryDate !== undefined) {
    update.deliveryDate = input.deliveryDate;
  }

  const historyEntry =
    input.status !== undefined
      ? {
          status: input.status,
          ...(input.note ? { note: input.note } : {}),
          timestamp: new Date(),
        }
      : null;

  const shipment = await Shipment.findByIdAndUpdate(
    id,
    {
      $set: update,
      ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
      ...(historyEntry ? { $push: { statusHistory: historyEntry } } : {}),
    },
    { new: true, runValidators: true }
  ).lean<LeanShipment | null>();

  if (!shipment) return null;

  if (input.status) {
    await syncOrderStatus(shipment.orderId as Types.ObjectId, input.status);
  }

  const order = await Order.findById(shipment.orderId).lean<LeanOrder | null>();
  return serializeShipment(shipment, order ?? undefined);
}
