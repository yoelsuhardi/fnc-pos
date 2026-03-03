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
                        <div key={idx} style={{ marginBottom: '15px', padding: '15px', background: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'white' }}>Fish #{idx + 1}</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: sel === null ? '2px solid var(--color-chips)' : '1px solid var(--panel-border)',
                                        background: sel === null ? 'rgba(245, 124, 0, 0.2)' : 'transparent',
                                        color: sel === null ? 'var(--color-chips)' : 'var(--text-main)',
                                        cursor: 'pointer',
                                        fontWeight: sel === null ? 'bold' : 'normal'
                                    }}
                                    onClick={() => handleSelectionChange(idx, null)}
                                >
                                    Battered (Default)
                                </button>
                                {fishModifiers.map(mod => (
                                    <button
                                        key={mod.id}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: sel?.id === mod.id ? '2px solid var(--color-chips)' : '1px solid var(--panel-border)',
                                            background: sel?.id === mod.id ? 'rgba(245, 124, 0, 0.2)' : 'transparent',
                                            color: sel?.id === mod.id ? 'var(--color-chips)' : 'var(--text-main)',
                                            cursor: 'pointer',
                                            fontWeight: sel?.id === mod.id ? 'bold' : 'normal'
                                        }}
                                        onClick={() => handleSelectionChange(idx, mod)}
                                    >
                                        {mod.name} (+${(mod.price * priceMultiplier).toFixed(2)})
                                    </button>
                                ))}
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
