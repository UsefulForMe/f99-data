const fetch = require("node-fetch");

const fs = require("fs");
const _ = require("lodash");
const bluebird = require("bluebird");

async function main() {
  getInfo();
  // crawl();
  // crawlList();
  // appendSeller();
}

async function getInfo() {
  await Promise.all(
    _.range(1, 200).map(async (i) => {
      if (!fs.existsSync("product/data-" + i + ".json")) {
        return;
      }
      const product = fs.readFileSync(`./product/data-${i}.json`, {
        encoding: "utf8",
        flag: "r",
      });

      const data = JSON.parse(product);

      data.forEach((item) => {
        const tinyProduct = {
          imageUrl: item.imageUrl,
          imageUrls: item.imageUrls,
          id: item.id,
          description: item.description,
          name: item.name,
          price: item.price,
          oldPrice: item.oldPrice,
          unit: item.unit,
          categoryId: _.get(item, "category.id"),
          tags: item.tags,
          origin: item.origin,
          instructions: item.instructions,
          packs: _.get(_.find(item.attributes, { name: "Đóng gói" }), "values"),
          sellerId: _.get(item, "sellerId"),
        };
        console.log(tinyProduct);
        fs.appendFileSync(
          `./tinyproduct/data.json`,
          `${JSON.stringify(tinyProduct, null, 2)},\n`,
          {
            encoding: "utf8",
          }
        );
      });
    })
  );
}

async function crawl() {
  await Promise.all(
    _.range(1, 1000).map(async (i) => {
      const res = await fetch(
        `https://f99apim.azure-api.net/catalog/v2/api/Products?pageno=0&categoryId=${i}&order=sold&sort=ASC`,
        {
          headers: {
            accept: "application/json",
            "accept-language": "vi",
            "cache-control": "no-cache",
            latlng: "21.0277644_105.8341598",
            location: "b4bb3e8f-8f73-4f3a-8ea9-7d95147bcc68",
            "ocp-apim-subscription-key": "465615a2ff734987909ec9e44d750cbe",
            "sec-ch-ua":
              '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Linux"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            Referer: "https://f99.com.vn/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
          },
          body: null,
          method: "GET",
        }
      );
      const data = await res.json();
      if (data.statusCode !== 404) {
        fs.writeFileSync(
          `./product/data-${i}.json`,
          JSON.stringify(data.data, null, 2),
          {
            encoding: "utf8",
            flag: "w+",
          }
        );
      }
    })
  );
}

async function crawlList() {
  const res = await fetch(
    "https://f99apim.azure-api.net/catalog/v2/api/Categories/List",
    {
      headers: {
        accept: "application/json",
        "accept-language": "vi",
        "cache-control": "no-cache",
        latlng: "21.0277644_105.8341598",
        location: "b4bb3e8f-8f73-4f3a-8ea9-7d95147bcc68",
        "ocp-apim-subscription-key": "465615a2ff734987909ec9e44d750cbe",
        "sec-ch-ua":
          '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "x-lat": "21.0277644",
        "x-lng": "105.8341598",
        Referer: "https://f99.com.vn/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  const data = await res.json();
  fs.writeFileSync(`category/data.json`, JSON.stringify(data.data, null, 2), {
    encoding: "utf8",
    flag: "w+",
  });
}

async function crawlSeller() {
  await bluebird
    .each(_.chunk(_.range(1, 5000), 100), async (list, index) => {
      await Promise.all(
        _.map(list, async (i) => {
          console.log({ index, i });
          console.log(index * 100 + i);

          const res = await fetch(
            "https://f99apim.azure-api.net/seller/v2/api/Sellers/" + i,
            {
              headers: {
                accept: "application/json",
                "accept-language": "vi",
                "cache-control": "no-cache",
                "ocp-apim-subscription-key": "465615a2ff734987909ec9e44d750cbe",
                "sec-ch-ua":
                  '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Linux"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "x-lat": "21.0277644",
                "x-lng": "105.8341598",
                Referer: "https://f99.com.vn/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
              },
              body: null,
              method: "GET",
            }
          );
          const data = await res.json();
          console.log(data.data);
          // if (data.statusCode !== 404) {
          //   if (data.data.name !== null) {
          //     fs.writeFileSync(
          //       `./seller/data-${i}.json`,
          //       JSON.stringify(data.data, null, 2),
          //       {
          //         encoding: "utf8",
          //         flag: "w+",
          //       }
          //     );
          //   }
          // }
        })
      );
    })
    .catch((err) => {
      console.log(err);
    });
}

async function appendSeller() {
  await Promise.all(
    _.range(1, 1100).map(async (i) => {
      if (!fs.existsSync("seller/data-" + i + ".json")) {
        return;
      }
      const seller = fs.readFileSync(`./seller/data-${i}.json`, {
        encoding: "utf8",
        flag: "r",
      });

      const data = JSON.parse(seller);

      const _seller = {
        id: data.id,
        name: data.name,
        logo: data.logo,
        banner: data.banner,
        type: data.type,
        phoneNumber: data.phoneNumber,
        description: data.description,
        headQuarter: data.headQuarter,
        email: data.email,
        rating: data.rating,
        availableTime: data.availableTime,
        note: data.note,
        totalVote: data.totalVote,
      };
      console.log(_seller);
      fs.appendFileSync(
        `./sellers/data.json`,
        `${JSON.stringify(_seller, null, 2)},\n`,
        {
          encoding: "utf8",
        }
      );
    })
  );
}

main();
