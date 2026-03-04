import React, { useState } from 'react';
import { fishModifiers } from '../data/menu';

export default function ModifierModal({ item, onSelect, onClose, priceMultiplier = 1 }) {
    const [quantity, setQuantity] = useState(1);
    // Track selected modifiers for each fish: null = Battered (default)
    const [selections, setSelections] = useState([null]);

    if (!item) return null;

    const handleQuantityChange = (delta) => {
        const newQty = Math.max(1, quantity + delta);
        setQuantity(newQty);
        setSelections(prev => {
            if (newQty > prev.length) {
                // Add default nulls for new items
                return [...prev, ...Array.from({ length: newQty - prev.length }, () => null)];
            } else if (newQty < prev.length) {
                // Trim array
                return prev.slice(0, newQty);
            }
            return prev;
        });
    };

    const handleSelectionChange = (index, modifier) => {
        setSelections(prev => {
            const next = [...prev];
            next[index] = modifier;
            return next;
        });
    };

    const handleSave = () => {
        onSelect(item, selections);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <h2 className="modal-title" style={{ textAlign: 'center' }}>How would you like your {item.name}?</h2>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                    <button
                        onClick={() => handleQuantityChange(-1)}
                        style={{ fontSize: '24px', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--panel-border)', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        -
                    </button>
                    <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{quantity}</span>
                    <button
                        onClick={() => handleQuantityChange(1)}
                        style={{ fontSize: '24px', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-action)', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        +
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
                    {selections.map((sel, idx) => (
                        <div key={idx} style={{ marginBottom: '15px' }}>
                            <div style={{
                                background: '#f8fafc',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid var(--panel-border)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Fish #{idx + 1}</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        style={{
                                            flex: 1, padding: '12px', fontSize: '0.95rem',
                                            background: selections[idx] === null ? '#e0f2fe' : 'white',
                                            border: selections[idx] === null ? '2px solid var(--color-action)' : '1px solid var(--panel-border)',
                                            color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer'
                                        }}
                                        onClick={() => handleSelectionChange(idx, null)}
                                    >
                                        🍳 Battered (Default)
                                    </button>
                                    {fishModifiers.map(mod => (
                                        <button
                                            key={mod.id}
                                            style={{
                                                flex: 1, padding: '12px', fontSize: '0.95rem',
                                                background: selections[idx]?.id === mod.id ? '#e0f2fe' : 'white',
                                                border: selections[idx]?.id === mod.id ? '2px solid var(--color-action)' : '1px solid var(--panel-border)',
                                                color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer'
                                            }}
                                            onClick={() => handleSelectionChange(idx, mod)}
                                        >
                                            {mod.name.includes('Grilled') ? '♨️ ' : mod.name.includes('Crumbed') ? '🍞 ' : ''}{mod.name} (+${(mod.price * priceMultiplier).toFixed(2)})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                    <button className="btn-primary" style={{ flex: 2, background: 'var(--color-success)' }} onClick={handleSave}>Add to Order</button>
                </div>
            </div>
        </div>
    );
}
