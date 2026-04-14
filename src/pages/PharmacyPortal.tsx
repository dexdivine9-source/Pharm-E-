import React, { useState, useMemo } from 'react';
import { useSupabase } from '../lib/mock-db';
import { LogOut, Plus, Search, Package, Edit2, Trash2, ChevronLeft, ChevronRight, ClipboardList, CheckCircle2, XCircle, Clock, AlertTriangle, ScanLine } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function PharmacyPortal() {
  const { 
    currentUser, logout, 
    getPharmacyInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem,
    getPharmacyOrders, updateOrderStatus
  } = useSupabase();
  const navigate = useNavigate();

  // Local State
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newMedName, setNewMedName] = useState('');
  const [newStock, setNewStock] = useState<number | ''>('');
  const [newPrice, setNewPrice] = useState<number | ''>('');

  const itemsPerPage = 5;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || newStock === '' || newPrice === '') return;
    
    addInventoryItem(newMedName, Number(newStock), Number(newPrice));
    
    setNewMedName('');
    setNewStock('');
    setNewPrice('');
    setIsAdding(false);
  };

  // --- INVENTORY DATA ---
  const myInventory = getPharmacyInventory();
  const filteredInventory = useMemo(() => {
    return myInventory.filter(item => 
      item.med_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [myInventory, searchTerm]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- ORDERS DATA ---
  const myOrders = getPharmacyOrders();
  const pendingOrdersCount = myOrders.filter(o => o.status === 'PENDING').length;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/> Action Required</span>;
      case 'ACCEPTED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1"/> Accepted</span>;
      case 'REJECTED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
      case 'EXPIRED_ROUTING': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1"/> Missed (Re-routed)</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-emerald-100" />
            <h1 className="text-2xl font-bold text-white">Pharmacy Portal</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-emerald-100 hidden sm:inline-block">
              Verified Pharmacy: {currentUser?.full_name}
            </span>
            <Link
              to="/scan"
              id="portal-scan-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white text-sm font-bold rounded-lg transition-colors"
            >
              <ScanLine className="h-4 w-4" />
              Scan Products
            </Link>
            <button onClick={handleLogout} className="text-emerald-100 hover:text-white transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <ClipboardList className="mr-2 h-5 w-5" />
              Incoming Orders
              {pendingOrdersCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`${
                activeTab === 'inventory'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Package className="mr-2 h-5 w-5" />
              Inventory Management
            </button>
          </nav>
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Queue</h2>
              <div className="space-y-4">
                {myOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders have been routed to your pharmacy yet.</p>
                ) : (
                  myOrders.map(order => (
                    <div key={order.id} className={`border rounded-lg p-4 ${order.status === 'PENDING' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{order.qty}x {order.med_name}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            Order ID: {order.id} • Received: {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="block text-xl font-bold text-emerald-600">₦{order.total_price.toLocaleString()}</span>
                        </div>
                      </div>

                      {order.status === 'PENDING' && (
                        <div className="mt-4 flex space-x-3 border-t border-yellow-200 pt-4">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                            className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors flex justify-center items-center"
                          >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Accept Order
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to reject this order? The stock will be refunded.")) {
                                updateOrderStatus(order.id, 'REJECTED');
                              }
                            }}
                            className="flex-1 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-md font-medium hover:bg-red-50 transition-colors flex justify-center items-center"
                          >
                            <XCircle className="w-5 h-5 mr-2" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <>
            {/* Top Controls: Search and Add Button */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
              <div className="relative max-w-md w-full mb-4 sm:mb-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Medication
              </button>
            </div>

            {/* Add Medication Form */}
            {isAdding && (
              <div className="bg-white shadow sm:rounded-lg mb-8 border-t-4 border-emerald-500 overflow-hidden transition-all">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Inventory Item</h3>
                  <form onSubmit={handleAddSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-4 sm:gap-x-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="medName" className="block text-sm font-medium text-gray-700">Medication Name</label>
                      <input
                        type="text"
                        id="medName"
                        required
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="e.g., Amoxicillin 500mg"
                      />
                    </div>
                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Level</label>
                      <input
                        type="number"
                        id="stock"
                        required
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value ? Number(e.target.value) : '')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="e.g., 50"
                      />
                    </div>
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₦)</label>
                      <input
                        type="number"
                        id="price"
                        required
                        min="0"
                        step="0.01"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : '')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="e.g., 1500"
                      />
                    </div>
                    <div className="sm:col-span-4 flex justify-end space-x-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        Save Item
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Inventory Data Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medication
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price (₦)
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedInventory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          {searchTerm ? 'No medications found matching your search.' : 'Your inventory is empty. Add a medication to get started.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.med_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.stock_level > 10 ? 'bg-green-100 text-green-800' : 
                              item.stock_level > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.stock_level} in stock
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₦{item.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => {
                                const newStock = prompt(`Update stock for ${item.med_name}:`, item.stock_level.toString());
                                if (newStock !== null && !isNaN(Number(newStock))) {
                                  updateInventoryItem(item.id, { stock_level: Number(newStock) });
                                }
                              }}
                              className="text-emerald-600 hover:text-emerald-900 mr-4"
                              title="Quick Edit Stock"
                            >
                              <Edit2 className="h-4 w-4 inline" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${item.med_name}?`)) {
                                  deleteInventoryItem(item.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredInventory.length)}</span> of <span className="font-medium">{filteredInventory.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
