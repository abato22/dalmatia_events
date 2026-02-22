const fs = require("fs");

const rawData = JSON.parse(
  fs.readFileSync("croatia-level2.json", "utf8")
);

const dalmatiaCounties = [
  "Zadarska",
  "Šibensko-Kninska",
  "Splitsko-Dalmatinska",
  "Dubrovacko-Neretvanska"
];

const filtered = {
  type: "FeatureCollection",
  features: rawData.features.filter(feature =>
    dalmatiaCounties.includes(feature.properties.NAME_1)
  )
};

fs.writeFileSync(
  "dalmatia-municipalities.json",
  JSON.stringify(filtered)
);

console.log("Dalmatia municipalities extracted successfully.");
