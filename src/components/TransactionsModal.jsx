import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export default function TransactionsModal({ onClose, onPrintReceipt }) {
    const { paidOrders, triggerKitchenPrint, voidOrder } = usePos();
    const [confirmVoidId, setConfirmVoidId] = useState(null);

    const today = new Date().toDateString();
    const todaysOrders = paidOrders.filter(o => new Date(o.time || o.paidTime).toDateString() === today);
    const dailyTotal = todaysOrders.reduce((sum, o) => sum + o.total, 0);

    const handleVoid = (orderId) => {
        voidOrder(orderId);
        setConfirmVoidId(null);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '620px', maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ margin: '0 0 10px 0', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px' }}>
                    Today's Transactions
                </h2>

                <div style={{ background: '#fef9e7', padding: '15px', borderRadius: '8px', margin: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1c40f' }}>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Daily Total:</strong>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>${dailyTotal.toFixed(2)}</strong>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginTop: '10px', paddingRight: '4px' }}>
                    {todaysOrders.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No transactions yet today.</p>
                    ) : (
                        todaysOrders.map(order => (
                            <div key={order.id} style={{
                                background: 'var(--bg-color)', padding: '14px', borderRadius: '8px',
                                marginBottom: '10px', border: '1px solid var(--panel-border)', color: 'var(--text-main)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    {/* Order info */}
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                                            {order.customerName || 'Walk-in'}{' '}
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(#{order.id})</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {new Date(order.time || order.paidTime).toLocaleTimeString('en-AU')}
                                            {' · '}{order.items?.length || 0} items
                                            {order.paymentMethod && ` · ${order.paymentMethod === 'cash' ? '💵 Cash' : order.paymentMethod === 'eftpos' ? '💳 EFTPOS' : '📞 Phone'}`}
                                        </div>
                                        {order.note && (
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                                                📝 {order.note}
                                            </div>
                                        )}
                                    </div>
                                    {/* Amount */}
                                    <strong style={{ fontSize: '1.2rem', color: 'var(--color-sides)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                                        ${order.total.toFixed(2)}
                                    </strong>
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    <button
                                        style={{ flex: 1, padding: '7px', borderRadius: '6px', background: 'var(--color-specials)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                                        onClick={() => triggerKitchenPrint(order)}
                                    >
                                        🖨️ Reprint Docket
                                    </button>

                                    <button
                                        style={{ flex: 1, padding: '7px', borderRadius: '6px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                                        onClick={() => onPrintReceipt && onPrintReceipt(order)}
                                    >
                                        🧾 Print Receipt
                                    </button>

                                    {confirmVoidId === order.id ? (
                                        <>
                                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#f44336', paddingLeft: '4px' }}>Confirm void?</span>
                                            <button
                                                style={{ padding: '7px 14px', borderRadius: '6px', background: '#f44336', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                                                onClick={() => handleVoid(order.id)}
                                            >
                                                ✓ Yes, Void
                                            </button>
                                            <button
                                                style={{ padding: '7px 12px', borderRadius: '6px', background: '#ecf0f1', color: '#333', border: '1px solid #bdc3c7', cursor: 'pointer', fontWeight: 'bold' }}
                                                onClick={() => setConfirmVoidId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            style={{ padding: '7px 14px', borderRadius: '6px', background: 'transparent', color: '#f44336', border: '1px solid #f44336', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                                            onClick={() => setConfirmVoidId(order.id)}
                                        >
                                            🗑️ Void
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--panel-border)' }}>
                    <button className="btn-secondary" style={{ padding: '10px 24px' }} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
