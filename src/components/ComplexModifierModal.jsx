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
            <div className="modal-content" style={{ maxWidth: '800px', width: '95%', maxHeight: '95vh', display: 'flex', flexDirection: 'column', padding: '16px' }}>

                {/* Top Center: Title & Quantity Stepper */}
                <div style={{ textAlign: 'center', marginBottom: '16px', position: 'relative' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 12px 0' }}>
                        How would you like your {item.name}?
                    </h2>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '20px' }}>
                        <button
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                border: 'none', background: 'var(--panel-border)', color: 'white',
                                fontSize: '2rem', cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                                opacity: quantity <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >-</button>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', width: '40px', textAlign: 'center' }}>{quantity}</span>
                        <button
                            onClick={() => handleQuantityChange(1)}
                            style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                border: 'none', background: 'var(--color-action)', color: 'white',
                                fontSize: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >+</button>
                    </div>
                </div>

                {/* Scrollable Configuration Area */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {configs.map((config, configIndex) => {
                        const totalSidesSelected = Object.values(config.sideChoices).reduce((sum, count) => sum + count, 0);
                        return (
                            <div key={configIndex} style={{
                                marginBottom: '12px', padding: '12px', background: '#f8fafc',
                                borderRadius: '12px', border: '1px solid var(--panel-border)',
                                display: 'flex', flexDirection: item.sideChoicesCount > 0 ? 'row' : 'column', gap: '16px'
                            }}>

                                {/* Left Column: Fish Selections */}
                                <div style={{ flex: 1 }}>
                                    {quantity > 1 && (
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                                            🍽️ Meal #{configIndex + 1}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {config.fishSelections.map((fish, index) => (
                                            <div key={fish.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>Fish #{index + 1}</div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        type="button"
                                                        className={`mod-btn ${fish.modifier === null ? 'active' : ''}`}
                                                        style={{ padding: '10px 4px', flex: 1, fontSize: '0.9rem', minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                                                        onClick={(e) => { e.preventDefault(); handleFishModifierChange(configIndex, fish.id, null); }}
                                                    >
                                                        <span style={{ fontWeight: 'bold' }}>🍳 Battered</span>
                                                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(Default)</span>
                                                    </button>

                                                    {fishModifiers.map(mod => (
                                                        <button
                                                            key={mod.id}
                                                            type="button"
                                                            className={`mod-btn ${fish.modifier?.id === mod.id ? 'active' : ''}`}
                                                            style={{ padding: '10px 4px', flex: 1, fontSize: '0.9rem', minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                                                            onClick={(e) => { e.preventDefault(); handleFishModifierChange(configIndex, fish.id, mod); }}
                                                        >
                                                            <span style={{ fontWeight: 'bold' }}>{mod.name.includes('Grilled') ? '♨️ ' : mod.name.includes('Crumbed') ? '🍞 ' : ''}{mod.name}</span>
                                                            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(+${(mod.price * priceMultiplier).toFixed(2)})</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Sides Selector (Only renders if meal has sides) */}
                                {item.sideChoicesCount > 0 && (
                                    <div style={{ width: '280px', borderLeft: '1px dashed var(--panel-border)', paddingLeft: '16px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px', color: 'var(--color-chips)' }}>
                                            Choose Sides ({totalSidesSelected}/{item.sideChoicesCount})
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {specialSideChoices.map(choice => {
                                                const count = config.sideChoices[choice.id] || 0;
                                                const maxReached = totalSidesSelected >= item.sideChoicesCount;
                                                return (
                                                    <div key={choice.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: count > 0 ? '#f0f9ff' : 'white', padding: '6px 12px', borderRadius: '6px', border: count > 0 ? '1px solid var(--color-action)' : '1px solid var(--panel-border)' }}>
                                                        <div style={{ fontSize: '0.95rem', fontWeight: count > 0 ? 'bold' : 'normal' }}>{choice.name}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <button
                                                                onClick={() => handleDecrementSide(configIndex, choice.id)}
                                                                disabled={count === 0}
                                                                style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--panel-border)', color: 'white', fontSize: '1.2rem', cursor: count === 0 ? 'not-allowed' : 'pointer', opacity: count === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '2px' }}
                                                            >-</button>
                                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{count}</div>
                                                            <button
                                                                onClick={() => handleIncrementSide(configIndex, choice.id)}
                                                                disabled={maxReached}
                                                                style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--color-action)', color: 'white', fontSize: '1.2rem', cursor: maxReached ? 'not-allowed' : 'pointer', opacity: maxReached ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '2px' }}
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Bar: Cancel & Save */}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn-secondary" onClick={onClose} style={{ fontSize: '1.1rem', padding: '12px 32px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                        Cancel
                    </button>

                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={!isComplete}
                        style={{
                            opacity: isComplete ? 1 : 0.5,
                            background: isComplete ? 'var(--color-success)' : 'var(--color-action)',
                            padding: '12px 48px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            border: 'none',
                            color: 'white',
                            cursor: isComplete ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {isComplete ? 'Add to Order' : 'Missing Choices'}
                    </button>
                </div>
            </div>
        </div>
    );
}
