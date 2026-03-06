import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export default function Cart({ onPayEftpos, onSavePhoneOrder, onPrintInvoice }) {
    const {
        cart, removeFromCart, updateCartQty, clearCart, cartSubtotal, cartTotal,
        orderType, setOrderType,
        orderNote, setOrderNote,
        discount, setDiscount, discountAmount
    } = usePos();

    const [showDiscount, setShowDiscount] = useState(false);
    const [discountInput, setDiscountInput] = useState('');
    const [discountType, setDiscountType] = useState('amount'); // 'amount' | 'percent'

    const applyDiscount = () => {
        const val = parseFloat(discountInput);
        if (!val || val <= 0) { clearDiscount(); return; }
        if (discountType === 'percent' && val > 100) return;
        setDiscount({ type: discountType, value: val });
        setShowDiscount(false);
    };

    const clearDiscount = () => {
        setDiscount({ type: 'none', value: 0 });
        setDiscountInput('');
        setShowDiscount(false);
    };

    return (
        <div className="cart-area">
            <div className="cart-header">
                <h2>Current Order</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {cart.length > 0 && (
                        <button
                            onClick={() => { if (window.confirm('Hapus semua item dari order?')) clearCart(); }}
                            style={{ padding: '5px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                            title="Hapus semua item"
                        >
                            🗑️ Clear
                        </button>
                    )}
                    <div className="cart-type-selector">
                        <button className={`cart-type-btn ${orderType === 'walk-in' ? 'active' : ''}`} onClick={() => setOrderType('walk-in')}>Walk In</button>
                        <button className={`cart-type-btn ${orderType === 'phone' ? 'active' : ''}`} onClick={() => setOrderType('phone')}>Phone</button>
                    </div>
                </div>
            </div>

            <div className="cart-items">
                {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>No items in order</div>
                ) : (
                    cart.map((item) => (
                        <div className="cart-item" key={item.cartItemId} style={{ display: 'flex', alignItems: 'center', padding: '8px', marginBottom: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                            {/* Qty Stepper on the left */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--panel-bg)', borderRadius: '6px', border: '1px solid var(--panel-border)', padding: '2px', flexShrink: 0, marginRight: '10px' }}>
                                <button
                                    onClick={() => updateCartQty(item.cartItemId, item.qty - 1)}
                                    style={{ width: '26px', height: '26px', background: item.qty === 1 ? '#fee2e2' : 'var(--bg-color)', color: item.qty === 1 ? '#ef4444' : 'var(--text-main)', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', lineHeight: 1 }}
                                    title={item.qty === 1 ? 'Remove item' : 'Decrease qty'}
                                >
                                    {item.qty === 1 ? '×' : '−'}
                                </button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>{item.qty}</span>
                                <button
                                    onClick={() => updateCartQty(item.cartItemId, item.qty + 1)}
                                    style={{ width: '26px', height: '26px', background: 'var(--bg-color)', color: 'var(--color-action)', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', lineHeight: 1 }}
                                    title="Increase qty"
                                >
                                    +
                                </button>
                            </div>

                            {/* Item details flex area */}
                            <div className="cart-item-details" style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="cart-item-name" style={{ flex: 1, whiteSpace: 'pre-wrap', textAlign: 'left', paddingRight: '12px', fontSize: '0.9rem', lineHeight: '1.2' }}>
                                    {item.label}
                                </span>
                                <span style={{ textAlign: 'right', fontSize: '1rem', fontWeight: '600', minWidth: '60px' }}>${item.price.toFixed(2)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="cart-footer">
                {/* Order Note */}
                <textarea
                    value={orderNote}
                    onChange={e => setOrderNote(e.target.value)}
                    placeholder="📝 Order note (e.g. no onion, extra sauce)..."
                    maxLength={120}
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '8px 10px', marginBottom: '10px',
                        background: 'var(--panel-bg)', color: 'var(--text-main)',
                        border: orderNote ? '1px solid var(--color-action)' : '1px solid #ccc',
                        borderRadius: '8px', fontSize: '0.85rem', resize: 'none',
                        height: '52px', fontFamily: 'inherit',
                    }}
                />

                {/* Totals */}
                {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2px' }}>
                        <span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                )}
                {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontSize: '0.9rem', marginBottom: '2px' }}>
                        <span>
                            Discount {discount.type === 'percent' ? `(${discount.value}%)` : ''}
                            <button onClick={clearDiscount} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '6px' }}>✕</button>
                        </span>
                        <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="cart-totals">
                    <span>Total</span><span>${cartTotal.toFixed(2)}</span>
                </div>

                {/* Discount toggle */}
                {showDiscount ? (
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', alignItems: 'center' }}>
                        <select
                            value={discountType}
                            onChange={e => setDiscountType(e.target.value)}
                            style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid #ccc', fontSize: '0.9rem' }}
                        >
                            <option value="amount">$ Amount</option>
                            <option value="percent">% Percent</option>
                        </select>
                        <input
                            type="number" min="0" max={discountType === 'percent' ? 100 : undefined}
                            value={discountInput}
                            onChange={e => setDiscountInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyDiscount()}
                            placeholder={discountType === 'percent' ? 'e.g. 10' : 'e.g. 5.00'}
                            autoFocus
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--color-action)', fontSize: '0.9rem' }}
                        />
                        <button onClick={applyDiscount} style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--color-action)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>✓</button>
                        <button onClick={() => setShowDiscount(false)} style={{ padding: '8px 10px', borderRadius: '6px', background: '#e0e0e0', color: '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <button
                            onClick={() => setShowDiscount(true)}
                            disabled={cart.length === 0}
                            style={{
                                flex: 1, padding: '9px', background: 'transparent',
                                color: cart.length === 0 ? '#aaa' : 'var(--color-success)',
                                border: `1px solid ${cart.length === 0 ? '#ccc' : 'var(--color-success)'}`,
                                borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
                                cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            🏷️ {discountAmount > 0 ? `Discount: -$${discountAmount.toFixed(2)}` : 'Add Discount'}
                        </button>
                        <button
                            onClick={onPrintInvoice}
                            disabled={cart.length === 0}
                            style={{
                                flex: 1, padding: '9px', background: 'transparent',
                                color: cart.length === 0 ? '#aaa' : 'var(--text-main)',
                                border: `1px solid ${cart.length === 0 ? '#ccc' : 'var(--panel-border)'}`,
                                borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
                                cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            🧾 Invoice
                        </button>
                    </div>
                )}

                {/* Payment buttons */}
                {orderType === 'walk-in' ? (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="pay-btn" style={{ flex: 1, background: '#f1c40f', color: '#000' }} disabled={cart.length === 0} onClick={() => onPayEftpos('cash')}>💵 CASH</button>
                        <button className="pay-btn" style={{ flex: 2 }} disabled={cart.length === 0} onClick={() => onPayEftpos('eftpos')}>💳 EFTPOS</button>
                    </div>
                ) : (
                    <button className="pay-btn" style={{ background: 'var(--color-action)' }} disabled={cart.length === 0} onClick={onSavePhoneOrder}>📞 Save Phone Order</button>
                )}
            </div>
        </div>
    );
}
