import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import ModifierModal from './ModifierModal';
import ComplexModifierModal from './ComplexModifierModal';
import { menuCategories, menuItems } from '../data/menu';

export default function MenuGrid() {
    const [activeCategory, setActiveCategory] = useState('popular');
    const [selectedFish, setSelectedFish] = useState(null);
    const [selectedSpecial, setSelectedSpecial] = useState(null);

    const { addToCart, orderFrequencies } = usePos();

    const proceedToCart = (item, modifierOrModifiers) => {
        if (Array.isArray(modifierOrModifiers)) {
            modifierOrModifiers.forEach(mod => addToCart(item, mod));
        } else {
            addToCart(item, modifierOrModifiers);
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
                            borderColor: activeCategory === cat.id ? 'white' : 'transparent',
                            color: 'white'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

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
                                color: '#a3b18a',
                                fontWeight: 'bold',
                                fontSize: item.image ? '18px' : '22px'
                            }}>
                                ${item.price.toFixed(2)}
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
                    item={selectedFish}
                    onSelect={handleModifierSelect}
                    onClose={() => setSelectedFish(null)}
                />
            )}

            {selectedSpecial && (
                <ComplexModifierModal
                    item={selectedSpecial}
                    onSave={handleComplexModifierSelect}
                    onClose={() => setSelectedSpecial(null)}
                />
            )}


        </div>
    );
}
