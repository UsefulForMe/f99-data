const fs = require("fs");
const _ = require("lodash");
const axios = require("axios");
const bluebird = require("bluebird");
async function getCategories() {
  const data = fs.readFileSync("./category/data.json", {
    encoding: "utf8",
    flag: "r",
  });

  const categories = JSON.parse(data);

  const parentCategories = categories.filter((item) => !item.parentId);
  const savedCategories = await Promise.all(
    parentCategories.map(async (item) => {
      const savedCategory = await axios.post(
        "http://localhost:3000/v1/categories",
        {
          name: item.name,
          image_url: item.imageUrl,
        }
      );

      return {
        ...item,
        uuid: savedCategory.data.category.id,
      };
    })
  );

  const mapSavedCategories = _.groupBy(savedCategories, "id");
  const childCategories = categories.filter((item) => item.parentId);
  const _childCategory = await Promise.all(
    _.map(childCategories, async (item) => {
      const parentCategory = mapSavedCategories[item.parentId];
      const savedCategory = await axios.post(
        "http://localhost:3000/v1/categories",
        {
          name: item.name,
          image_url: item.imageUrl,
          parent_id: parentCategory[0].uuid,
        }
      );
      return {
        ...item,
        uuid: savedCategory.data.category.id,
      };
    })
  );
  const mapSavedChildCategories = _.groupBy(_childCategory, "id");
  const mapCategory = _.merge(mapSavedCategories, mapSavedChildCategories);

  let sellers = fs.readFileSync("./sellers/data.json", {
    encoding: "utf8",
    flag: "r",
  });

  sellers = JSON.parse(sellers);
  const savedSellers = [];
  await bluebird
    .each(_.chunk(sellers, 100), (_sellers) => {
      return Promise.all(
        _sellers.map(async (item) => {
          const savedSeller = await axios.post(
            "http://localhost:3000/v1/sellers",
            {
              name: item.name,
              logo: item.logo,
              banner: item.banner,
              type: item.type,
              phone_number: item.phoneNumber,
              description: item.description,
              head_quarter: item.headQuarter,
              rating: item.rating,
              available_time: item.availableTime,
              note: item.note,
              email: item.email,
              total_vote: item.totalVote,
            }
          );
          // console.log(savedSeller.data.seller.id);
          savedSellers.push({
            ...item,
            uuid: savedSeller.data.seller.id,
          });
        })
      );
    })
    .catch((err) => console.log(err));
  console.log({ savedSellers: _.flattenDepth(savedSellers) });
  const mapSellerSaved = _.groupBy(_.flattenDepth(savedSellers), "id");
  // console.log({ mapSellerSaved });

  const products = fs.readFileSync("./tinyproduct/data.json", {
    encoding: "utf8",
    flag: "r",
  });

  const tinyProducts = JSON.parse(products);
  await bluebird
    .each(
      _.map(_.chunk(tinyProducts, 100), async (chunkProduct) => {
        return Promise.all(
          _.map(chunkProduct, async (product) => {
            const category = mapCategory[product.categoryId][0];
            const seller = mapSellerSaved[product.sellerId][0];

            // console.log(seller);
            const item = {
              name: product.name,
              description: product.description,
              price: product.price,
              old_price: product.oldPrice,
              unit: product.unit,
              image_url: product.imageUrl,
              image_urls: _.get(product, "imageUrls", []),
              category_id: category.uuid,
              tags: _.get(product, "tags", []),
              origin: product.origin,
              instructions: product.instructions,
              packs: _.get(product, "packs", []),
              seller_id: seller.uuid,
            };
            return axios.post("http://localhost:3000/v1/products", item);
          })
        );
      })
    )
    .catch((err) => console.log(err));
  console.log(tinyProducts.length);
}

async function main() {
  await getCategories();
}

main();
