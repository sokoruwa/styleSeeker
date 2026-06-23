const { searchEbayProducts } = require('../../services/ebayService');

function isValidProductQuery(query) {
    return typeof query === 'string' && query.trim().length > 0 && query.length <= 100;
}

async function searchProducts(query) {
    if (!isValidProductQuery(query)) {
        return { error: 'Invalid product search query' };
    }

    try {
        const products = await searchEbayProducts(query.trim());
        return { products };
    } catch (error) {
        return { error: 'Could not fetch products' };
    }
}

module.exports = {
    searchProducts
};
