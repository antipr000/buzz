/**
 * Matches `be/payment/models/payment.py` PaymentMethod — values sent as JSON `payment_method`.
 */
export const PURCHASE_PAYMENT_METHOD_VALUES = [
  "upi",
  "credit_debit_card",
  "pay_later",
  "wallets",
  "emi",
  "net_banking",
  "cash_on_delivery",
] as const;

export type PurchasePaymentMethod =
  (typeof PURCHASE_PAYMENT_METHOD_VALUES)[number];
