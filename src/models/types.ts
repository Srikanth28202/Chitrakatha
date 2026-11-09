/**
 * Data contracts and common model type aliases.
 */
export type { UserRole, PreferredLanguage, IUser, IUserAddress } from './User';
export type { EditionStatus, IEdition, IEditionIncludedItem, IEditionImages } from './Edition';
export type { PurchaseType, PaymentStatus, OrderStatus, IOrder, IOrderPricing, ICustomerDetails, IDeliveryAddress } from './Order';
export type { BillingFrequency, SubscriptionStatus, ISubscription, ISubscriptionConsent } from './Subscription';
export type { PaymentProvider, PaymentRecordStatus, IPayment } from './Payment';
export type { CouponDiscountType, ApplicablePurchaseType, ICoupon } from './Coupon';
export type { ShipmentStatus, IShipment } from './Shipment';
export type { ISetting, IShippingConfiguration, IContactInformation } from './Setting';
