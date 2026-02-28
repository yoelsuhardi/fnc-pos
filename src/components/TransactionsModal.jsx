import React from 'react';
import { usePos } from '../context/PosContext';

export default function TransactionsModal({ onClose }) {
    const { paidOrders, triggerKitchenPrint } = usePos();

    // Filter for today's orders
    const today = new Date().toDateString();
    const todaysOrders = paidOrders.filter(o => new Date(o.time || o.paidTime).toDateString() === today);

    // Calculate total earnings
    const dailyTotal = todaysOrders.reduce((sum, o) => sum + o.total, 0);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '600px', maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Today's Transactions</h2>

                <div style={{
                    background: '#e0a96d',
                    padding: '15px',
                    borderRadius: '8px',
                    margin: '10px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <strong style={{ fontSize: '1.2rem', color: '#000' }}>Daily Total:</strong>
                    <strong style={{ fontSize: '1.5rem', color: '#000' }}>${dailyTotal.toFixed(2)}</strong>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginTop: '10px', paddingRight: '10px' }}>
                    {todaysOrders.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No transactions yet today.</p>
                    ) : (
                        todaysOrders.map(order => (
                            <div key={order.id} style={{
                                background: 'var(--panel-bg)',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid var(--panel-border)',
                                color: 'white'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{order.customerName || 'Walk-in'} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({order.id})</span></div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {new Date(order.time || order.paidTime).toLocaleTimeString('en-AU')}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {order.items?.length || 0} items
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <strong style={{ fontSize: '1.2rem', color: '#a3b18a' }}>${order.total.toFixed(2)}</strong>
                                    <button
                                        className="pay-btn"
                                        style={{ background: 'var(--color-specials)', color: 'white', padding: '8px 16px', borderRadius: '4px', fontSize: '0.9rem', minWidth: '100px' }}
                                        onClick={() => triggerKitchenPrint(order, true)}
                                    >
                                        🖨️ Re-print
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                    <button className="cancel-btn" onClick={onClose} style={{ widows: '100px' }}>Close</button>
                </div>
            </div>
        </div>
    );
}
