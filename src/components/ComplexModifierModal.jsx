import React, { useState } from 'react';
import { fishModifiers, specialSideChoices } from '../data/menu';

export default function ComplexModifierModal({ item, onSave, onClose }) {
    if (!item) return null;

    // Track modifiers for EACH fish individually
    // Array of objects { id: 'fish-1', modifier: null }
    const [fishSelections, setFishSelections] = useState(
        Array.from({ length: item.fishCount }, (_, i) => ({
            id: `fish-${i + 1}`,
            modifier: null // null = Battered
        }))
    );

    // Track selected side choices. Object of { choiceId: count }
    const [sideChoices, setSideChoices] = useState({});

    const handleFishModifierChange = (fishId, newModifier) => {
        setFishSelections(prev => prev.map(f =>
            f.id === fishId ? { ...f, modifier: newModifier } : f
        ));
    };

    const handleIncrementSide = (choiceId) => {
        if (totalSidesSelected < item.sideChoicesCount) {
            setSideChoices(prev => ({
                ...prev,
                [choiceId]: (prev[choiceId] || 0) + 1
            }));
        }
    };

    const handleDecrementSide = (choiceId) => {
        if (sideChoices[choiceId] > 0) {
            setSideChoices(prev => {
                const next = { ...prev, [choiceId]: prev[choiceId] - 1 };
                if (next[choiceId] === 0) delete next[choiceId];
                return next;
            });
        }
    };

    const totalSidesSelected = Object.values(sideChoices).reduce((sum, count) => sum + count, 0);

    const handleSave = () => {
        if (totalSidesSelected !== item.sideChoicesCount) return;

        // Group fish selections to create a readable string (e.g., 2x Battered, 1x Grilled)
        const counts = { Battered: 0 };
        let extraCost = 0;

        fishSelections.forEach(f => {
            const modName = f.modifier ? f.modifier.name : 'Battered';
            counts[modName] = (counts[modName] || 0) + 1;

            if (f.modifier) {
                extraCost += f.modifier.price;
            }
        });

        // Create string array for fish: ["2x Battered", "1x Grilled"]
        const fishDescArray = Object.entries(counts)
            .filter(([_, count]) => count > 0)
            .map(([name, count]) => `${count}x ${name}`);

        let modDesc = `(${fishDescArray.join(', ')} Fish)`;

        // Format side choices e.g "2x Dim Sim, 1x Crab Stick"
        const selectedSidesText = Object.entries(sideChoices)
            .map(([id, count]) => {
                const name = specialSideChoices.find(c => c.id === id).name;
                return `${count}x ${name}`;
            })
            .join(', ');

        if (selectedSidesText) {
            modDesc += ` + [${selectedSidesText}]`;
        }

        onSave(item, {
            name: modDesc,
            price: extraCost
        });
    };

    const isComplete = totalSidesSelected === item.sideChoicesCount;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <h2 className="modal-title">Customize: {item.name}</h2>

                <div style={{ display: 'flex', gap: '32px', overflowY: 'auto', paddingRight: '12px' }}>

                    {/* Left Column: Fish Modifiers (Individual) */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '16px', color: 'var(--color-fish)' }}>
                            1. Fish Style (x{item.fishCount})
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {fishSelections.map((fish, index) => (
                                <div key={fish.id} style={{
                                    background: 'rgba(27, 38, 59, 0.5)',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--panel-border)'
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Fish #{index + 1}</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className={`mod-btn ${fish.modifier === null ? 'active' : ''}`}
                                            style={{ padding: '12px', flex: 1, fontSize: '1rem' }}
                                            onClick={(e) => { e.preventDefault(); handleFishModifierChange(fish.id, null); }}
                                        >
                                            Battered
                                        </button>

                                        {fishModifiers.map(mod => (
                                            <button
                                                key={mod.id}
                                                type="button"
                                                className={`mod-btn ${fish.modifier?.id === mod.id ? 'active' : ''}`}
                                                style={{ padding: '12px', flex: 1, fontSize: '1rem' }}
                                                onClick={(e) => { e.preventDefault(); handleFishModifierChange(fish.id, mod); }}
                                            >
                                                {mod.name} <br />
                                                <small style={{ color: 'var(--color-success)' }}>+${mod.price.toFixed(2)}</small>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Side Choices Container Elements */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '16px', color: 'var(--color-chips)', position: 'sticky', top: 0, background: 'var(--panel-bg)', zIndex: 10, paddingBottom: '8px' }}>
                            2. Choose {item.sideChoicesCount} Sides
                            <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                ({totalSidesSelected}/{item.sideChoicesCount})
                            </span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {specialSideChoices.map(choice => {
                                const count = sideChoices[choice.id] || 0;
                                const maxReached = totalSidesSelected >= item.sideChoicesCount;

                                return (
                                    <div key={choice.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'rgba(27, 38, 59, 0.5)',
                                        padding: '16px 20px',
                                        borderRadius: '8px',
                                        border: count > 0 ? '1px solid var(--color-action)' : '1px solid var(--panel-border)'
                                    }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{choice.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <button
                                                onClick={() => handleDecrementSide(choice.id)}
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
                                                onClick={() => handleIncrementSide(choice.id)}
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
                </div>

                <div className="modal-actions" style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--panel-border)' }}>
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={!isComplete}
                        style={{
                            opacity: isComplete ? 1 : 0.5,
                            background: isComplete ? 'var(--color-success)' : 'var(--color-action)'
                        }}
                    >
                        {isComplete ? 'Confirm & Add to Cart' : `Select ${item.sideChoicesCount - totalSidesSelected} more side(s)`}
                    </button>
                </div>
            </div>
        </div>
    );
}
