import React, { createContext, useContext, useState, useMemo } from 'react';

const PosContext = createContext();

export const usePos = () => useContext(PosContext);

export const PosProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('walk-in'); // 'walk-in' or 'phone'
    const [phoneOrders, setPhoneOrders] = useState([]);

    const [paidOrders, setPaidOrders] = useState(() => {
        try {
            const todayStr = new Date().toDateString();
            const lastActive = localStorage.getItem('fnc_last_active_date');

            if (lastActive !== todayStr) {
                // It's a new day: Reset transactions and order ID counter
                localStorage.setItem('fnc_last_active_date', todayStr);
                localStorage.removeItem('fnc_paid_orders');
                localStorage.removeItem('fnc_order_counter');
                // Note: orderFrequencies (Popular menu) intentionally not reset so it learns over time
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

    // Global sequential order ID
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

    // Kitchen print trigger state
    const [latestPrintedOrder, setLatestPrintedOrder] = useState(null);

    // Track most ordered items
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
        // Generate unique ID for cart item
        const cartItemId = Math.random().toString(36).substr(2, 9);

        // Calculate final price based on selected modifier
        let finalPrice = item.price;
        let label = item.name;

        if (modifier) {
            finalPrice += modifier.price;
            label = `${item.name} (${modifier.name})`;
        }

        if (item.inherentItems) {
            label += ` + ${item.inherentItems}`;
        }

        if (seasoning) {
            label += ` [${seasoning.name}]`;
        }

        // Check if identical item already exists in cart
        setCart(prev => {
            const existingItemIndex = prev.findIndex(ci =>
                ci.id === item.id &&
                ci.modifier?.name === modifier?.name &&
                ci.seasoning?.name === seasoning?.name
            );

            if (existingItemIndex >= 0) {
                // Increment quantity
                const updatedCart = [...prev];
                updatedCart[existingItemIndex] = {
                    ...updatedCart[existingItemIndex],
                    qty: (updatedCart[existingItemIndex].qty || 1) + 1,
                    price: (updatedCart[existingItemIndex].qty + 1) * finalPrice
                };
                return updatedCart;
            }

            // Fallback: Add new item
            return [...prev, {
                cartItemId,
                ...item,
                qty: 1,
                basePrice: item.price,
                unitPrice: finalPrice,
                price: finalPrice, // total price for this row
                label,
                modifier,
                seasoning
            }];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const clearCart = () => setCart([]);

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price, 0);
    }, [cart]);

    const savePhoneOrder = (customerName, seasoning = null) => {
        const stampedItems = cart.map(item => ({ ...item, seasoning }));
        const newOrder = {
            id: getNextOrderId(),
            customerName,
            seasoning,
            items: stampedItems,
            total: cartTotal,
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

    const processWalkInPayment = (seasoning = null) => {
        const stampedItems = cart.map(item => ({ ...item, seasoning }));
        const newOrder = {
            id: getNextOrderId(),
            customerName: 'Walk-in',
            seasoning,
            items: stampedItems,
            total: cartTotal,
            time: new Date().toISOString(),
            status: 'paid'
        };
        addPaidOrder(newOrder);
        triggerKitchenPrint(newOrder);
        clearCart();
    };

    const triggerKitchenPrint = (order, isReprint = false) => {
        if (!isReprint) recordOrderFrequencies(order.items);
        setLatestPrintedOrder(order);
    };

    return (
        <PosContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            cartTotal,
            orderType,
            setOrderType,
            phoneOrders,
            savePhoneOrder,
            payPhoneOrder,
            processWalkInPayment,
            latestPrintedOrder,
            orderFrequencies,
            paidOrders,
            triggerKitchenPrint
        }}>
            {children}
        </PosContext.Provider>
    );
};
