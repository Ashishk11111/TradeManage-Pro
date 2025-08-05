
export interface InventoryItem {
  id: string;
  stockName: string;
  quantity: number;
  price: number;
  stockCode: string;
  dateAdded: string;
  threshold: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  address: string;
  state: string;
  country: string;
  GSTIN: string;
  pincode: string;       // ✅ Add this line
  dateAdded: Date;
}


export interface InvoiceItem {
  description: string[];  // e.g., ["Blue", "Cotton", "XL"]
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;  // percentage (e.g., 10 means 10%)
  amount: number;    // total amount (after applying discount)
}

export interface Invoice {
  id: string;
  clientId: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  invoiceNumber: string;

  vehicleNo: string;
  date: string;
  dispatchedThrough: string;
  dispatchedDate: string;
  dispatchedDocNo: string;
  referenceNo: string;
  referenceDate: string;
  DateOfTransport: string;
  customerPO: string;
  customerPODate: string;
  modeofTransport: string;
  shipedToName: string;
  shipedToAddress: string;
  placeOfSupply: string;
  ModeTermsOfPayment: string;
  // termsOfDelivery: string;
  destination: string;
}

export interface Company {
  id: string; // UUID from Supabase
  owner_id: string; // User ID (foreign key to auth.users)
  name: string;
  address: string;
  phone: string;
  email: string;
  created_at?: string; // Optional if using Supabase default timestamp
}

