import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Truck, Loader2, Link2, XCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [courierId, setCourierId] = useState('');
  const [shipmentError, setShipmentError] = useState('');
  const [trackingData, setTrackingData] = useState<{ label_url?: string; invoice_url?: string; tracking?: any[]; shipment?: any } | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  const loadOrder = () => {
    if (!id) return;
    setLoading(true);
    setError('');
    api.get<{ data: Order }>(`/admin/orders/${id}`)
      .then((res) => {
        const o = res.data.data;
        setOrder(o);
        if (o?.status) {
          setSelectedStatus(o.status);
        }
      })
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async () => {
    if (!id || !selectedStatus) return;
    setUpdatingStatus(true);
    setStatusError('');
    setStatusSuccess('');
    try {
      await api.put(`/admin/orders/${id}/status`, {
        status: selectedStatus,
        notes: statusNotes.trim() || undefined,
        notify_customer: true,
      });
      toast.success('Order status updated successfully');
      setStatusSuccess('Order status updated successfully!');
      setStatusNotes('');
      setTimeout(() => setStatusSuccess(''), 3000);
      loadOrder();
    } catch (err: any) {
      setStatusError(err?.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const shipment = order?.shipments?.[0];

  const handleShip = async () => {
    if (!courierId.trim()) return setShipmentError('Enter a courier ID (e.g. 43 for Delhivery Surface)');
    setShipmentLoading(true);
    setShipmentError('');
    try {
      const res = await api.post(`/admin/orders/${id}/shiprocket/ship`, { courier_id: courierId.trim() });
      const created = res.data.data;
      setTrackingData({
        label_url: created?.meta_data?.label_url,
        invoice_url: created?.meta_data?.invoice_url,
        shipment: created,
      });
      loadOrder();
    } catch (err: any) {
      setShipmentError(err?.response?.data?.message || 'Failed to create shipment');
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleTrack = async () => {
    setShipmentLoading(true);
    setShipmentError('');
    try {
      const res = await api.get(`/admin/orders/${id}/shiprocket/tracking`);
      setTrackingData(res.data.data);
      setTrackingOpen(true);
      loadOrder();
    } catch (err: any) {
      setShipmentError(err?.response?.data?.message || 'Failed to fetch tracking');
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!window.confirm('Cancel this Shiprocket shipment? The AWB will be voided.')) return;
    setShipmentLoading(true);
    setShipmentError('');
    try {
      await api.post(`/admin/orders/${id}/shiprocket/cancel`);
      loadOrder();
    } catch (err: any) {
      setShipmentError(err?.response?.data?.message || 'Failed to cancel shipment');
    } finally {
      setShipmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-24 bg-surface-200 dark:bg-surface-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <div className="h-6 w-48 bg-surface-200 dark:bg-surface-800 rounded" />
              <div className="h-4 w-96 bg-surface-200 dark:bg-surface-800 rounded" />
              <div className="h-4 w-64 bg-surface-200 dark:bg-surface-800 rounded" />
            </div>
            <div className="card p-6 space-y-4">
              <div className="h-6 w-32 bg-surface-200 dark:bg-surface-800 rounded" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-surface-200 dark:bg-surface-800 rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <div className="h-6 w-32 bg-surface-200 dark:bg-surface-800 rounded" />
              <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded" />
              <div className="h-4 w-3/4 bg-surface-200 dark:bg-surface-800 rounded" />
            </div>
            <div className="card p-6 space-y-4">
              <div className="h-6 w-32 bg-surface-200 dark:bg-surface-800 rounded" />
              <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded" />
              <div className="h-4 w-3/4 bg-surface-200 dark:bg-surface-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/orders')} className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-primary-500 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const timeline = [
    { status: 'pending', label: 'Order Placed', date: order.created_at, icon: Package },
    { status: 'confirmed', label: 'Confirmed', date: order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? order.updated_at : undefined },
    { status: 'shipped', label: 'Shipped', date: order.status === 'shipped' || order.status === 'delivered' ? order.updated_at : undefined, icon: Truck },
    { status: 'delivered', label: 'Delivered', date: order.status === 'delivered' ? order.updated_at : undefined },
  ];

  if (order.status === 'cancelled') {
    timeline.push({ status: 'cancelled', label: 'Cancelled', date: order.updated_at });
  }
  if (order.status === 'refunded') {
    timeline.push({ status: 'refunded', label: 'Refunded', date: order.updated_at });
  }

  const statusIndex = timeline.findIndex((t) => t.status === order.status);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-primary-500 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Order #{order.order_number}</h1>
            <p className="text-surface-400 text-sm mt-1">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
            <span className={`badge ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 font-heading">Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-700/50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">Product</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">SKU</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-surface-500 uppercase">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-surface-500 uppercase">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-surface-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-surface-100 shrink-0" />
                          )}
                          <div className="space-y-1">
                            <span className="text-sm font-medium block text-surface-900 dark:text-white">{item.name}</span>
                            {item.meta_data && (
                              <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-xs space-y-1 mt-1">
                                <span className="font-bold text-primary-600 dark:text-primary-400 block">🎨 Custom Embroidery Specs</span>
                                {item.meta_data.photo_url && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-surface-500">Design File:</span>
                                    <a
                                      href={item.meta_data.photo_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-primary-500 underline font-semibold flex items-center gap-1 hover:text-primary-600"
                                    >
                                      <Link2 size={12} />
                                      View / Download Image
                                    </a>
                                  </div>
                                )}
                                {item.meta_data.embroidery_size && (
                                  <div>
                                    <span className="text-surface-500">Size:</span> <span className="font-semibold text-surface-800 dark:text-surface-200">{item.meta_data.embroidery_size}</span>
                                  </div>
                                )}
                                {item.meta_data.placement && (
                                  <div>
                                    <span className="text-surface-500">Placement:</span> <span className="font-semibold text-surface-800 dark:text-surface-200">{item.meta_data.placement}</span>
                                  </div>
                                )}
                                {item.meta_data.notes && (
                                  <div>
                                    <span className="text-surface-500">Notes:</span> <span className="font-semibold text-surface-800 dark:text-surface-200">{item.meta_data.notes}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-surface-500">{item.sku || '—'}</td>
                      <td className="px-3 py-3 text-sm text-right">{formatCurrency(item.price)}</td>
                      <td className="px-3 py-3 text-sm text-right">{item.quantity}</td>
                      <td className="px-3 py-3 text-sm text-right font-medium">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 font-heading">Timeline</h2>
            <div className="relative">
              {timeline.map((step, i) => {
                const isActive = i <= statusIndex;
                const isLastActive = i === statusIndex;
                return (
                  <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        isActive
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-400'
                      }`}>
                        {i + 1}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 ${isLastActive ? 'bg-gradient-to-b from-primary-500 to-surface-200 dark:to-surface-700' : isActive ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-medium ${isActive ? 'text-surface-900 dark:text-white' : 'text-surface-400'}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-surface-400 mt-0.5">{formatDate(step.date)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Manual Order Status Card */}
          <div className="card p-6 border-t-4 border-t-primary-500 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 font-heading flex items-center justify-between">
              <span>Update Order Status</span>
              <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
            </h2>

            {statusError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400 mb-3">
                {statusError}
              </div>
            )}
            {statusSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-sm text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} /> {statusSuccess}
              </div>
            )}

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">Select Status</label>
                <select
                  value={selectedStatus || order.status}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field w-full font-medium"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">Status Notes (Optional)</label>
                <input
                  type="text"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Manually marked as processed by Admin..."
                  className="input-field w-full"
                />
              </div>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updatingStatus || (selectedStatus === order.status && !statusNotes.trim())}
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                {updatingStatus ? <Loader2 size={14} className="animate-spin" /> : null}
                {updatingStatus ? 'Updating Status...' : 'Save Order Status'}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 font-heading">Customer</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.customer?.name || 'Guest'}</p>
              {order.customer?.email && (
                <p className="text-surface-400">{order.customer.email}</p>
              )}
              {order.customer?.phone && (
                <p className="text-surface-400">{order.customer.phone}</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 font-heading">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.shipping_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-surface-400">Shipping</span>
                  <span>{formatCurrency(order.shipping_cost)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-surface-400">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}
              <div className="border-t border-surface-100 dark:border-surface-700/50 pt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {order.shipping_address && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 font-heading flex items-center gap-2">
                <MapPin size={16} className="text-surface-400" /> Shipping Address
              </h2>
              <div className="text-sm space-y-1 text-surface-600 dark:text-surface-400">
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 font-heading flex items-center gap-2">
              <Truck size={16} className="text-surface-400" /> Shipment
            </h2>
            {shipmentError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400 mb-3">
                {shipmentError}
              </div>
            )}

            {shipment ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-400">Tracking #</span>
                  <span className="font-mono font-medium">{shipment.tracking_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Carrier</span>
                  <span>{shipment.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Status</span>
                  <span className={`badge ${getStatusColor(String(shipment.status))}`}>{shipment.status}</span>
                </div>
                {shipment.shipped_at && (
                  <div className="flex justify-between">
                    <span className="text-surface-400">Shipped</span>
                    <span>{formatDate(shipment.shipped_at)}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={handleTrack} disabled={shipmentLoading} className="btn-secondary flex-1 inline-flex items-center justify-center gap-2">
                    {shipmentLoading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                    Track
                  </button>
                  {trackingData?.label_url && (
                    <a href={trackingData.label_url} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 inline-flex items-center justify-center gap-2">
                      <Link2 size={14} /> Label
                    </a>
                  )}
                  {shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (
                    <button onClick={handleCancelShipment} disabled={shipmentLoading} className="btn-danger flex-1 inline-flex items-center justify-center gap-2">
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                </div>

                {trackingOpen && trackingData && (
                  <div className="mt-3 border-t border-surface-100 dark:border-surface-700/50 pt-3 space-y-2 max-h-64 overflow-y-auto">
                    {(trackingData.tracking || []).length > 0 ? (
                      (trackingData.tracking as any[]).slice(0, 10).map((entry, i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <span className="text-surface-400 w-24 shrink-0">{entry.date ? `${entry.date} ${entry.time || ''}` : ''}</span>
                          <span className="text-surface-600 dark:text-surface-300">{entry.activity || entry.status}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-surface-400">No tracking updates yet.</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-surface-400">
                  No shipment yet. Create one via Shiprocket once the payment is confirmed.
                </p>
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">Courier ID</label>
                  <input
                    value={courierId}
                    onChange={(e) => setCourierId(e.target.value)}
                    className="input-field"
                    placeholder={order.shipping_method ? `Selected at checkout: ${order.shipping_method}` : 'e.g. 43 (Delhivery Surface)'}
                  />
                </div>
                <button onClick={handleShip} disabled={shipmentLoading} className="btn-primary w-full inline-flex items-center justify-center gap-2">
                  {shipmentLoading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                  Create Shipment
                </button>
              </div>
            )}
          </div>

          {order.billing_address && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 font-heading flex items-center gap-2">
                <MapPin size={16} className="text-surface-400" /> Billing Address
              </h2>
              <div className="text-sm space-y-1 text-surface-600 dark:text-surface-400">
                <p>{order.billing_address.address_line1}</p>
                {order.billing_address.address_line2 && <p>{order.billing_address.address_line2}</p>}
                <p>{order.billing_address.city}, {order.billing_address.state} - {order.billing_address.pincode}</p>
                <p>{order.billing_address.country}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
