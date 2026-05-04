import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

export type Role = 'customer' | 'pharmacy' | 'logistics';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  is_verified: boolean;
  email: string;
}

export interface InventoryItem {
  id: string;
  pharmacy_id: string;
  med_name: string;
  stock_level: number;
  price: number;
  category?: string;
  image_url?: string;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED_ROUTING' | 'COMPLETED';

export interface Order {
  id: string;
  customer_id: string;
  pharmacy_id: string;
  med_name: string;
  qty: number;
  total_price: number;
  status: OrderStatus;
  created_at: number; // timestamp
}

export interface AvailableInventoryItem extends InventoryItem {
  pharmacy_name: string;
}

// ─── Scanner / NAFDAC Types ───────────────────────────────────────────────────

export interface VerifiedBatch {
  batch_code: string;
  manufacturer: string;
  drug_name: string;
  expiry_date: string; // ISO date string
  is_authentic: boolean;
}

export interface VerificationLog {
  id: string;
  user_id: string | null;
  scanned_code: string;
  is_authentic: boolean;
  location_data?: { lat: number; lng: number };
  created_at: number;
}

// Seeded NAFDAC batch registry (5 authentic + 2 counterfeit)
const SEED_BATCHES: VerifiedBatch[] = [
  { batch_code: 'BJ-2024-EMZ001', manufacturer: 'Emzor Pharmaceuticals', drug_name: 'Paracetamol 500mg', expiry_date: '2026-09-01', is_authentic: true },
  { batch_code: 'BJ-2024-MAY002', manufacturer: 'May & Baker Nigeria', drug_name: 'Amoxicillin 250mg', expiry_date: '2027-03-15', is_authentic: true },
  { batch_code: 'BJ-2025-BIO003', manufacturer: 'Bioraj Pharmaceuticals', drug_name: 'Metformin 500mg (Direct)', expiry_date: '2027-12-01', is_authentic: true },
  { batch_code: 'BJ-2025-GSK004', manufacturer: 'GlaxoSmithKline Nigeria', drug_name: 'Augmentin 375mg', expiry_date: '2026-06-20', is_authentic: true },
  { batch_code: 'BJ-2025-PFZ005', manufacturer: 'Pfizer Nigeria', drug_name: 'Zithromax (Azithromycin)', expiry_date: '2028-01-10', is_authentic: true },
  // Known counterfeits — for demo / testing
  { batch_code: 'FAKE-0000-XXX01', manufacturer: 'Unknown', drug_name: 'Counterfeit Drug A', expiry_date: '2020-01-01', is_authentic: false },
  { batch_code: 'FAKE-0000-XXX02', manufacturer: 'Unknown', drug_name: 'Counterfeit Drug B', expiry_date: '2019-06-01', is_authentic: false },
];

interface MockDBContextType {
  currentUser: Profile | null;
  login: (email: string, fullName: string) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  verifyPharmacy: (pharmacyId: string) => void; // Admin only
  isAdmin: boolean;
  allProfiles: Profile[]; // For admin view
  
  // Inventory Methods
  inventory: InventoryItem[];
  getPharmacyInventory: () => InventoryItem[];
  getAllAvailableInventory: () => AvailableInventoryItem[]; // For customers
  addInventoryItem: (med_name: string, stock_level: number, price: number, category?: string, image_url?: string) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  // Order Methods
  orders: Order[];
  getCustomerOrders: () => Order[];
  getPharmacyOrders: () => Order[];
  createOrder: (pharmacy_id: string, med_name: string, qty: number, total_price: number) => void;
  updateOrderStatus: (order_id: string, status: OrderStatus) => void;

