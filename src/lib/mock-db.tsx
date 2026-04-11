import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'customer' | 'pharmacy';

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
  addInventoryItem: (med_name: string, stock_level: number, price: number) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  // Order Methods
  orders: Order[];
  getCustomerOrders: () => Order[];
  getPharmacyOrders: () => Order[];
  createOrder: (pharmacy_id: string, med_name: string, qty: number, total_price: number) => void;
  updateOrderStatus: (order_id: string, status: OrderStatus) => void;
}

const MockDBContext = createContext<MockDBContextType | undefined>(undefined);

const ADMIN_EMAIL = 'dexdivine9@gmail.com';
const AUTO_CANCEL_MS = 30000; // 30 seconds for testing (would be 3 mins in prod)

export function SupabaseMockProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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

  const addInventoryItem = (med_name: string, stock_level: number, price: number) => {
    if (!currentUser || currentUser.role !== 'pharmacy') return;
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      pharmacy_id: currentUser.id,
      med_name,
      stock_level,
      price
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
      updateOrderStatus
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
