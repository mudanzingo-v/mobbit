/**
 * Typed API client for the Mobbit backend (http://localhost:8765).
 *
 * Matches the legacy backoffice API client. Uses NextAuth v5 session
 * for auth token injection.
 */
import { getSession } from "next-auth/react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8765"

export class ApiError extends Error {
  status: number
  detail: unknown
  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {}
  const session = await getSession()
  const token = (session as any)?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = `${API_BASE}${path}`
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url = url.replace(`{${k}}`, encodeURIComponent(String(v)))
    }
  }
  return url
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown
    params?: Record<string, string | number>
    query?: Record<string, string | number | undefined>
    signal?: AbortSignal
  } = {},
): Promise<T> {
  const { body, params, query, signal } = options
  const auth = await getAuthHeader()
  let url = buildUrl(path, params)
  if (query) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) qs.set(k, String(v))
    }
    const s = qs.toString()
    if (s) url += (url.includes("?") ? "&" : "?") + s
  }
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...auth },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })
  if (!res.ok) {
    let detail: unknown
    try { detail = await res.json() } catch { detail = await res.text() }
    throw new ApiError(res.status, `${method} ${path} → ${res.status}`, detail)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export type PaginatedMeta = { total: number; limit: number; offset: number; hasNext: boolean }

async function requestWithMeta<T>(
  method: string,
  path: string,
  options: {
    body?: unknown
    params?: Record<string, string | number>
    query?: Record<string, string | number | undefined>
    signal?: AbortSignal
  } = {},
): Promise<{ data: T; meta: PaginatedMeta }> {
  const auth = await getAuthHeader()
  const { body, params, query, signal } = options
  let url = buildUrl(path, params)
  if (query) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) qs.set(k, String(v))
    }
    const s = qs.toString()
    if (s) url += (url.includes("?") ? "&" : "?") + s
  }
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...auth },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })
  if (!res.ok) {
    let detail: unknown
    try { detail = await res.json() } catch { detail = await res.text() }
    throw new ApiError(res.status, `${method} ${path} → ${res.status}`, detail)
  }
  const data = (res.status === 204 ? undefined : await res.json()) as T
  const meta: PaginatedMeta = {
    total: parseInt(res.headers.get("X-Total-Count") ?? "0", 10),
    limit: parseInt(res.headers.get("X-Limit") ?? "100", 10),
    offset: parseInt(res.headers.get("X-Offset") ?? "0", 10),
    hasNext: res.headers.get("X-Has-Next") === "true",
  }
  return { data, meta }
}

// =============================================================================
// Types
// =============================================================================
export interface Quotation {
  id: string
  client_name: string
  client_phone: string
  client_email: string
  state: string | null
  service_name: string | null
  service_type: string | null
  service_zone: string | null
  service_hour: string | null
  service_date: string | null
  service_internal: string | null
  id_saler: string | null
  saler: Record<string, unknown> | null
  channel_sales: string | null
  origin_postal_code: string | null
  origin_adress: string | null
  origin_type: string | null
  origin_transport_type: string | null
  origin_pulley: string | null
  origin_restrictions: string | null
  origin_floor: string | null
  destination_postal_code: string | null
  destination_adress: string | null
  destination_type: string | null
  destination_transport_type: string | null
  destination_pulley: string | null
  destination_restrictions: string | null
  destination_floor: string | null
  services: string[] | null
  products: string[] | null
  items: string[] | null
  wizard_step: number | null
  wizard_complete: boolean
  created_at: string
  updated_at: string
}
export type QuotationCreateAdmin = Omit<Quotation, "id" | "created_at" | "updated_at">
export type QuotationUpdate = Partial<QuotationCreateAdmin>

export interface Product {
  id: string
  name: string
  description: string | null
  sku: string | null
  price: number | null
  url_image: string | null
  category_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}
export type ProductCreate = Omit<Product, "id" | "created_at" | "updated_at" | "url_image" | "category_id"> & { url_image?: string | null; category_id?: string | null }
export type ProductUpdate = Partial<ProductCreate>

export interface Service {
  id: string
  name: string
  description: string | null
  price: number | null
  active: boolean
  created_at: string
  updated_at: string
}
export type ServiceCreate = Omit<Service, "id" | "created_at" | "updated_at" | "description" | "price"> & { description?: string | null; price?: number | null }
export type ServiceUpdate = Partial<ServiceCreate>

export interface InventoryCategory {
  id: string
  name: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}
export interface InventoryCategoryCreate { name: string; description?: string; active?: boolean }

