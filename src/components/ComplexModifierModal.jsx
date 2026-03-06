import React, { useState } from 'react';
import { fishModifiers, specialSideChoices } from '../data/menu';

export default function ComplexModifierModal({ item, onSave, onClose, priceMultiplier = 1 }) {
    if (!item) return null;

    const [quantity, setQuantity] = useState(1);

    const createNewConfig = () => ({
        fishSelections: Array.from({ length: item.fishCount }, (_, i) => ({
            id: `fish-${i + 1}`,
            modifier: null // null = Battered
        })),
        sideChoices: {}
    });

    const [configs, setConfigs] = useState([createNewConfig()]);

    const handleQuantityChange = (delta) => {
        const newQty = Math.max(1, quantity + delta);
        setQuantity(newQty);
        setConfigs(prev => {
            if (newQty > prev.length) {
                return [...prev, ...Array.from({ length: newQty - prev.length }, createNewConfig)];
            }
            if (newQty < prev.length) {
                return prev.slice(0, newQty);
            }
            return prev;
        });
    };

    const handleFishModifierChange = (configIndex, fishId, newModifier) => {
        setConfigs(prev => {
            const next = [...prev];
            next[configIndex] = {
                ...next[configIndex],
                fishSelections: next[configIndex].fishSelections.map(f =>
                    f.id === fishId ? { ...f, modifier: newModifier } : f
                )
            };
            return next;
        });
    };

    const handleIncrementSide = (configIndex, choiceId) => {
        setConfigs(prev => {
            const next = [...prev];
            const currentSides = next[configIndex].sideChoices;
            const totalSidesSelected = Object.values(currentSides).reduce((sum, count) => sum + count, 0);
            if (totalSidesSelected < item.sideChoicesCount) {
                next[configIndex] = {
                    ...next[configIndex],
                    sideChoices: {
                        ...currentSides,
                        [choiceId]: (currentSides[choiceId] || 0) + 1
                    }
                };
            }
            return next;
        });
    };

    const handleDecrementSide = (configIndex, choiceId) => {
        setConfigs(prev => {
            const next = [...prev];
            const currentSides = next[configIndex].sideChoices;
            if (currentSides[choiceId] > 0) {
                const nextSides = { ...currentSides, [choiceId]: currentSides[choiceId] - 1 };
                if (nextSides[choiceId] === 0) delete nextSides[choiceId];
                next[configIndex] = { ...next[configIndex], sideChoices: nextSides };
            }
            return next;
        });
    };

    const isComplete = configs.every(c => {
        const totalSides = Object.values(c.sideChoices).reduce((sum, count) => sum + count, 0);
        return totalSides === item.sideChoicesCount;
    });

    const handleSave = () => {
        if (!isComplete) return;

        const modifierPayloads = configs.map(c => {
            const counts = { Battered: 0 };
            let extraCost = 0;

            c.fishSelections.forEach(f => {
                const modName = f.modifier ? f.modifier.name : 'Battered';
                counts[modName] = (counts[modName] || 0) + 1;
                if (f.modifier) {
                    extraCost += f.modifier.price;
                }
            });

            // e.g. ["2x Battered", "1x Grilled"]
            const fishDescArray = Object.entries(counts)
                .filter(([_, count]) => count > 0)
                .map(([name, count]) => `${count}x ${name}`);

            let modDesc = `(${fishDescArray.join(', ')} Fish)`;

            const selectedSidesText = Object.entries(c.sideChoices)
                .map(([id, count]) => {
                    const sideItem = specialSideChoices.find(sc => sc.id === id);
                    return sideItem ? `${count}x ${sideItem.name}` : `${count}x Unknown`;
                })
                .join(', ');

            if (selectedSidesText) {
                modDesc += ` + [${selectedSidesText}]`;
            }

            return {
                name: modDesc,
                price: extraCost
            };
        });

        // Pass array of individual config objects to be parsed by Menu Grid
        onSave(item, modifierPayloads);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <h2 className="modal-title" style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', marginBottom: '16px' }}>Customize: {item.name}</h2>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
                    {configs.map((config, configIndex) => {
                        const totalSidesSelected = Object.values(config.sideChoices).reduce((sum, count) => sum + count, 0);
                        return (
                            <div key={configIndex} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: configIndex < configs.length - 1 ? '2px dashed var(--panel-border)' : 'none' }}>
                                {quantity > 1 && (
                                    <h3 style={{ marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        🍽️ Meal #{configIndex + 1}
                                    </h3>
                                )}

                                <div style={{ display: 'flex', gap: '32px' }}>
                                    {/* Left Column: Fish Modifiers (Individual) */}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ marginBottom: '16px', color: 'var(--color-fish)', fontSize: '1.05rem' }}>
                                            1. Fish Style (x{item.fishCount})
                                        </h4>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {config.fishSelections.map((fish, index) => (
                                                <div key={fish.id} style={{
                                                    background: '#f8fafc',
                                                    padding: '16px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--panel-border)',
                                                    boxShadow: 'var(--shadow-sm)'
                                                }}>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Fish #{index + 1}</div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            type="button"
                                                            className={`mod-btn ${fish.modifier === null ? 'active' : ''}`}
                                                            style={{ padding: '12px', flex: 1, fontSize: '0.95rem' }}
                                                            onClick={(e) => { e.preventDefault(); handleFishModifierChange(configIndex, fish.id, null); }}
                                                        >
                                                            🍳 Battered
                                                        </button>

                                                        {fishModifiers.map(mod => (
                                                            <button
                                                                key={mod.id}
                                                                type="button"
                                                                className={`mod-btn ${fish.modifier?.id === mod.id ? 'active' : ''}`}
                                                                style={{ padding: '12px', flex: 1, fontSize: '0.95rem' }}
                                                                onClick={(e) => { e.preventDefault(); handleFishModifierChange(configIndex, fish.id, mod); }}
                                                            >
                                                                {mod.name.includes('Grilled') ? '♨️ ' : mod.name.includes('Crumbed') ? '🍞 ' : ''}{mod.name} <br />
                                                                <small style={{ color: 'var(--color-success)' }}>+${(mod.price * priceMultiplier).toFixed(2)}</small>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Column: Side Choices Container Elements */}
                                    {item.sideChoicesCount > 0 && (
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ marginBottom: '16px', color: 'var(--color-chips)', position: 'sticky', top: 0, background: 'var(--panel-bg)', zIndex: 10, paddingBottom: '8px', fontSize: '1.05rem' }}>
                                                2. Choose {item.sideChoicesCount} Sides
                                                <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                                    ({totalSidesSelected}/{item.sideChoicesCount})
                                                </span>
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {specialSideChoices.map(choice => {
                                                    const count = config.sideChoices[choice.id] || 0;
                                                    const maxReached = totalSidesSelected >= item.sideChoicesCount;

                                                    return (
                                                        <div key={choice.id} style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            background: count > 0 ? '#f0f9ff' : '#f8fafc',
                                                            padding: '16px 20px',
                                                            borderRadius: '8px',
                                                            border: count > 0 ? '1px solid var(--color-action)' : '1px solid var(--panel-border)',
                                                            boxShadow: count > 0 ? 'var(--shadow-sm)' : 'none'
                                                        }}>
                                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{choice.name}</div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                <button
                                                                    onClick={() => handleDecrementSide(configIndex, choice.id)}
                                                                    disabled={count === 0}
                                                                    style={{
                                                                        width: '40px', height: '40px', borderRadius: '50%',
                                                                        border: 'none', background: 'var(--panel-border)', color: 'white',
                                                                        fontSize: '1.5rem', cursor: count === 0 ? 'not-allowed' : 'pointer',
                                                                        opacity: count === 0 ? 0.3 : 1
                                                                    }}
                                                                >-</button>

                                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>
                                                                    {count}
                                                                </div>

                                                                <button
                                                                    onClick={() => handleIncrementSide(configIndex, choice.id)}
                                                                    disabled={maxReached}
                                                                    style={{
                                                                        width: '40px', height: '40px', borderRadius: '50%',
                                                                        border: 'none', background: 'var(--color-action)', color: 'white',
                                                                        fontSize: '1.5rem', cursor: maxReached ? 'not-allowed' : 'pointer',
                                                                        opacity: maxReached ? 0.3 : 1
                                                                    }}
                                                                >+</button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="modal-actions" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Quantity Stepper limits array configs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '4px 12px', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
                            <button
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    border: 'none', background: 'var(--panel-border)', color: 'white',
                                    fontSize: '1.2rem', cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                                    opacity: quantity <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >-</button>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange(1)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    border: 'none', background: 'var(--color-action)', color: 'white',
                                    fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >+</button>
                        </div>

                        <button
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={!isComplete}
                            style={{
                                opacity: isComplete ? 1 : 0.5,
                                background: isComplete ? 'var(--color-success)' : 'var(--color-action)',
                                padding: '12px 24px',
                                fontSize: '1.1rem'
                            }}
                        >
                            {isComplete ? (quantity > 1 ? `Confirm & Add ${quantity} to Cart` : 'Confirm & Add to Cart') : `Complete Missing Choices`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
