import React, { createContext, useContext, useState, useMemo } from 'react';

const PosContext = createContext();

export const usePos = () => useContext(PosContext);

export const PosProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('walk-in');
    const [phoneOrders, setPhoneOrders] = useState([]);
    const [orderNote, setOrderNote] = useState('');
    const [discount, setDiscount] = useState({ type: 'none', value: 0 }); // type: 'none' | 'amount' | 'percent'

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
        const nextId = orderCounter;
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
    };

    const cartSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price, 0);
    }, [cart]);

    // Computed discount amount
    const discountAmount = useMemo(() => {
        if (discount.type === 'amount') return Math.min(discount.value, cartSubtotal);
        if (discount.type === 'percent') return Math.round((cartSubtotal * discount.value / 100) * 100) / 100;
        return 0;
    }, [discount, cartSubtotal]);

    const cartTotal = useMemo(() => {
        return Math.max(0, cartSubtotal - discountAmount);
    }, [cartSubtotal, discountAmount]);

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
        const stampedItems = cart.map(item => ({ ...item, seasoning }));
        const newOrder = {
            id: getNextOrderId(),
            customerName,
            seasoning,
            note: orderNote || null,
            discount: discountAmount > 0 ? { type: discount.type, value: discount.value, amount: discountAmount } : null,
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
        const stampedItems = cart.map(item => ({ ...item, seasoning }));
        const newOrder = {
            id: getNextOrderId(),
            customerName: 'Walk-in',
            seasoning,
            note: orderNote || null,
            discount: discountAmount > 0 ? { type: discount.type, value: discount.value, amount: discountAmount } : null,
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
            orderNote,
            setOrderNote,
            discount,
            setDiscount,
            discountAmount,
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
