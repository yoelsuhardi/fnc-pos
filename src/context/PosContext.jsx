import React, { createContext, useContext, useState, useMemo } from 'react';

const PosContext = createContext();

export const usePos = () => useContext(PosContext);

export const PosProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('walk-in');
    const [isOrderStarted, setIsOrderStarted] = useState(false);
    const [phoneOrders, setPhoneOrders] = useState([]);
    const [orderNote, setOrderNote] = useState('');
    const [discount, setDiscount] = useState({ type: 'none', value: 0 }); // type: 'none' | 'amount' | 'percent'

    const [isHolidaySurcharge, setIsHolidaySurcharge] = useState(() => {
        return localStorage.getItem('fnc_holiday_surcharge') === 'true';
    });

    const [isQueueEnabled, setIsQueueEnabled] = useState(() => {
        // Default to true if not set
        const val = localStorage.getItem('fnc_queue_enabled');
        return val === null ? true : val === 'true';
    });

    const [isPreviewEnabled, setIsPreviewEnabled] = useState(() => {
        return localStorage.getItem('fnc_preview_enabled') === 'true';
    });

    const toggleHolidaySurcharge = () => {
        setIsHolidaySurcharge(prev => {
            const next = !prev;
            localStorage.setItem('fnc_holiday_surcharge', next.toString());
            return next;
        });
    };

    const toggleQueueEnabled = () => {
        setIsQueueEnabled(prev => {
            const next = !prev;
            localStorage.setItem('fnc_queue_enabled', next.toString());
            return next;
        });
    };

    const togglePreviewEnabled = () => {
        setIsPreviewEnabled(prev => {
            const next = !prev;
            localStorage.setItem('fnc_preview_enabled', next.toString());
            return next;
        });
    };

    const [paidOrders, setPaidOrders] = useState(() => {
        try {
            const todayStr = new Date().toDateString();
            const lastActive = localStorage.getItem('fnc_last_active_date');
            if (lastActive !== todayStr) {
                localStorage.setItem('fnc_last_active_date', todayStr);
                localStorage.removeItem('fnc_paid_orders');
                localStorage.removeItem('fnc_order_counter');
                return [];
            }
            const saved = localStorage.getItem('fnc_paid_orders');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const addPaidOrder = (order) => {
        setPaidOrders(prev => {
            const updated = [order, ...prev];
            localStorage.setItem('fnc_paid_orders', JSON.stringify(updated));
            return updated;
        });
    };

    const [orderCounter, setOrderCounter] = useState(() => {
        try {
            const saved = localStorage.getItem('fnc_order_counter');
            return saved ? parseInt(saved, 10) : 1;
        } catch {
            return 1;
        }
    });

    const getNextOrderId = () => {
        let nextId = orderCounter;

        // Ensure robust day change detection (if they leave the app open overnight)
        const todayStr = new Date().toDateString();
        const lastActive = localStorage.getItem('fnc_last_active_date');
        if (lastActive !== todayStr) {
            localStorage.setItem('fnc_last_active_date', todayStr);
            localStorage.removeItem('fnc_paid_orders');
            setPaidOrders([]); // Reset daily sales view
            nextId = 1; // Reset queue number
        }

        const newCounter = nextId + 1;
        setOrderCounter(newCounter);
        localStorage.setItem('fnc_order_counter', newCounter.toString());
        return nextId.toString().padStart(3, '0');
    };

    const [latestPrintedOrder, setLatestPrintedOrder] = useState(null);

    const [orderFrequencies, setOrderFrequencies] = useState(() => {
        try {
            const saved = localStorage.getItem('fnc_order_frequencies');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const recordOrderFrequencies = (items) => {
        setOrderFrequencies(prev => {
            const newFreq = { ...prev };
            items.forEach(item => {
                newFreq[item.id] = (newFreq[item.id] || 0) + (item.qty || 1);
            });
            localStorage.setItem('fnc_order_frequencies', JSON.stringify(newFreq));
            return newFreq;
        });
    };

    const addToCart = (item, modifier = null, seasoning = null) => {
        const cartItemId = Math.random().toString(36).substr(2, 9);
        let finalPrice = item.price;
        let label = item.name;

        if (modifier) {
            finalPrice += modifier.price;
            label = `${item.name} (${modifier.name})`;
        }

        if (item.inherentItems) {
            label += ` + ${item.inherentItems}`;
        }

        setCart(prev => {
            const existingItemIndex = prev.findIndex(ci =>
                ci.id === item.id &&
                ci.modifier?.name === modifier?.name
            );

            if (existingItemIndex >= 0) {
                const updatedCart = [...prev];
                updatedCart[existingItemIndex] = {
                    ...updatedCart[existingItemIndex],
                    qty: (updatedCart[existingItemIndex].qty || 1) + 1,
                    price: (updatedCart[existingItemIndex].qty + 1) * finalPrice
                };
                return updatedCart;
            }

            return [...prev, {
                cartItemId,
                ...item,
                qty: 1,
                basePrice: item.price,
                unitPrice: finalPrice,
                price: finalPrice,
                label,
                modifier,
                seasoning
            }];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const clearCart = () => {
        setCart([]);
        setOrderNote('');
        setDiscount({ type: 'none', value: 0 });
        setIsOrderStarted(false);
    };

    const cartSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price, 0);
    }, [cart]);

    // Computed discount amount
    const discountAmount = useMemo(() => {
        let manualDiscount = 0;
        if (discount.type === 'amount') manualDiscount = Math.min(discount.value, cartSubtotal);
        if (discount.type === 'percent') manualDiscount = Math.round((cartSubtotal * discount.value / 100) * 100) / 100;
        return manualDiscount;
    }, [discount, cartSubtotal]);

    const autoDiscountAmount = useMemo(() => {
        if (new Date().getDay() !== 2) return 0; // Only applies on Tuesday

        // Accumulate quantities for specific discounted items
        let familyQty = 0;
        let halfFamilyQty = 0;
        let fishOfTheDayQty = 0;

        cart.forEach(item => {
            if (item.id === 'sp_1') familyQty += item.qty;
            if (item.id === 'sp_2') halfFamilyQty += item.qty;
            if (item.name === 'Fish of the Day' || item.id === 'f_1') fishOfTheDayQty += item.qty;
        });

        const familyDiscount = familyQty * 11.80;
        const halfFamilyDiscount = halfFamilyQty * 5.90;
        const fishDiscount = Math.floor(fishOfTheDayQty / 2) * 8.50; // Every 2 gets 8.50 off

        return parseFloat((familyDiscount + halfFamilyDiscount + fishDiscount).toFixed(2));
    }, [cart]);

    const cartTotal = useMemo(() => {
        return Math.max(0, cartSubtotal - discountAmount - autoDiscountAmount);
    }, [cartSubtotal, discountAmount, autoDiscountAmount]);

    // Daily stats derived from paidOrders
    const dailyStats = useMemo(() => {
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalOrders = paidOrders.length;

        // Top items by quantity
        const itemCounts = {};
        paidOrders.forEach(order => {
            (order.items || []).forEach(item => {
                const key = item.name;
                itemCounts[key] = (itemCounts[key] || 0) + (item.qty || 1);
            });
        });
        const topItems = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, qty]) => ({ name, qty }));

        // Payment method breakdown
        const cashOrders = paidOrders.filter(o => o.paymentMethod === 'cash');
        const eftposOrders = paidOrders.filter(o => o.paymentMethod === 'eftpos');
        const cashTotal = cashOrders.reduce((s, o) => s + (o.total || 0), 0);
        const eftposTotal = eftposOrders.reduce((s, o) => s + (o.total || 0), 0);

        return { totalRevenue, totalOrders, topItems, cashTotal, eftposTotal };
    }, [paidOrders]);

    const savePhoneOrder = (customerName, seasoning = null) => {
        const finalDiscountLine = discountAmount > 0 || autoDiscountAmount > 0
            ? { type: 'mixed', value: 'auto', amount: discountAmount + autoDiscountAmount }
            : null;

        const stampedItems = cart.map(item => ({ ...item, seasoning }));
        const newOrder = {
            id: getNextOrderId(),
            customerName,
            seasoning,
            note: orderNote || null,
            discount: finalDiscountLine,
            items: stampedItems,
            subtotal: cartSubtotal,
            total: cartTotal,
            paymentMethod: 'phone',
            time: new Date(),
            status: 'unpaid'
        };
        setPhoneOrders(prev => [...prev, newOrder]);
        triggerKitchenPrint(newOrder);
        clearCart();
        setOrderType('walk-in');
    };

    const payPhoneOrder = (orderId) => {
        const order = phoneOrders.find(o => o.id === orderId);
        if (order) {
            const finalizedOrder = { ...order, status: 'paid', paidTime: new Date().toISOString() };
            addPaidOrder(finalizedOrder);
        }
        setPhoneOrders(prev => prev.filter(o => o.id !== orderId));
    };

    const processWalkInPayment = (seasoning = null, method = 'cash') => {
        const finalDiscountLine = discountAmount > 0 || autoDiscountAmount > 0
            ? { type: 'mixed', value: 'auto', amount: discountAmount + autoDiscountAmount }
            : null;

        const stampedItems = cart.map(item => ({ ...item, seasoning }));
        const newOrder = {
            id: getNextOrderId(),
            customerName: 'Walk-in',
            seasoning,
            note: orderNote || null,
            discount: finalDiscountLine,
            items: stampedItems,
            subtotal: cartSubtotal,
            total: cartTotal,
            paymentMethod: method,
            time: new Date().toISOString(),
            status: 'paid'
        };
        addPaidOrder(newOrder);
        triggerKitchenPrint(newOrder);
        clearCart();
    };

    const triggerKitchenPrint = (order, isReprint = false) => {
        if (!isReprint) recordOrderFrequencies(order.items);
        setLatestPrintedOrder({ ...order, _printTimestamp: Date.now() });
    };

    const voidOrder = (orderId) => {
        setPaidOrders(prev => {
            const updated = prev.filter(o => o.id !== orderId);
            localStorage.setItem('fnc_paid_orders', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <PosContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            cartSubtotal,
            cartTotal,
            orderType,
            setOrderType,
            isOrderStarted,
            setIsOrderStarted,
            orderNote,
            setOrderNote,
            discount,
            setDiscount,
            discountAmount,
            autoDiscountAmount,
            isHolidaySurcharge,
            toggleHolidaySurcharge,
            isQueueEnabled,
            toggleQueueEnabled,
            isPreviewEnabled,
            togglePreviewEnabled,
            phoneOrders,
            savePhoneOrder,
            payPhoneOrder,
            processWalkInPayment,
            latestPrintedOrder,
            orderFrequencies,
            paidOrders,
            dailyStats,
            triggerKitchenPrint,
            voidOrder
        }}>
            {children}
        </PosContext.Provider>
    );
};
