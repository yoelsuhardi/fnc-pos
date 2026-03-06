import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import ModifierModal from './ModifierModal';
import ComplexModifierModal from './ComplexModifierModal';
import { menuCategories, menuItems } from '../data/menu';

export default function MenuGrid() {
    const [activeCategory, setActiveCategory] = useState('popular');
    const [selectedFish, setSelectedFish] = useState(null);
    const [selectedSpecial, setSelectedSpecial] = useState(null);

    const { addToCart, orderFrequencies, isHolidaySurcharge } = usePos();
    const priceMultiplier = isHolidaySurcharge ? 1.1 : 1;

    const proceedToCart = (item, modifierOrModifiers) => {
        const adjustPrice = (obj) => obj ? { ...obj, price: parseFloat((obj.price * priceMultiplier).toFixed(2)) } : null;
        const adjustedItem = adjustPrice(item);

        if (Array.isArray(modifierOrModifiers)) {
            const adjustedMods = modifierOrModifiers.map(adjustPrice);
            adjustedMods.forEach(mod => addToCart(adjustedItem, mod));
        } else {
            // Check if quantity is provided in the modifier payload (for complex modifiers)
            const qty = modifierOrModifiers?.quantity || 1;
            const singleMod = adjustPrice(modifierOrModifiers);

            // Re-apply original quantity if it existed, so we don't accidentally drop it during adjustPrice
            if (singleMod && modifierOrModifiers.quantity) {
                singleMod.quantity = qty;
            }

            for (let i = 0; i < qty; i++) {
                addToCart(adjustedItem, singleMod);
            }
        }
    };

    const handleItemClick = (item) => {
        if (item.hasComplexModifiers) {
            setSelectedSpecial(item);
        } else if (item.hasModifiers) {
            setSelectedFish(item);
        } else {
            proceedToCart(item, null);
        }
    };

    const handleModifierSelect = (item, modifiersArray) => {
        setSelectedFish(null);
        proceedToCart(item, modifiersArray);
    };

    const handleComplexModifierSelect = (item, combinedModifier) => {
        setSelectedSpecial(null);
        proceedToCart(item, combinedModifier);
    };

    const visibleItems = React.useMemo(() => {
        if (activeCategory === 'popular') {
            const sortedItems = [...menuItems].sort((a, b) => {
                const freqA = orderFrequencies[a.id] || 0;
                const freqB = orderFrequencies[b.id] || 0;
                return freqB - freqA;
            });
            // Return top 12 items that have actually been ordered at least once
            const populars = sortedItems.filter(item => orderFrequencies[item.id] > 0).slice(0, 12);
            // If no history exists, provide some defaults to avoid an empty screen
            if (populars.length === 0) {
                return menuItems.slice(0, 8);
            }
            return populars;
        }
        return menuItems.filter(item => item.categoryId === activeCategory);
    }, [activeCategory, orderFrequencies]);
    return (
        <div className="menu-area">
            <div className="category-bar">
                {menuCategories.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            backgroundColor: activeCategory === cat.id ? cat.color : '',
                            borderColor: activeCategory === cat.id ? 'transparent' : 'transparent',
                            color: activeCategory === cat.id ? 'white' : 'var(--text-main)'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {isHolidaySurcharge && (
                <div style={{ background: '#f44336', color: 'white', padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>
                    ⚠️ PUBLIC HOLIDAY SURCHARGE ACTIVE (+10%)
                </div>
            )}

            <div className="menu-grid">
                {visibleItems.map(item => (
                    <div
                        key={item.id}
                        className="menu-item-btn"
                        onClick={() => handleItemClick(item)}
                        style={{
                            flexDirection: 'column',
                            justifyContent: item.image ? 'flex-start' : 'center',
                            padding: '0',
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'flex'
                        }}
                    >
                        {item.image && (
                            <div style={{
                                width: '100%',
                                height: '90px',
                                minHeight: '90px',
                                backgroundImage: `url(${item.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderBottom: '1px solid var(--panel-border)'
                            }} />
                        )}
                        <div style={{
                            padding: '12px 8px',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            justifyContent: 'center'
                        }}>
                            <div className="name" style={{
                                fontSize: item.image ? '16px' : '20px',
                                marginBottom: '4px',
                                textAlign: 'center',
                                lineHeight: '1.2'
                            }}>
                                {item.name}
                            </div>
                            <div className="price" style={{
                                color: 'var(--color-sides)',
                                fontWeight: 'bold',
                                fontSize: item.image ? '18px' : '22px'
                            }}>
                                ${(item.price * priceMultiplier).toFixed(2)}
                            </div>

                            {/* Subtitle Hints based on complexity */}
                            {item.hasComplexModifiers && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Customize Choices</div>
                            )}
                            {item.hasModifiers && !item.hasComplexModifiers && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Select Prep</div>
                            )}
                            {item.requiresSeasoning && !item.hasComplexModifiers && !item.hasModifiers && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Requires Seasoning</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedFish && (
                <ModifierModal
                    item={{ ...selectedFish, price: parseFloat((selectedFish.price * priceMultiplier).toFixed(2)) }}
                    onSelect={handleModifierSelect}
                    onClose={() => setSelectedFish(null)}
                    priceMultiplier={priceMultiplier}
                />
            )}

            {selectedSpecial && (
                <ComplexModifierModal
                    item={{ ...selectedSpecial, price: parseFloat((selectedSpecial.price * priceMultiplier).toFixed(2)) }}
                    onSave={handleComplexModifierSelect}
                    onClose={() => setSelectedSpecial(null)}
                    priceMultiplier={priceMultiplier}
                />
            )}


        </div>
    );
}
