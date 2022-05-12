const axios = require("axios");
const _ = require("lodash");
const fs = require("fs");
const bluebird = require("bluebird");
(async () => {
  const res = await axios.get("http://localhost:3000/cms/v1/stocks");
  let data = [];
  console.log(res.data.stocks.length);

  const chunk = _.chunk(data, 50);
})();