export interface InventoryItem {
  id: string
  name: string
  url_image: string | null
  length: number | null
  width: number | null
  height: number | null
  weight: number | null
  category_id: string
  active: boolean
  created_at: string
  updated_at: string
}
export type InventoryItemCreate = Omit<InventoryItem, "id" | "category_id" | "created_at" | "updated_at">

export interface Provider {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  rfc: string | null
  address: string | null
  active: boolean
  kyc_status?: string
}
export type ProviderUpdate = Partial<Omit<Provider, "id">>

export interface Truck {
  id: string
  provider_id: string
  brand: string | null
  model: string | null
  year: number | null
  plates: string | null
  capacity_kg: number | null
  capacity_m3: number | null
  active: boolean
  created_at: string
  updated_at: string
}
export type TruckCreate = Omit<Truck, "id" | "provider_id" | "created_at" | "updated_at">

export interface Saler {
  id: string
  name: string
  email: string | null
  phone: string | null
  commission_pct: number | null
  active: boolean
  created_at: string
  updated_at: string
}
export type SalerCreate = Omit<Saler, "id" | "created_at" | "updated_at">
export type SalerUpdate = Partial<SalerCreate>

export interface Payment {
  id: string
  quotation_id: string
  auction_id: string | null
  type: string
  state: string
  amount: number | null
  currency: string
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  stripe_payment_status: string | null
  created_at: string
  updated_at: string
}

export interface Stats {
  quotations: number
  auctions: number
  products: number
  services: number
  inventory_items: number
  inventory_categories: number
  providers: number
  salers: number
  payments: number
  trucks: number
}

export interface Auction {
  id: string
  quotation_id: string
  provider_id: string
  price_load: number | string
  subtotal: number | string
  mobbit_fee: number | string
  iva: number | string
  transaction_fee: number | string
  total: number | string
  cash_on_delivery_provider: number | string | null
  cash_on_delivery_mobbit: number | string | null
  people: number | null
  id_truck: string | null
  state: string
  services: unknown[] | null
  products: unknown[] | null
  admin_budget: number | string | null
  provider_note: string | null
  created_at: string
  updated_at: string
}
export type AuctionUpdate = Partial<Pick<Auction, "state" | "people" | "id_truck">>

