/**
 * NEXORA - Types partagés (Frontend & Backend)
 * Conforme au Cahier des charges v1.0
 */

// ==========================================
// 1. Profils Métiers & Modularité
// ==========================================
export type BusinessType = 
  | 'RETAIL'            // Commerce & négoce physique (stocks, achats, ventes)
  | 'DIGITAL_SERVICES'   // Services digitaux & abonnements (licences, streaming, secrets AES-256)
  | 'CONSULTING'        // Prestations de service & conseil (devis, facturation, temps)
  | 'HYBRID';           // Mixte / Sur-mesure

export interface CompanySettings {
  id: string;
  businessName: string;
  legalName?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string; // NIF / RCCM
  currency: string; // Ex: "FCFA" (XOF ou XAF)
  timezone: string;
  language: string;
  defaultVatRate: number; // Ex: 18.0
  
  // Feature flags de modularité
  businessType: BusinessType;
  enableInventory: boolean;
  enableDigitalSubs: boolean;
  enablePurchases: boolean;
  enableQuotes: boolean;
  
  invoicePrefix: string;     // Ex: "FAC-"
  quotePrefix: string;       // Ex: "DEV-"
  creditNotePrefix: string;  // Ex: "AV-"
  purchasePrefix: string;    // Ex: "ACH-"
}

// ==========================================
// 2. Utilisateurs & Permissions
// ==========================================
export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type PermissionCode =
  | 'DASHBOARD_READ'
  | 'CUSTOMERS_READ'
  | 'CUSTOMERS_CREATE'
  | 'CUSTOMERS_UPDATE'
  | 'SUPPLIERS_READ'
  | 'SUPPLIERS_CREATE'
  | 'SUPPLIERS_UPDATE'
  | 'PRODUCTS_READ'
  | 'PRODUCTS_CREATE'
  | 'PRODUCTS_UPDATE'
  | 'INVENTORY_READ'
  | 'INVENTORY_ADJUST'
  | 'SALES_READ'
  | 'SALES_CREATE'
  | 'SALES_CANCEL'
  | 'PAYMENTS_READ'
  | 'PAYMENTS_CREATE'
  | 'REFUNDS_CREATE'
  | 'PURCHASES_READ'
  | 'PURCHASES_CREATE'
  | 'PURCHASES_RECEIVE'
  | 'EXPENSES_READ'
  | 'EXPENSES_CREATE'
  | 'QUOTES_READ'
  | 'QUOTES_CREATE'
  | 'QUOTES_CONVERT'
  | 'DOCUMENTS_READ'
  | 'SUBSCRIPTIONS_READ'
  | 'SUBSCRIPTIONS_MANAGE'
  | 'SUBSCRIPTION_SECRETS_READ'
  | 'MONTHLY_CLOSING_MANAGE'
  | 'REPORTS_READ'
  | 'SETTINGS_MANAGE'
  | 'USERS_MANAGE'
  | 'AUDIT_READ';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  permissions: PermissionCode[];
  createdAt: string;
  lastLoginAt?: string;
}

// ==========================================
// 3. Clients & Fournisseurs
// ==========================================
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  outstandingBalance: number; // Solde dû en FCFA
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  ordersCount: number;
  totalVolume: number; // Montant total en FCFA
  active: boolean;
  createdAt: string;
}

// ==========================================
// 4. Produits, Services & Stocks
// ==========================================
export type ItemType = 'PHYSICAL_PRODUCT' | 'DIGITAL_SERVICE' | 'CONSULTING_SERVICE';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  type: ItemType;
  purchasePrice: number; // Prix d'achat en FCFA
  sellingPrice: number;  // Prix de vente en FCFA
  stockQuantity: number;
  alertThreshold: number;
  unit: string;          // Ex: "unité", "pièce", "mois", "licence"
  barcode?: string;
  active: boolean;
  createdAt: string;
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE' | 'PURCHASE' | 'RETURN';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  reference?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// ==========================================
// 5. Abonnements & Services Numériques
// ==========================================
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED';

export interface DigitalAccount {
  id: string;
  serviceName: string;   // Ex: "Canva Pro", "Netflix UHD", "Office 365"
  profileName?: string;  // Ex: "Profil 1 - PIN 1234"
  accountIdentifier: string; // Login / Email
  // Note: le mot de passe est chiffré en AES-256-GCM et déchiffré uniquement avec la permission adéquate
  isAssigned: boolean;
  createdAt: string;
}