  // Scanner / NAFDAC Methods
  verifyBatchCode: (code: string) => Promise<VerifiedBatch | null>;
  completeOrderByScan: (orderId: string) => Promise<boolean>;
  logVerification: (code: string, isAuthentic: boolean) => void;
  verificationLogs: VerificationLog[];
}

const MockDBContext = createContext<MockDBContextType | undefined>(undefined);

const ADMIN_EMAIL = 'dexdivine9@gmail.com';
const AUTO_CANCEL_MS = 30000; // 30 seconds for testing (would be 3 mins in prod)

export function SupabaseMockProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);

  // Load from local storage to persist during dev
  useEffect(() => {
    const savedProfiles = localStorage.getItem('pharma_profiles');
    const savedUserId = localStorage.getItem('pharma_current_user');
    const savedInventory = localStorage.getItem('pharma_inventory');
    const savedOrders = localStorage.getItem('pharma_orders');
    
    if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
    if (savedUserId) setCurrentUserId(savedUserId);
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('pharma_profiles', JSON.stringify(profiles));
    if (currentUserId) {
      localStorage.setItem('pharma_current_user', currentUserId);
    } else {
      localStorage.removeItem('pharma_current_user');
    }
    localStorage.setItem('pharma_inventory', JSON.stringify(inventory));
    localStorage.setItem('pharma_orders', JSON.stringify(orders));
  }, [profiles, currentUserId, inventory, orders]);

  // AUTO-CANCEL TIMER (The "Busy Pharmacist" fix)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOrders(prevOrders => {
        let changed = false;
        const updated = prevOrders.map(order => {
          if (order.status === 'PENDING' && (now - order.created_at > AUTO_CANCEL_MS)) {
            changed = true;
            return { ...order, status: 'EXPIRED_ROUTING' as OrderStatus };
          }
          return order;
        });
        return changed ? updated : prevOrders;
      });
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const currentUser = profiles.find(p => p.id === currentUserId) || null;
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const login = (email: string, fullName: string) => {
    let user = profiles.find(p => p.email === email);
    if (!user) {
      user = {
        id: Math.random().toString(36).substring(2, 9),
        email,
        full_name: fullName,
        role: '' as Role,
        is_verified: false,
      };
      setProfiles(prev => [...prev, user!]);
    }
    setCurrentUserId(user.id);
  };

  const logout = () => {
    setCurrentUserId(null);
    // Also clear the real Supabase session
    supabase.auth.signOut().catch(() => {});
  };

  const setRole = (role: Role) => {
    if (!currentUserId) return;
    setProfiles(prev => prev.map(p => {
      if (p.id === currentUserId) {
        return {
          ...p,
          role,
          is_verified: role === 'customer' ? true : false,
        };
      }
      return p;
    }));
  };

  const verifyPharmacy = (pharmacyId: string) => {
    if (!isAdmin) return;
    setProfiles(prev => prev.map(p => 
      p.id === pharmacyId ? { ...p, is_verified: true } : p
    ));
  };

  // --- INVENTORY LOGIC ---

  const getPharmacyInventory = () => {
    if (!currentUser || currentUser.role !== 'pharmacy') return [];
    return inventory.filter(item => item.pharmacy_id === currentUser.id);
  };

  const getAllAvailableInventory = (): AvailableInventoryItem[] => {
    // Customers can see inventory from ALL VERIFIED pharmacies
    const verifiedPharmacyIds = new Set(
      profiles.filter(p => p.role === 'pharmacy' && p.is_verified).map(p => p.id)
    );
    
    return inventory
      .filter(item => verifiedPharmacyIds.has(item.pharmacy_id) && item.stock_level > 0)
      .map(item => {
        const pharmacy = profiles.find(p => p.id === item.pharmacy_id);
        return {
          ...item,
          pharmacy_name: pharmacy?.full_name || 'Unknown Pharmacy'
        };
      });
  };

  const addInventoryItem = (med_name: string, stock_level: number, price: number, category?: string, image_url?: string) => {
    if (!currentUser || currentUser.role !== 'pharmacy') return;
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      pharmacy_id: currentUser.id,
      med_name,
      stock_level,
      price,
      category,
      image_url
    };
    setInventory(prev => [...prev, newItem]);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    if (!currentUser || currentUser.role !== 'pharmacy') return;
    setInventory(prev => prev.map(item => {
      if (item.id === id && item.pharmacy_id === currentUser.id) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const deleteInventoryItem = (id: string) => {
    if (!currentUser || currentUser.role !== 'pharmacy') return;
    setInventory(prev => prev.filter(item => 
      !(item.id === id && item.pharmacy_id === currentUser.id)
    ));
  };

  // --- ORDER LOGIC ---

  const getCustomerOrders = () => {
    if (!currentUser || currentUser.role !== 'customer') return [];
    return orders.filter(o => o.customer_id === currentUser.id).sort((a, b) => b.created_at - a.created_at);
  };

  const getPharmacyOrders = () => {
    if (!currentUser || currentUser.role !== 'pharmacy') return [];
    return orders.filter(o => o.pharmacy_id === currentUser.id).sort((a, b) => b.created_at - a.created_at);
  };

  const createOrder = (pharmacy_id: string, med_name: string, qty: number, total_price: number) => {
    if (!currentUser || currentUser.role !== 'customer') return;
    
    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 9),
      customer_id: currentUser.id,
      pharmacy_id,
      med_name,
      qty,
      total_price,
      status: 'PENDING',
      created_at: Date.now()
    };

    setOrders(prev => [...prev, newOrder]);
    
    // Deduct stock immediately (optimistic update)
    setInventory(prev => prev.map(item => {
      if (item.pharmacy_id === pharmacy_id && item.med_name === med_name) {
        return { ...item, stock_level: Math.max(0, item.stock_level - qty) };
      }
      return item;
    }));
  };

  // ─── Scanner / NAFDAC Methods ──────────────────────────────────────────────

  const verifyBatchCode = async (code: string): Promise<VerifiedBatch | null> => {
    // Simulate 600–900ms network latency (real NAFDAC API call in production)
    await new Promise(res => setTimeout(res, 600 + Math.random() * 300));
    const normalised = code.trim().toUpperCase();
    return SEED_BATCHES.find(b => b.batch_code.toUpperCase() === normalised) ?? null;
  };

  const completeOrderByScan = async (orderId: string): Promise<boolean> => {
    await new Promise(res => setTimeout(res, 400));
    let found = false;
    setOrders(prev => prev.map(order => {
      if (order.id === orderId && order.status !== 'COMPLETED') {
        found = true;
        // Simulate Supabase Broadcast — notify pharmacy dashboard via BroadcastChannel
        try {
          const bc = new BroadcastChannel('pharmae-orders');
          bc.postMessage({ type: 'ORDER_COMPLETED', orderId });
          bc.close();
        } catch { /* BroadcastChannel unsupported in some envs */ }
        return { ...order, status: 'COMPLETED' as OrderStatus };
      }
      return order;
    }));
    return found;
  };

  const logVerification = (code: string, isAuthentic: boolean) => {
    const newLog: VerificationLog = {
      id: Math.random().toString(36).substring(2, 12),
      user_id: currentUserId,
      scanned_code: code,
      is_authentic: isAuthentic,
      created_at: Date.now(),
    };
    setVerificationLogs(prev => [newLog, ...prev]);
  };

  const updateOrderStatus = (order_id: string, status: OrderStatus) => {
    if (!currentUser || currentUser.role !== 'pharmacy') return;
    
    setOrders(prev => prev.map(order => {
      // Security: Pharmacy can only update their own orders
      if (order.id === order_id && order.pharmacy_id === currentUser.id) {
        // If rejected, refund the stock
        if (status === 'REJECTED') {
          setInventory(inv => inv.map(item => {
            if (item.pharmacy_id === order.pharmacy_id && item.med_name === order.med_name) {
              return { ...item, stock_level: item.stock_level + order.qty };
            }
            return item;
          }));
        }
        return { ...order, status };
      }
      return order;
    }));
  };

  return (
    <MockDBContext.Provider value={{
      currentUser,
      login,
      logout,
      setRole,
      verifyPharmacy,
      isAdmin,
      allProfiles: profiles,
      inventory,
      getPharmacyInventory,
      getAllAvailableInventory,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      orders,
      getCustomerOrders,
      getPharmacyOrders,
      createOrder,
      updateOrderStatus,
      verifyBatchCode,
      completeOrderByScan,
      logVerification,
      verificationLogs,
    }}>
      {children}
    </MockDBContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(MockDBContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseMockProvider');
  }
  return context;
}