// =============================================================================
// API surface
// =============================================================================
export const api = {
  // --- Dashboard ---
  getStats: () => request<Stats>("GET", "/api/admin/stats"),
  getReports: () => request<any>("GET", "/api/admin/stats/reports"),

  // --- Quotations ---
  listQuotations: (query?: { state?: string; q?: string; limit?: number; offset?: number }) =>
    requestWithMeta<Quotation[]>("GET", "/api/admin/quotation", { query }),
  getQuotation: (id: string) => request<Quotation>("GET", "/api/admin/quotation/{id}", { params: { id } }),
  createQuotation: (body: QuotationCreateAdmin) => request<Quotation>("POST", "/api/admin/quotation", { body }),
  updateQuotation: (id: string, body: QuotationUpdate) => request<Quotation>("PUT", "/api/admin/quotation/{id}", { body, params: { id } }),
  deleteQuotation: (id: string) => request<{ message: string }>("DELETE", "/api/admin/quotation/{id}", { params: { id } }),
  publishQuotation: (id: string) => request<Quotation>("POST", "/api/admin/quotation/{id}/publish", { params: { id } }),
  cancelQuotation: (id: string) => request<Quotation>("POST", "/api/admin/quotation/{id}/cancel", { params: { id } }),
  assignProvider: (quotationId: string, providerId: string, body: { admin_budget: number; people?: string; id_truck?: string; note?: string }) =>
    request<Auction>("POST", "/api/admin/quotation/{id}/assign-provider", { body, params: { id: quotationId }, query: { provider_id: providerId } }),

  // --- Products ---
  listProducts: (query?: { limit?: number; offset?: number }) =>
    requestWithMeta<Product[]>("GET", "/api/admin/product", { query }),
  getProduct: (id: string) => request<Product>("GET", "/api/admin/product/{id}", { params: { id } }),
  createProduct: (body: ProductCreate) => request<Product>("POST", "/api/admin/product", { body }),
  updateProduct: (id: string, body: ProductUpdate) => request<Product>("PUT", "/api/admin/product/{id}", { body, params: { id } }),
  deleteProduct: (id: string) => request<{ message: string }>("DELETE", "/api/admin/product/{id}", { params: { id } }),

  // --- Services ---
  listServices: (query?: { limit?: number; offset?: number }) =>
    requestWithMeta<Service[]>("GET", "/api/admin/service", { query }),
  createService: (body: ServiceCreate) => request<Service>("POST", "/api/admin/service", { body }),
  updateService: (id: string, body: ServiceUpdate) => request<Service>("PUT", "/api/admin/service/{id}", { body, params: { id } }),
  deleteService: (id: string) => request<{ message: string }>("DELETE", "/api/admin/service/{id}", { params: { id } }),

  // --- Inventory Categories ---
  listInventoryCategories: (query?: { limit?: number; offset?: number }) =>
    requestWithMeta<InventoryCategory[]>("GET", "/api/admin/inventory/category", { query }),
  createInventoryCategory: (body: InventoryCategoryCreate) => request<InventoryCategory>("POST", "/api/admin/inventory/category", { body }),
  updateInventoryCategory: (id: string, body: Partial<InventoryCategoryCreate>) => request<InventoryCategory>("PUT", "/api/admin/inventory/category/{id}", { body, params: { id } }),

  // --- Inventory Items ---
  listInventoryItems: (categoryId: string, query?: { limit?: number; offset?: number }) =>
    requestWithMeta<InventoryItem[]>("GET", "/api/admin/inventory/category/{categoryId}/item", { params: { categoryId }, query }),
  createInventoryItem: (categoryId: string, body: InventoryItemCreate) => request<InventoryItem>("POST", "/api/admin/inventory/category/{categoryId}/item", { body, params: { categoryId } }),
  updateInventoryItem: (categoryId: string, id: string, body: Partial<InventoryItemCreate>) => request<InventoryItem>("PUT", "/api/admin/inventory/category/{categoryId}/item/{itemId}", { body, params: { categoryId, itemId: id } }),
  listAllInventoryItems: () => request<InventoryItem[]>("GET", "/api/admin/inventory/items"),

  // --- Providers ---
  listProviders: (query?: { limit?: number; offset?: number }) =>
    requestWithMeta<Provider[]>("GET", "/api/admin/provider", { query }),
  getProvider: (id: string) => request<Provider>("GET", "/api/admin/provider/{id}", { params: { id } }),
  updateProvider: (id: string, body: ProviderUpdate) => request<Provider>("PUT", "/api/admin/provider/{id}", { body, params: { id } }),

  // --- Trucks ---
  listTrucks: (providerId: string) => request<Truck[]>("GET", "/api/admin/provider/{providerId}/truck", { params: { providerId } }),
  createTruck: (providerId: string, body: TruckCreate) => request<Truck>("POST", "/api/admin/provider/{providerId}/truck", { body, params: { providerId } }),

  // --- Salers ---
  listSalers: (query?: { limit?: number; offset?: number }) =>
    requestWithMeta<Saler[]>("GET", "/api/admin/saler", { query }),
  createSaler: (body: SalerCreate) => request<Saler>("POST", "/api/admin/saler", { body }),
  updateSaler: (id: string, body: SalerUpdate) => request<Saler>("PUT", "/api/admin/saler/{id}", { body, params: { id } }),
  deleteSaler: (id: string) => request<{ message: string }>("DELETE", "/api/admin/saler/{id}", { params: { id } }),

  // --- Payments ---
  listPayments: (query?: { limit?: number; offset?: number }) =>
    requestWithMeta<Payment[]>("GET", "/api/admin/payment", { query }),
  listPaymentsByQuotation: (quotationId: string) => request<Payment[]>("GET", "/api/admin/quotation/{quotationId}/payment/s", { params: { quotationId } }),

  // --- Auctions ---
  listAuctions: (query?: { quotation_id?: string; limit?: number; offset?: number }) =>
    requestWithMeta<Auction[]>("GET", "/api/admin/auction", { query }),
  getAuction: (id: string) => request<Auction>("GET", "/api/admin/auction/{id}", { params: { id } }),
  updateAuction: (id: string, body: AuctionUpdate) => request<Auction>("PUT", "/api/admin/auction/{id}", { body, params: { id } }),
  deleteAuction: (id: string) => request<{ message: string }>("DELETE", "/api/admin/auction/{id}", { params: { id } }),

  // --- Invoices / CFDI ---
  listInvoices: (query?: { limit?: number; offset?: number }) =>
    requestWithMeta<any[]>("GET", "/api/admin/invoice", { query }),

  // --- Provider registration (no auth) ---
  registerProvider: (body: { email: string; phone: string; name: string; company_name: string; rfc: string; postal_code: string; password: string }) =>
    request<any>("POST", "/api/auth/provider/register", { body }),
  verifyEmail: (token: string) =>
    request<any>("GET", "/api/auth/provider/verify-email", { query: { token } }),

  // --- B2C Invoices ---
  captureInvoice: (quotationId: string, rfc: string, cfdiUse?: string) =>
    request<any>("POST", "/api/b2c/api/b2c/quotation/{quotationId}/invoice", { params: { quotationId }, body: { rfc, cfdi_use: cfdiUse || "G03" } }),
  stampInvoice: (invoiceId: string) =>
    request<any>("POST", "/api/b2c/api/b2c/invoice/{invoiceId}/stamp", { params: { invoiceId } }),
  cancelInvoice: (invoiceId: string) =>
    request<any>("POST", "/api/b2c/api/b2c/invoice/{invoiceId}/cancel", { params: { invoiceId } }),

  // --- Health ---
  health: () => request<{ status: string }>("GET", "/health"),

  // --- Ratings ---
  rateAuction: (auctionId: string, score: number, comment?: string) =>
    request<any>("POST", "/api/b2c/api/b2c/auction/{auctionId}/rate", { params: { auctionId }, body: { score, comment } }),
  getProviderRatingSummary: (providerId: string) =>
    request<any>("GET", "/api/admin/provider/{providerId}", { params: { providerId } }),

  // --- B2C ---
  createQuotationB2c: (body: any) => request<Quotation>("POST", "/api/b2c/quotation", { body }),
  getQuotationB2c: (id: string) => request<Quotation>("GET", "/api/b2c/quotation/{id}", { params: { id } }),
  updateQuotationB2c: (id: string, body: any) => request<Quotation>("PUT", "/api/b2c/quotation/{id}", { body, params: { id } }),
  listB2cAuctions: (quotationId: string) => request<Auction[]>("GET", "/api/b2c/quotation/{id}/auctions", { params: { id: quotationId } }),
  selectB2cAuction: (quotationId: string, idAuction: string, cashOnDelivery: boolean, paymentMethod?: string) =>
    request<any>("PUT", "/api/b2c/quotation/{id}/auction", { params: { id: quotationId }, body: { id_auction: idAuction, cash_on_delivery: cashOnDelivery ? "true" : "false", payment_method: paymentMethod || "card" } }),
  listB2cProducts: () => request<any[]>("GET", "/api/b2c/products"),
  listB2cServices: () => request<any[]>("GET", "/api/b2c/services"),

  // --- KYC ---
  uploadKycDocument: async (docType: string, file: File) => {
    const session = await getSession()
    const token = (session as any)?.access_token
    const formData = new FormData()
    formData.append("doc_type", docType)
    formData.append("file", file)
    const res = await fetch(`${API_BASE}/api/provider/kyc/documents`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!res.ok) {
      let detail: unknown
      try { detail = await res.json() } catch { detail = await res.text() }
      throw new ApiError(res.status, `KYC upload failed: ${res.status}`, detail)
    }
    return res.json()
  },
  approveKyc: (providerId: string) =>
    request<any>("POST", "/api/admin/provider/{providerId}/kyc/approve", { params: { providerId } }),
  rejectKyc: (providerId: string, reason?: string) =>
    request<any>("POST", "/api/admin/provider/{providerId}/kyc/reject", { params: { providerId }, body: reason ? { reason } : {} }),

  // --- Scheduling ---
  getMyAvailability: (query?: { start_date?: string; end_date?: string }) =>
    request<any[]>("GET", "/api/provider/availability", { query }),
  setMyAvailability: (body: { target_date: string; available: boolean; slots?: string[] }) =>
    request<any>("POST", "/api/provider/availability", { body }),

  // --- Provider quotations (marketplace) ---
  listQuotationsForBidding: () => request<any[]>("GET", "/api/provider/quotation"),
  submitBid: (quotationId: string, body: { price_load: number; people?: string; id_truck?: string; provider_note?: string }) =>
    request<any>("POST", "/api/provider/quotation/{quotationId}/bid", { params: { quotationId }, body }),

  // --- Provider (authenticated as provider) ---
  getMyProfile: () => request<Provider>("GET", "/api/provider/profile"),
  listMyAuctions: (query?: { state?: string; limit?: number }) =>
    request<Auction[]>("GET", "/api/provider/auction", { query }),
  getMyAuction: (id: string) =>
    request<Auction>("GET", "/api/provider/auction/{id}", { params: { id } }),
  updateMyAuction: (id: string, body: { price_load?: string; people?: string; id_truck?: string; provider_note?: string; accept_admin_price?: boolean }) =>
    request<Auction>("PUT", "/api/provider/auction/{id}", { body, params: { id } }),
  declineMyAuction: (id: string) =>
    request<Auction>("POST", "/api/provider/auction/{id}/decline", { params: { id } }),
}
