import React from 'react';
import { usePos } from '../context/PosContext';

export default function Cart({ onPayEftpos, onSavePhoneOrder }) {
    const { cart, removeFromCart, cartTotal, orderType, setOrderType } = usePos();

    return (
        <div className="cart-area">
            <div className="cart-header">
                <h2>Current Order</h2>
                <div className="cart-type-selector">
                    <button
                        className={`cart-type-btn ${orderType === 'walk-in' ? 'active' : ''}`}
                        onClick={() => setOrderType('walk-in')}
                    >
                        Walk In
                    </button>
                    <button
                        className={`cart-type-btn ${orderType === 'phone' ? 'active' : ''}`}
                        onClick={() => setOrderType('phone')}
                    >
                        Phone
                    </button>
                </div>
            </div>

            <div className="cart-items">
                {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                        No items in order
                    </div>
                ) : (
                    cart.map((item) => (
                        <div className="cart-item" key={item.cartItemId}>
                            <div className="cart-item-details" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-start', paddingRight: '15px' }}>
                                <span className="cart-item-name" style={{ whiteSpace: 'pre-wrap', textAlign: 'left', width: '100%' }}>
                                    {item.qty > 1 ? `${item.qty}x ${item.label}` : item.label}
                                </span>
                            </div>
                            <div className="cart-item-price">
                                ${item.price.toFixed(2)}
                                <button className="cart-item-remove" onClick={() => removeFromCart(item.cartItemId)}>
                                    ×
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="cart-footer">
                <div className="cart-totals">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                </div>

                {orderType === 'walk-in' ? (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="pay-btn"
                            style={{ flex: 1, background: '#e0a96d', color: '#000' }}
                            disabled={cart.length === 0}
                            onClick={() => onPayEftpos('cash')}
                        >
                            💵 CASH
                        </button>
                        <button
                            className="pay-btn"
                            style={{ flex: 2 }}
                            disabled={cart.length === 0}
                            onClick={() => onPayEftpos('eftpos')}
                        >
                            💳 EFTPOS
                        </button>
                    </div>
                ) : (
                    <button
                        className="pay-btn"
                        style={{ background: 'var(--color-action)' }}
                        disabled={cart.length === 0}
                        onClick={onSavePhoneOrder}
                    >
                        📞 Save Phone Order
                    </button>
                )}
            </div>
        </div>
    );
}
