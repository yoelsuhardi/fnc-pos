// src/services/SmartpayService.js

const ENV_PROD = 'https://api.smart-connect.cloud/pos';
const ENV_TEST = 'https://api-dev.smart-connect.cloud/pos';

export const getSmartpayEnv = (isTest = false) => isTest ? ENV_TEST : ENV_PROD;

export const generateRegisterId = () => {
    let id = localStorage.getItem('smartpay_register_id');
    if (!id) {
        // Generate a simple UUID-like string
        id = 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
        localStorage.setItem('smartpay_register_id', id);
    }
    return id;
};

export const pairTerminal = async (pairingCode, businessName, vendorName, isTest = false) => {
    const env = getSmartpayEnv(isTest);
    const registerId = generateRegisterId();

    const payload = new URLSearchParams();
    payload.append('POSRegisterID', registerId);
    payload.append('POSBusinessName', businessName || 'FNC POS');
    payload.append('POSVendorName', vendorName || 'FNC POS System');

    try {
        const response = await fetch(`${env}/Pairing/${pairingCode}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload.toString()
        });

        if (response.ok) {
            const data = await response.json();
            if (data.result === 'success') {
                return { success: true, registerId };
            }
        }

        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || 'Pairing failed. Check code.' };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const initiateTransaction = async (amountTotal, transactionType = 'Card.Purchase', isTest = false) => {
    const env = getSmartpayEnv(isTest);
    const registerId = generateRegisterId();
    // In a real scenario, we'd also pass POSBusinessName and POSVendorName from settings

    const payload = new URLSearchParams();
    payload.append('POSRegisterID', registerId);
    payload.append('POSBusinessName', 'FNC POS'); // Hardcoded fallback
    payload.append('POSVendorName', 'FNC POS System');
    payload.append('TransactionType', transactionType);
    payload.append('TransactionMode', 'ASYNC');

    // Amount must be in cents (e.g., $5.00 -> 500)
    const amountInCents = Math.round(amountTotal * 100);
    payload.append('AmountTotal', amountInCents.toString());

    try {
        const response = await fetch(`${env}/Transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload.toString()
        });

        if (response.ok) {
            const data = await response.json();
            // Expected response contains data.PollingUrl
            if (data.data && data.data.PollingUrl) {
                return { success: true, pollingUrl: data.data.PollingUrl, transactionId: data.transactionId };
            }
            return { success: false, error: 'No polling URL returned from Smartpay.' };
        }

        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || 'Failed to initiate transaction.' };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const pollTransactionStatus = async (pollingUrl) => {
    try {
        const response = await fetch(pollingUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            return await response.json();
        }
        return { transactionStatus: 'ERROR', error: 'Failed to poll status' };
    } catch (err) {
        return { transactionStatus: 'ERROR', error: err.message };
    }
};
