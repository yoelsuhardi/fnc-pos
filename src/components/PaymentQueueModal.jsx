import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import EftposModal from './EftposModal';

export default function PaymentQueueModal({ onClose, onPrintReceipt }) {
    const { phoneOrders, payPhoneOrder, triggerKitchenPrint } = usePos();
    const [payingOrder, setPayingOrder] = useState(null);

    const handleEftposSuccess = () => {
        payPhoneOrder(payingOrder.id);
        setPayingOrder(null);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <h2 className="modal-title">Pending Phone Orders</h2>

                {phoneOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No pending phone orders.
                    </div>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {phoneOrders.map(order => (
                            <div key={order.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                borderBottom: '1px solid var(--panel-border)',
                                background: 'rgba(27, 38, 59, 0.5)',
                                marginBottom: '8px',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{order.customerName}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {order.id} • {order.items.length} items
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ fontWeight: '800', fontSize: '1.3rem', color: '#a3b18a' }}>
                                        ${order.total.toFixed(2)}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            style={{ padding: '8px 12px', fontSize: '1rem', background: 'var(--color-specials)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                            onClick={() => triggerKitchenPrint(order)}
                                            title="Reprint Kitchen Docket"
                                        >
                                            🖨️
                                        </button>
                                        <button
                                            style={{ padding: '8px 12px', fontSize: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                            onClick={() => onPrintReceipt && onPrintReceipt(order)}
                                            title="Print Customer Receipt"
                                        >
                                            🧾
                                        </button>
                                        <button
                                            className="pay-btn"
                                            style={{ padding: '8px 20px', fontSize: '1rem', width: 'auto' }}
                                            onClick={() => setPayingOrder(order)}
                                        >
                                            Pay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="modal-actions" style={{ marginTop: '24px' }}>
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>

            {payingOrder && (
                <EftposModal
                    amount={payingOrder.total}
                    onSuccess={handleEftposSuccess}
                    onCancel={() => setPayingOrder(null)}
                />
            )}
        </div>
    );
}
