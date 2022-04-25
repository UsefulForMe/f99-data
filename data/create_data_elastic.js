const fs = require("fs");
const axios = require("axios");
const _ = require("lodash");
function transformDataForElasticFile(data) {
    let body = "";
    if (!_.isArray(data)) {
        data = [data];
    }
    data.map(function (record) {
        Object.keys(record).map(function (key) {
            if (_.isObject(record[key])) {
                if (record[key]['$oid']) {
                    record[key] = record[key]['$oid'];
                } else if (record[key]['$date']) {
                    record[key] = moment(record[key]['$date']).toDate();
                }
            }
        });
        let id = _.cloneDeep(record.id);
        delete record._id;
        body += JSON.stringify({ _index: 'products', _id: id, _source: record }) + "\n";
    });
    return body
}
(async () => {
    const res = await axios.get("http://localhost:3000/v1/products");
    let data = [];
    console.log(res.data.products.length);
    res.data.products.forEach((product) => {
        data.push({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.old_price,
            unit: product.unit,
            imageUrl: product.image_url,
            tags: _.get(product, "tags", []),
            origin: product.origin,
          });
    })
    fs.writeFile('products.json', transformDataForElasticFile(data), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Export data successfully');
        }
    });
})();