const axios = require("axios");
const _ = require("lodash");
const fs = require("fs");
const bluebird = require("bluebird");
(async () => {
  const res = await axios.get("http://localhost:3000/cms/v1/products");
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
  });

  const chunk = _.chunk(data, 10);

  await bluebird.each(
    _.map(chunk, async (chunkProduct) => {
      return Promise.all(
        _.map(chunkProduct, async (product) => {
          const item = {
            product_id: product.id,
            quantity: 100,
          };
          return axios.post("http://localhost:3000/cms/v1/stocks", item);
        })
      );
    })
  );
})();