export interface SubscriptionAssignment {
  id: string;
  serviceName: string;
  customerId: string;
  customerName: string;
  accountId: string;
  accountIdentifier: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  sellingPrice: number;
  status: SubscriptionStatus;
  autoRenew: boolean;
}

// ==========================================
// 6. Ventes, Factures, Devis, Avoirs
// ==========================================
export type SaleStatus = 
  | 'BROUILLON'
  | 'CONFIRMEE'
  | 'PARTIELLEMENT_PAYEE'
  | 'PAYEE'
  | 'ANNULEE';

export interface SaleItem {
  id?: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number; // % de remise
  taxRate: number;  // % de TVA
  totalHT: number;
  totalTTC: number;
}

export interface Sale {
  id: string;
  reference: string; // Ex: "VTE-2025-0482"
  invoiceNumber?: string; // Ex: "FAC-2025-0382"
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotalHT: number;
  taxAmount: number;
  discountAmount: number;
  totalTTC: number;
  paidAmount: number;
  remainingBalance: number; // Solde restant dû
  status: SaleStatus;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
  dueDate?: string;
}

export type QuoteStatus = 'BROUILLON' | 'ENVOYE' | 'ACCEPTE' | 'REFUSE' | 'EXPIRE' | 'CONVERTI';

export interface Quote {
  id: string;
  reference: string; // Ex: "DEV-2025-0154"
  customerId: string;
  customerName: string;
  items: SaleItem[];
  totalTTC: number;
  status: QuoteStatus;
  validUntil: string;
  convertedSaleId?: string;
  createdAt: string;
}

export interface CreditNote {
  id: string;
  reference: string; // Ex: "AV-2025-0012"
  saleId: string;
  saleReference: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  createdAt: string;
}

// ==========================================
// 7. Finance, Encaissements, Dépenses
// ==========================================
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOBILE_MONEY' | 'OTHER';

export interface Payment {
  id: string;
  reference: string; // Ex: "OP-0894"
  saleId?: string;
  saleReference?: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  method: PaymentMethod;
  paymentProofRef?: string;
  notes?: string;
  userId: string;
  userName: string;
  paidAt: string;
}

export interface Expense {
  id: string;
  reference: string; // Ex: "OP-0893"
  category: string;  // Ex: "Loyer bureau", "Fournitures", "Abonnement logiciel"
  supplierId?: string;
  supplierName?: string;
  description: string;
  amount: number;
  method: PaymentMethod;
  receiptReference?: string;
  expenseDate: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// ==========================================
// 8. Achats Fournisseurs
// ==========================================
export type PurchaseStatus = 'BROUILLON' | 'COMMANDE' | 'RECEPTIONNE_PARTIEL' | 'RECEPTIONNE' | 'ANNULE';

export interface PurchaseItem {
  id?: string;
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  reference: string; // Ex: "ACH-2025-0128"
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: PurchaseStatus;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
}

// ==========================================
// 9. Dashboard, Audit & Clôtures
// ==========================================
export interface DashboardKPIs {
  revenue: number;           // Chiffre d'affaires
  revenueGrowthPct: number;
  receipts: number;          // Encaissements réels
  receiptsGrowthPct: number;
  salesCount: number;
  salesCountGrowthPct: number;
  outstandingDebts: number;  // Créances clients
  debtsGrowthPct: number;
  expenses: number;          // Dépenses
  expensesGrowthPct: number;
  cashBalance: number;       // Trésorerie nette disponible
}

export interface MonthlyClosing {
  id: string;
  year: number;
  month: number;
  revenue: number;
  receipts: number;
  refunds: number;
  expenses: number;
  purchases: number;
  outstandingDebts: number;
  closedAt: string;
  closedByUserId: string;
  isLocked: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  userId: string;
  userName: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  type: 'STOCK_ALERT' | 'OVERDUE_INVOICE' | 'SUBSCRIPTION_EXPIRING' | 'PAYMENT_RECEIVED' | 'SECURITY';
  title: string;
  message: string;
  read: boolean;
  referenceLink?: string;
  createdAt: string;
}
