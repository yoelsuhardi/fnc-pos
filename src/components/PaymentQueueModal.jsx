import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import EftposModal from './EftposModal';
import CashTenderModal from './CashTenderModal';

export default function PaymentQueueModal({ onClose, onPrintReceipt }) {
    const { phoneOrders, payPhoneOrder, triggerKitchenPrint, selectedPrinter } = usePos();
    const [payingOrder, setPayingOrder] = useState(null);
    const [payingMethod, setPayingMethod] = useState(null); // 'eftpos' or 'cash'
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const triggerDrawerKick = () => {
        if (typeof window !== 'undefined' && window.process?.type === 'renderer') {
            const { ipcRenderer } = window.require('electron');
            // Sending a print job while POS UI is hidden by @media print creates a blank 1mm slip.
            // This is the universal standard way to trigger the RJ11 Cash Drawer via ESC/POS drivers.
            ipcRenderer.send('silent-print', { isPreview: false, printerName: selectedPrinter });
        }
    };

    const handleSuccess = (method) => {
        payPhoneOrder(payingOrder.id, method);
        if (method === 'cash') {
            triggerDrawerKick();
        }
        setPayingOrder(null);
        setPayingMethod(null);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '650px', background: '#ffffff', color: '#0f172a', padding: '32px', borderRadius: '16px' }}>
                <h2 className="modal-title" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', border: 'none', marginBottom: '24px', color: '#0f172a' }}>
                    Pending Phone Orders
                </h2>

                {phoneOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '1.2rem' }}>
                        No pending phone orders.
                    </div>
                ) : (
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {phoneOrders.map(order => (
                            <React.Fragment key={order.id}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '20px',
                                    background: '#1e293b', // Dark slate for maximum contrast
                                    marginBottom: '16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                                }}>
                                    {/* Left Side: Info & Details */}
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                        <div style={{ fontWeight: '800', fontSize: '1.4rem', color: '#ffffff', marginBottom: '4px' }}>
                                            {order.customerName}
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '8px', fontWeight: '500' }}>
                                            #{order.id} • {new Date(order.time).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <button
                                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                            style={{
                                                background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer',
                                                padding: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.8rem' }}>{expandedOrderId === order.id ? '▼' : '▶'}</span> {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                                        </button>
                                    </div>

                                    {/* Right Side: Price & Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                        <div style={{ fontWeight: '900', fontSize: '1.8rem', color: '#a3e635', marginBottom: '16px', textShadow: '0px 1px 3px rgba(0,0,0,0.5)' }}>
                                            ${order.total.toFixed(2)}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                                onClick={() => triggerKitchenPrint(order)}
                                                title="Reprint Kitchen Docket"
                                            >
                                                🖨️
                                            </button>
                                            <button
                                                style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                                onClick={() => onPrintReceipt && onPrintReceipt(order)}
                                                title="Print Customer Receipt"
                                            >
                                                🧾
                                            </button>
                                            <button
                                                className="pay-btn"
                                                style={{ padding: '0 16px', height: '42px', fontSize: '1.1rem', fontWeight: 'bold', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                                onClick={() => { setPayingOrder(order); setPayingMethod('cash'); }}
                                            >
                                                💵 Cash
                                            </button>
                                            <button
                                                className="pay-btn"
                                                style={{ padding: '0 16px', height: '42px', fontSize: '1.1rem', fontWeight: 'bold', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
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
                                        margin: '-20px 0 16px 0', padding: '24px 20px 16px 20px',
                                        background: '#f8fafc', borderRadius: '0 0 12px 12px',
                                        border: '1px solid #e2e8f0', borderTop: 'none',
                                        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
                                        color: '#334155'
                                    }}>
                                        <div style={{ fontSize: '1rem' }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#0f172a' }}>{item.qty}x</span>
                                                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                                                        {item.modifier && <span style={{ color: '#64748b', fontSize: '0.9rem' }}> ({item.modifier.name})</span>}
                                                    </div>
                                                    <span style={{ fontWeight: '600', color: '#0f172a' }}>${item.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                <div className="modal-actions" style={{ marginTop: '32px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%', padding: '16px', fontSize: '1.3rem', fontWeight: 'bold',
                            background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1',
                            borderRadius: '12px', cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
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
