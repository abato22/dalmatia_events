const pool = require("./db");


const events = [

{
organizer_name: "Maja",
organizer_surname: "Radić",
organizer_email: "maja.radic@gmail.com",
organizer_phone: "0911230001",
title: "Sinj Alka Cultural Evening",
description: "Traditional Sinj Alka presentation and folklore music.",
place_id: 87,
category_id: 4,
price: 8,
date_start: "2026-08-02",
date_end: "2026-08-02",
lat: 43.7030,
lng: 16.6390
},

{
organizer_name: "Dino",
organizer_surname: "Kralj",
organizer_email: "dino.kralj@gmail.com",
organizer_phone: "0911230002",
title: "Omiš Pirate Festival",
description: "Historical pirate reenactment and concerts.",
place_id: 73,
category_id: 2,
price: 12,
date_start: "2026-07-15",
date_end: "2026-07-16",
lat: 43.4420,
lng: 16.6920
},

{
organizer_name: "Ivana",
organizer_surname: "Barić",
organizer_email: "ivana.baric@gmail.com",
organizer_phone: "0911230003",
title: "Kaštela Summer Music Fest",
description: "Pop and rock bands performing along the coast.",
place_id: 61,
category_id: 1,
price: 15,
date_start: "2026-07-10",
date_end: "2026-07-10",
lat: 43.5480,
lng: 16.3500
},

{
organizer_name: "Filip",
organizer_surname: "Bošnjak",
organizer_email: "filip.bosnjak@gmail.com",
organizer_phone: "0911230004",
title: "Imotski Lake Run",
description: "5km and 10km race around Red and Blue Lake.",
place_id: 59,
category_id: 3,
price: 10,
date_start: "2026-05-18",
date_end: "2026-05-18",
lat: 43.4470,
lng: 17.2170
},

{
organizer_name: "Lucija",
organizer_surname: "Grubišić",
organizer_email: "lucija.grubisic@gmail.com",
organizer_phone: "0911230005",
title: "Hvar Island Wine Festival",
description: "Local Hvar wineries presenting premium wines.",
place_id: 58,
category_id: 5,
price: 25,
date_start: "2026-09-01",
date_end: "2026-09-02",
lat: 43.1720,
lng: 16.4420
},

{
organizer_name: "Marko",
organizer_surname: "Jurišić",
organizer_email: "marko.jurisic@gmail.com",
organizer_phone: "0911230006",
title: "Supetar Beach Concert",
description: "Live acoustic music by the sea.",
place_id: 93,
category_id: 1,
price: 10,
date_start: "2026-06-22",
date_end: "2026-06-22",
lat: 43.3840,
lng: 16.5490
},

{
organizer_name: "Ana",
organizer_surname: "Zadro",
organizer_email: "ana.zadro@gmail.com",
organizer_phone: "0911230007",
title: "Korčula Medieval Festival",
description: "Traditional sword dances and historical shows.",
place_id: 12,
category_id: 4,
price: 12,
date_start: "2026-07-20",
date_end: "2026-07-21",
lat: 42.9590,
lng: 17.1360
},

{
organizer_name: "Ivan",
organizer_surname: "Petković",
organizer_email: "ivan.petkovic@gmail.com",
organizer_phone: "0911230008",
title: "Metković River Marathon",
description: "Kayak race on Neretva River.",
place_id: 16,
category_id: 3,
price: 8,
date_start: "2026-05-30",
date_end: "2026-05-30",
lat: 43.0540,
lng: 17.6480
},

{
organizer_name: "Tea",
organizer_surname: "Pavić",
organizer_email: "tea.pavic@gmail.com",
organizer_phone: "0911230009",
title: "Ploče Summer DJ Night",
description: "Open-air DJ event near the harbor.",
place_id: 20,
category_id: 2,
price: 5,
date_start: "2026-08-10",
date_end: "2026-08-10",
lat: 43.0510,
lng: 17.4320
},

{
organizer_name: "Mate",
organizer_surname: "Klarić",
organizer_email: "mate.klaric@gmail.com",
organizer_phone: "0911230010",
title: "Vodice Night Fiesta",
description: "Dance party with live bands and DJs.",
place_id: 47,
category_id: 2,
price: 15,
date_start: "2026-07-25",
date_end: "2026-07-25",
lat: 43.7570,
lng: 15.7820
},

{
organizer_name: "Kristina",
organizer_surname: "Šego",
organizer_email: "kristina.sego@gmail.com",
organizer_phone: "0911230011",
title: "Knin Fortress Tour",
description: "Historical guided walking tour.",
place_id: 36,
category_id: 4,
price: 7,
date_start: "2026-06-12",
date_end: "2026-06-12",
lat: 44.0400,
lng: 16.1960
},

{
organizer_name: "Nikola",
organizer_surname: "Matić",
organizer_email: "nikola.matic@gmail.com",
organizer_phone: "0911230012",
title: "Drniš Prosciutto Fair",
description: "Traditional prosciutto tasting festival.",
place_id: 32,
category_id: 5,
price: 10,
date_start: "2026-09-18",
date_end: "2026-09-19",
lat: 43.8620,
lng: 16.1550
},

{
organizer_name: "Petra",
organizer_surname: "Rogić",
organizer_email: "petra.rogic@gmail.com",
organizer_phone: "0911230013",
title: "Biograd Sailing Regatta",
description: "Annual Adriatic sailing competition.",
place_id: 106,
category_id: 3,
price: 20,
date_start: "2026-06-01",
date_end: "2026-06-03",
lat: 43.9370,
lng: 15.4410
},

{
organizer_name: "Bruno",
organizer_surname: "Lovrić",
organizer_email: "bruno.lovric@gmail.com",
organizer_phone: "0911230014",
title: "Nin Salt Festival",
description: "Festival celebrating traditional salt production.",
place_id: 113,
category_id: 4,
price: 6,
date_start: "2026-08-05",
date_end: "2026-08-05",
lat: 44.2400,
lng: 15.1780
},

{
organizer_name: "Helena",
organizer_surname: "Ćorić",
organizer_email: "helena.coric@gmail.com",
organizer_phone: "0911230015",
title: "Pag Summer Beach Party",
description: "Night beach party with electronic music.",
place_id: 116,
category_id: 2,
price: 20,
date_start: "2026-07-12",
date_end: "2026-07-12",
lat: 44.4450,
lng: 15.0540
},

{
organizer_name: "Antonio",
organizer_surname: "Grubić",
organizer_email: "antonio.grubic@gmail.com",
organizer_phone: "0911230016",
title: "Stari Grad Poetry Night",
description: "Poetry readings in historic square.",
place_id: 91,
category_id: 4,
price: 5,
date_start: "2026-06-18",
date_end: "2026-06-18",
lat: 43.1830,
lng: 16.5950
},

{
organizer_name: "Sara",
organizer_surname: "Bilić",
organizer_email: "sara.bilic@gmail.com",
organizer_phone: "0911230017",
title: "Vis Island Acoustic Evening",
description: "Acoustic guitar concert at sunset.",
place_id: 98,
category_id: 1,
price: 12,
date_start: "2026-07-05",
date_end: "2026-07-05",
lat: 43.0600,
lng: 16.1830
},

{
organizer_name: "Davor",
organizer_surname: "Maras",
organizer_email: "davor.maras@gmail.com",
organizer_phone: "0911230018",
title: "Komiža Fishermen Festival",
description: "Celebration of traditional fishing heritage.",
place_id: 63,
category_id: 5,
price: 8,
date_start: "2026-08-14",
date_end: "2026-08-14",
lat: 43.0440,
lng: 16.0940
},

{
organizer_name: "Ivana",
organizer_surname: "Jurčević",
organizer_email: "ivana.jurcevic@gmail.com",
organizer_phone: "0911230019",
title: "Orebić Wine Tasting",
description: "Pelješac region wine presentation.",
place_id: 19,
category_id: 5,
price: 18,
date_start: "2026-09-08",
date_end: "2026-09-08",
lat: 42.9750,
lng: 17.1800
},

{
organizer_name: "Marko",
organizer_surname: "Lasić",
organizer_email: "marko.lasic@gmail.com",
organizer_phone: "0911230020",
title: "Vela Luka Music Festival",
description: "Island open-air summer music festival.",
place_id: 26,
category_id: 2,
price: 20,
date_start: "2026-07-28",
date_end: "2026-07-29",
lat: 42.9620,
lng: 16.7190
},

{
organizer_name: "Karla",
organizer_surname: "Milić",
organizer_email: "karla.milic@gmail.com",
organizer_phone: "0911230021",
title: "Bol Windsurf Championship",
description: "International windsurf competition at Zlatni Rat.",
place_id: 50,
category_id: 3,
price: 15,
date_start: "2026-06-15",
date_end: "2026-06-17",
lat: 43.2580,
lng: 16.6370
},

{
organizer_name: "Luka",
organizer_surname: "Šantić",
organizer_email: "luka.santic@gmail.com",
organizer_phone: "0911230022",
title: "Podgora Fishermen Night",
description: "Seafood and live klapa music.",
place_id: 76,
category_id: 5,
price: 10,
date_start: "2026-08-09",
date_end: "2026-08-09",
lat: 43.2420,
lng: 17.0770
},

{
organizer_name: "Marina",
organizer_surname: "Vrančić",
organizer_email: "marina.vrancic@gmail.com",
organizer_phone: "0911230023",
title: "Baška Voda Summer Dance",
description: "Open-air dance night by the beach.",
place_id: 48,
category_id: 2,
price: 12,
date_start: "2026-07-18",
date_end: "2026-07-18",
lat: 43.3570,
lng: 16.9480
},

{
organizer_name: "Filip",
organizer_surname: "Kovačević",
organizer_email: "filip.kovacevic@gmail.com",
organizer_phone: "0911230024",
title: "Primošten Wine Festival",
description: "Local vineyards presenting premium wines.",
place_id: 39,
category_id: 5,
price: 15,
date_start: "2026-09-12",
date_end: "2026-09-12",
lat: 43.5860,
lng: 15.9230
},

{
organizer_name: "Mia",
organizer_surname: "Bajlo",
organizer_email: "mia.bajlo@gmail.com",
organizer_phone: "0911230025",
title: "Skradin River Jazz",
description: "Jazz concert by Krka river.",
place_id: 44,
category_id: 1,
price: 14,
date_start: "2026-06-25",
date_end: "2026-06-25",
lat: 43.8160,
lng: 15.9220
},

{
organizer_name: "Josip",
organizer_surname: "Krnić",
organizer_email: "josip.krnic@gmail.com",
organizer_phone: "0911230026",
title: "Murter Sailing Weekend",
description: "Recreational sailing weekend event.",
place_id: 37,
category_id: 3,
price: 18,
date_start: "2026-06-10",
date_end: "2026-06-11",
lat: 43.8230,
lng: 15.5920
},

{
organizer_name: "Ema",
organizer_surname: "Zorić",
organizer_email: "ema.zoric@gmail.com",
organizer_phone: "0911230027",
title: "Trilj River Canoe Race",
description: "Canoe competition on Cetina river.",
place_id: 95,
category_id: 3,
price: 10,
date_start: "2026-05-22",
date_end: "2026-05-22",
lat: 43.6180,
lng: 16.7240
},

{
organizer_name: "Ante",
organizer_surname: "Mijić",
organizer_email: "ante.mijic@gmail.com",
organizer_phone: "0911230028",
title: "Vrgorac Strawberry Festival",
description: "Festival celebrating local strawberries.",
place_id: 99,
category_id: 5,
price: 5,
date_start: "2026-05-30",
date_end: "2026-05-30",
lat: 43.2040,
lng: 17.3710
},

{
organizer_name: "Tina",
organizer_surname: "Klarić",
organizer_email: "tina.klaric@gmail.com",
organizer_phone: "0911230029",
title: "Obrovac Cultural Evening",
description: "Traditional dance and folklore performance.",
place_id: 115,
category_id: 4,
price: 6,
date_start: "2026-08-03",
date_end: "2026-08-03",
lat: 44.2000,
lng: 15.6820
},

{
organizer_name: "Damir",
organizer_surname: "Vuković",
organizer_email: "damir.vukovic@gmail.com",
organizer_phone: "0911230030",
title: "Benkovac Rock Festival",
description: "Local and regional rock bands live.",
place_id: 104,
category_id: 1,
price: 10,
date_start: "2026-07-22",
date_end: "2026-07-22",
lat: 44.0340,
lng: 15.6120
}

];

async function seed() {
  try {
    console.log("Seeding events...");

    for (const e of events) {
      await pool.query(
        `
        INSERT INTO events
        (
          organizer_name,
          organizer_surname,
          organizer_email,
          organizer_phone,
          title,
          description,
          place_id,
          category_id,
          price,
          date_start,
          date_end,
          image_url,
          created_by,
          location_point
        )
        VALUES
        (
          $1,$2,$3,$4,
          $5,$6,$7,$8,$9,$10,$11,$12,
          $13,
          ST_SetSRID(ST_MakePoint($14,$15),4326)
        )
        `,
        [
          "Seed",
          "User",
          "seed@test.com",
          "000000000",
          e.title,
          e.description,
          e.place_id,
          e.category_id,
          e.price,
          e.date_start,
          e.date_end,
          null,
          1, // ⚠️ must be valid user id
          e.lng,
          e.lat
        ]
      );
    }

    console.log("✅ Seeding finished!");
    process.exit();

  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();