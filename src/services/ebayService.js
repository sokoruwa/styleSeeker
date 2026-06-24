const config = require('../config');
const getFetch = require('./fetchCompat');

let ebayToken = null;
let ebayTokenExpiry = 0;

async function getEbayToken() {
    if (ebayToken && Date.now() < ebayTokenExpiry) {
        return ebayToken;
    }

    const fetch = getFetch();
    const credentials = Buffer.from(`${config.ebayClientId}:${config.ebayClientSecret}`).toString('base64');
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope'
    });
    const data = await response.json();

    ebayToken = data.access_token;
    ebayTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return ebayToken;
}

async function searchEbayProducts(query, options = {}) {
    const token = await getEbayToken();
    const fetch = getFetch();
    const limit = Math.min(20, Math.max(1, Number(options.limit) || 8));
    const response = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();

    return (data.itemSummaries || []).map(item => ({
        title: item.title,
        price: item.price ? `${item.price.value} ${item.price.currency}` : 'See listing',
        image: item.image?.imageUrl || null,
        url: item.itemWebUrl
    }));
}

module.exports = {
    searchEbayProducts
};
