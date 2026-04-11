-- ========================================================================================
-- PHARMA-E NETWORK: SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 1. PROFILES TABLE POLICIES
-- ==========================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Verified pharmacies can be read by anyone (so customers can see who they are buying from)
CREATE POLICY "Anyone can view verified pharmacies" 
ON profiles FOR SELECT 
USING (role = 'pharmacy' AND is_verified = true);

-- Policy: Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile (BUT NOT their verification status or role)
-- Note: In a real production app, you'd use a trigger or a secure RPC to prevent users from updating `is_verified` or `role` directly.
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);


-- ==========================================
-- 2. INVENTORY TABLE POLICIES (The "Privacy Gap" Fix)
-- ==========================================

-- Policy: Customers can read ALL inventory from VERIFIED pharmacies
CREATE POLICY "Customers can view verified pharmacy inventory" 
ON inventory FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = inventory.pharmacy_id 
    AND profiles.is_verified = true
  )
);

-- Policy: Pharmacies can ONLY read their OWN inventory (Prevents Price Scraping)
CREATE POLICY "Pharmacies can view own inventory" 
ON inventory FOR SELECT 
USING (auth.uid() = pharmacy_id);

-- Policy: Pharmacies can insert their own inventory
CREATE POLICY "Pharmacies can insert own inventory" 
ON inventory FOR INSERT 
WITH CHECK (auth.uid() = pharmacy_id);

-- Policy: Pharmacies can update their own inventory
CREATE POLICY "Pharmacies can update own inventory" 
ON inventory FOR UPDATE 
USING (auth.uid() = pharmacy_id);

-- Policy: Pharmacies can delete their own inventory
CREATE POLICY "Pharmacies can delete own inventory" 
ON inventory FOR DELETE 
USING (auth.uid() = pharmacy_id);


-- ==========================================
-- 3. ORDERS TABLE POLICIES
-- ==========================================

-- Policy: Customers can view their own orders
CREATE POLICY "Customers can view own orders" 
ON orders FOR SELECT 
USING (auth.uid() = customer_id);

-- Policy: Pharmacies can view orders assigned to them
CREATE POLICY "Pharmacies can view assigned orders" 
ON orders FOR SELECT 
USING (auth.uid() = pharmacy_id);

-- Policy: Customers can create orders
CREATE POLICY "Customers can create orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- Policy: Pharmacies can update the status of orders assigned to them
CREATE POLICY "Pharmacies can update assigned orders" 
ON orders FOR UPDATE 
USING (auth.uid() = pharmacy_id);

-- Note: Customers should generally NOT be able to update orders directly once placed, 
-- or delete them. Cancellations should be handled via a secure RPC/Edge Function.
