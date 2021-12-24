const menuMysql = require('../../../modules/mysql/menu');

async function getMenuItemSearchRecommendations(req, res, next) {
    try {
        const db = req.app.get('db');
        const {
            item_search_string
        } = req.body;
        const searchResults = await menuMysql.searchMenu(db.mysql.read, item_search_string);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: searchResults,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    getMenuItemSearchRecommendations
}