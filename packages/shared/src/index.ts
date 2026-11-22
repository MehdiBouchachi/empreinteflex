// Shared contracts only. API is the final authority for validation and prices.
export type Role = 'CUSTOMER' | 'SELLER' | 'LOCATION_MANAGER' | 'COMPANY_ADMIN' | 'TECHNICAL_OPERATOR';
export type Channel = 'ONLINE' | 'POS';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
export type OrderLineInput = { variantId: string; quantity: number };
export type Money = { amountMinor: number; currency: 'DZD' };
export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number };
export const moneyDzd = (minor: number) => new Intl.NumberFormat('fr-DZ', { style: 'decimal', maximumFractionDigits: 2 }).format(minor / 100) + ' DA';
