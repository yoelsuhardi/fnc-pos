import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import EftposModal from './EftposModal';
import CashTenderModal from './CashTenderModal';

export default function PaymentQueueModal({ onClose, onPrintReceipt }) {
    const { phoneOrders, payPhoneOrder, triggerKitchenPrint } = usePos();
    const [payingOrder, setPayingOrder] = useState(null);
    const [payingMethod, setPayingMethod] = useState(null); // 'eftpos' or 'cash'
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const handleSuccess = (method) => {
        payPhoneOrder(payingOrder.id, method);
        setPayingOrder(null);
        setPayingMethod(null);
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
                            <React.Fragment key={order.id}>
                                <div style={{
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
                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>{order.customerName}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                                            #{order.id} • {new Date(order.time).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <button
                                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                            style={{
                                                background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
                                                padding: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px'
                                            }}
                                        >
                                            {expandedOrderId === order.id ? '▼ Hide Details' : '▶ View Details'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
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
                                                style={{ padding: '8px 16px', fontSize: '0.9rem', width: 'auto', background: '#27ae60' }}
                                                onClick={() => { setPayingOrder(order); setPayingMethod('cash'); }}
                                            >
                                                💵 Cash
                                            </button>
                                            <button
                                                className="pay-btn"
                                                style={{ padding: '8px 16px', fontSize: '0.9rem', width: 'auto' }}
                                                onClick={() => { setPayingOrder(order); setPayingMethod('eftpos'); }}
                                            >
                                                💳 Card
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Order Details */}
                                {expandedOrderId === order.id && (
                                    <div style={{
                                        margin: '-8px 0 12px 0', padding: '16px',
                                        background: 'rgba(20, 28, 45, 0.4)', borderRadius: '0 0 8px 8px',
                                        border: '1px solid var(--panel-border)', borderTop: 'none'
                                    }}>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{item.qty}x</span>
                                                        <span>{item.name}</span>
                                                        {item.modifier && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> ({item.modifier.name})</span>}
                                                    </div>
                                                    <span>${item.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                <div className="modal-actions" style={{ marginTop: '24px' }}>
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>

            {payingOrder && payingMethod === 'eftpos' && (
                <EftposModal
                    amount={payingOrder.total}
                    onSuccess={() => handleSuccess('eftpos')}
                    onCancel={() => { setPayingOrder(null); setPayingMethod(null); }}
                />
            )}

            {payingOrder && payingMethod === 'cash' && (
                <CashTenderModal
                    amountDue={payingOrder.total}
                    onSuccess={() => handleSuccess('cash')}
                    onCancel={() => { setPayingOrder(null); setPayingMethod(null); }}
                />
            )}
        </div>
    );
}
