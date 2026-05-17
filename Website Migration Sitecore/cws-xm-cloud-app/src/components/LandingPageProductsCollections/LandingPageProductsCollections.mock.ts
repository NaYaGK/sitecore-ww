/**
 * Mock data for LandingPageProductsCollections component.
 * Will be replaced by Sitecore datasource fields once wired up.
 */

export interface ProductItem {
  name: string;
  imgSrc: string;
  highlights: string[];
  defaultColor: string;
  colors: string[];
  colorImages?: Record<string, string>;
}

export interface CollectionTab {
  label: string;
  description: string;
  mainImage: { src: string; alt: string };
  products: ProductItem[];
}

export interface ProductsCollectionsMock {
  title: string;
  collections: CollectionTab[];
}

export const productsCollectionsMock: ProductsCollectionsMock = {
  "title": "Find your fit in our most popular collections",
  "collections": [
    {
      "label": "Industry Power",
      "description": "The timeless classic Industry Power: our universally applicable staple featuring a sleek and versatile two-tone design. This iconic piece is available in a wide range of colors and product variations, making it the perfect choice for any setting. With its durable construction and stylish appearance, Industry Power seamlessly combines functionality and aesthetics, ensuring long-lasting performance and an effortlessly professional look.",
      "mainImage": {
        "src": "https://www.cws.com/sites/default/files/styles/photoswipe_600_x_/public/2024-06/1004450-01_cws_ww_industry_power_lr.jpg.webp?itok=47S62pVR",
        "alt": ""
      },
      "products": [
        {
          "name": "CWS Pro Line: Work Jacket",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgrey1004440web01png?v=f87f401f&t=w700",
          "highlights": [
            "Material made of Fairtrade cotton and recycled polyester (REPREVE® fibres)",
            "Reflective elements (no protection according to EN ISO 20471)",
            "The extended back section protects against draughts",
            "Modern lines with contrast piping and quilting",
            "Various pockets..."
          ],
          "defaultColor": "Dark Grey",
          "colors": [
            "Dark Grey",
            "White/Grey",
            "Red/Dark Grey",
            "Dark Grey/Red",
            "Dark Grey/Grey",
            "Blue/Dark Blue",
            "Dark Blue",
            "Dark Brown/Brown",
            "Dark Green/Dark Grey",
            "Grey/Dark Grey"
          ],
          "colorImages": {
            "Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgrey1004440web01png?v=f87f401f&t=w700",
            "White/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwindustrial-workerarbeitsjacke-pro-line-weisgrau-ft1004485web01png?v=2a3fbbe2&t=w700",
            "Red/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketred1004465web01png?v=78644964&t=w700",
            "Dark Grey/Red": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgrey1004455web01png?v=10c814dd&t=w700",
            "Dark Grey/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgrey1004445web01png?v=3b09fc40&t=w700",
            "Blue/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketblue1004480web01png?v=2f03be80&t=w700",
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkblue1004475web01png?v=b5c00d4c&t=w700",
            "Dark Brown/Brown": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkbrown1004490web01png?v=1ed166e4&t=w700",
            "Dark Green/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgreen1004470web01png?v=5e004180&t=w700",
            "Grey/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketgrey1004460web01png?v=f70aad7c&t=w700"
          }
        },
        {
          "name": "CWS Pro Line: Bermuda",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudadarkgrey1004444web01png?v=44afd539&t=w700",
          "highlights": [
            "Material made of recycled polyester and cotton from the Fairtrade programm",
            "Close-fitting cut",
            "Comfort waistband for great wearing comfort",
            "Folding rule pocket with attached Cordura® cutter pocket",
            "Large smartphone pocket to keep mobile phones safe..."
          ],
          "defaultColor": "Dark Grey",
          "colors": [
            "Dark Grey",
            "Grey/Dark Grey",
            "Dark Grey/Red",
            "Dark Grey/Grey",
            "Blue/Dark Blue",
            "White/Grey",
            "Dark Blue",
            "Red/Dark Grey",
            "Dark Brown/Brown",
            "Dark Green/Dark Grey"
          ],
          "colorImages": {
            "Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudadarkgrey1004444web01png?v=44afd539&t=w700",
            "Grey/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudagrey1004464web01png?v=c63201bc&t=w700",
            "Dark Grey/Red": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudadarkgrey1004459web01png?v=63c3342e&t=w700",
            "Dark Grey/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudadarkgrey1004449web01png?v=53d8209a&t=w700",
            "Blue/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudablue1004484web01png?v=36ad7b38&t=w700",
            "White/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudawhite1004489web01png?v=88984177&t=w700",
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudadarkblue1004479web01png?v=413550d3&t=w700",
            "Red/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudared1004469web01png?v=f5aceefe&t=w700",
            "Dark Brown/Brown": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudadarkbrown1004494web01png?v=a2c17181&t=w700",
            "Dark Green/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinebermudadarkgreen1004474web01png?v=e9bfc60b&t=w700"
          }
        },
        {
          "name": "CWS Pro Line: Work Vest",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestdarkgrey1004443web01png?v=8db5353f&t=w700",
          "highlights": [
            "Protection against draughts thanks to the extended back",
            "Turn-down stand-up collar with press stud",
            "Concealed front zip",
            "Modern cut with sporty contrast piping and quilting",
            "Various pockets for tools, pens, smartphone and much more",
            "Mechanical stretch for..."
          ],
          "defaultColor": "Dark Grey",
          "colors": [
            "Dark Grey",
            "White/Grey",
            "Red/Dark Grey",
            "Grey/Dark Grey",
            "Dark Grey/Red",
            "Dark Grey/Grey",
            "Blue/Dark Blue",
            "Dark Blue",
            "Dark Brown/Brown",
            "Dark Green/Dark Grey"
          ],
          "colorImages": {
            "Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestdarkgrey1004443web01png?v=8db5353f&t=w700",
            "White/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestwhite1004488web01png?v=536a3c14&t=w700",
            "Red/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestred1004468web01png?v=d796858c&t=w700",
            "Grey/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestgrey1004463web01png?v=9d609cdb&t=w700",
            "Dark Grey/Red": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestdarkgrey1004458web01png?v=37b283dd&t=w700",
            "Dark Grey/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestdarkgrey1004448web01png?v=2770c84a&t=w700",
            "Blue/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestblue1004483web01png?v=102e21e5&t=w700",
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestdarkblue1004478web01png?v=bfd91b23&t=w700",
            "Dark Brown/Brown": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestdarkbrown1004493web01png?v=60e973c9&t=w700",
            "Dark Green/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinevestdarkgreen1004473web01png?v=277090cb&t=w700"
          }
        },
        {
          "name": "CWS Pro Line: Trousers",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgrey1004441web01png?v=46d6d9a1&t=w700",
          "highlights": [
            "High-quality functional material with cotton from the Fairtrade programme and recycled polyester Reflective elements (no protection according to EN ISO 20471)",
            "Concealed waistband fastener",
            "Modern lines with sporty contrast piping and quilting",
            "Sufficient..."
          ],
          "defaultColor": "Dark Grey",
          "colors": [
            "Dark Grey",
            "White/Grey",
            "Red/Dark Grey",
            "Grey/Dark Grey",
            "Dark Grey/Red",
            "Dark Grey/Grey",
            "Blue/Dark Blue",
            "Dark Blue",
            "Dark Brown/Brown",
            "Dark Green/Dark Grey"
          ],
          "colorImages": {
            "Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgrey1004441web01png?v=46d6d9a1&t=w700",
            "White/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrouserswhite1004486web01png?v=f972d2ab&t=w700",
            "Red/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersred1004466web01png?v=6abb296f&t=w700",
            "Grey/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersgrey1004461web01png?v=e27259d8&t=w700",
            "Dark Grey/Red": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgrey1004456web01png?v=707db0ca&t=w700",
            "Dark Grey/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgrey1004446web02png?v=1157fa89&t=w700",
            "Blue/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersblue1004481web01png?v=a7df1b8b&t=w700",
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkblue1004476web01png?v=42688acb&t=w700",
            "Dark Brown/Brown": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkbrown1004491web01png?v=4c7ab84f&t=w700",
            "Dark Green/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgreen1004471web01png?v=55614165&t=w700"
          }
        },
        {
          "name": "CWS Pro Line: Dungarees",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesdarkgrey1004442web01png?v=0744f590&t=w700",
          "highlights": [
            "Made from recycled polyester (REPREVE® fibres) and cotton from the Fairtrade range",
            "Mechanical stretch inserts for optimum comfort of movement",
            "Reflective elements (no protection according to EN ISO 20471) for improved visibility",
            "Sporty contrast piping..."
          ],
          "defaultColor": "Dark Grey",
          "colors": [
            "Dark Grey",
            "White/Grey",
            "Red/Dark Grey",
            "Grey/Dark Grey",
            "Dark Grey/Red",
            "Dark Grey/Grey",
            "Blue/Dark Blue",
            "Dark Blue",
            "Dark Brown/Brown",
            "Dark Green/Dark Grey"
          ],
          "colorImages": {
            "Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesdarkgrey1004442web01png?v=0744f590&t=w700",
            "White/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareeswhite1004487web01png?v=0252443f&t=w700",
            "Red/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesred1004467web01png?v=727666e2&t=w700",
            "Grey/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesgrey1004462web01png?v=087b52a6&t=w700",
            "Dark Grey/Red": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesdarkgrey1004457web01png?v=e658db15&t=w700",
            "Dark Grey/Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesdarkgrey1004447web01png?v=5f416bab&t=w700",
            "Blue/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesblue1004482web01png?v=74c90bff&t=w700",
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesdarkblue1004477web01png?v=f66e875e&t=w700",
            "Dark Brown/Brown": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesdarkbrown1004492web01png?v=938603d8&t=w700",
            "Dark Green/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinedungareesdarkgreen1004472web01png?v=a9040327&t=w700"
          }
        }
      ]
    },
    {
      "label": "Safety HighVis",
      "description": "Eco-friendly, high-visibility workwear with 40+ UV protection for sun-exposed workers. This range range meets EN ISO 20471 and EN 13758 standards, offering durable, comfortable safety essentials.",
      "mainImage": {
        "src": "https://www.cws.com/sites/default/files/styles/photoswipe_600_x_/public/2025-01/1006240-01_cws_ww_safety_xtra_highvis_outdoor_lr_3.png.webp?itok=khCnedza",
        "alt": "1006240-01_cws_ww_safety_xtra_highvis_outdoor_lr_3.png"
      },
      "products": [
        {
          "name": "CWS Pro Line HighVis: Work Vest",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisvesthighvisyellow1003114web01png?v=3b3b5800&t=w700",
          "highlights": [
            "Reflective stripes on the shoulders boost visibility",
            "Two breast pockets with press studs, two closable inside breast pockets",
            "Extended back protects against drafts",
            "Lightly padded"
          ],
          "defaultColor": "High Vis Yellow/Dark Grey",
          "colors": [
            "High Vis Yellow/Dark Grey",
            "High Vis Orange",
            "High Vis Yellow/Dark Blue",
            "High Vis Orange/Dark Grey",
            "High Vis Orange/Dark Green"
          ],
          "colorImages": {
            "High Vis Yellow/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisvesthighvisyellow1003114web01png?v=3b3b5800&t=w700",
            "High Vis Orange": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisvesthighvisorange1003129web01bpng?v=db99bb76&t=w700",
            "High Vis Yellow/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisvesthighvisyellow1003128web01png?v=e4c231d8&t=w700",
            "High Vis Orange/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisvesthighvisorange1003105web01png?v=5b497e06&t=w700",
            "High Vis Orange/Dark Green": "https://delivery.contenthub.cws.com/api/public/content/placeholder-image-contenthub-1500x1500png?v=e3a22d5f&t=w700"
          }
        },
        {
          "name": "CWS Pro Line HighVis: Trousers",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwsprolinehighvistrousershvygrey01jpg?v=e09b4f38&t=w700",
          "highlights": [
            "Stretch inserts for a perfect fit even when kneeling or bending over for work",
            "Ergonomically designed knee pad pockets and comfort waistband",
            "Two side pockets, one back pocket with flap and press stud on the right, a folding rule welt pocket on the right..."
          ],
          "defaultColor": "High Vis Yellow/Dark Grey",
          "colors": [
            "High Vis Yellow/Dark Grey",
            "High Vis Orange/Blue",
            "High Vis Orange/Dark Green",
            "High Vis Yellow/Dark Green",
            "High Vis Orange/Dark Grey",
            "High Vis Yellow/Dark Blue",
            "High Vis Orange/Dark Grey",
            "High Vis Orange/Dark Grey"
          ],
          "colorImages": {
            "High Vis Yellow/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwsprolinehighvistrousershvygrey01jpg?v=e09b4f38&t=w700",
            "High Vis Orange/Blue": "https://delivery.contenthub.cws.com/api/public/content/placeholder-image-contenthub-1500x1500png?v=e3a22d5f&t=w700",
            "High Vis Orange/Dark Green": "https://delivery.contenthub.cws.com/api/public/content/placeholder-image-contenthub-1500x1500png?v=e3a22d5f&t=w700",
            "High Vis Yellow/Dark Green": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvistrousershighvisyellow1005796web01png?v=e2ae5254&t=w700",
            "High Vis Orange/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvistrousershighvisorange1006060web01png?v=4c064acf&t=w700",
            "High Vis Yellow/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwsprolinehighvistrousershvygrey01jpg?v=e09b4f38&t=w700"
          }
        },
        {
          "name": "CWS Pro Line HighVis: Work Jacket",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisjackethighvisyellow1005786web01png?v=0a7673a8&t=w700",
          "highlights": [
            "Stretch insert behind shoulders for maximum freedom of movement",
            "Reflective stripes on the shoulders boost visibility",
            "Two breast pockets with a concealed button, one closable inside breast pocket, two side pockets with zips",
            "Adjustable cuff with press..."
          ],
          "defaultColor": "High Vis Yellow/Dark Grey",
          "colors": [
            "High Vis Yellow/Dark Grey",
            "High Vis Orange",
            "High Vis Yellow/Dark Green",
            "High Vis Orange/Blue",
            "High Vis Yellow/Dark Blue",
            "High Vis Orange/Dark Green",
            "High Vis Orange/Dark Grey"
          ],
          "colorImages": {
            "High Vis Yellow/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisjackethighvisyellow1005786web01png?v=0a7673a8&t=w700",
            "High Vis Orange": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisjackethighvisorange1005791web01bpng?v=6c781e56&t=w700",
            "High Vis Yellow/Dark Green": "https://delivery.contenthub.cws.com/api/public/content/placeholder-image-contenthub-1500x1500png?v=e3a22d5f&t=w700",
            "High Vis Orange/Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisjackethighvisorange1005788web01bpng?v=02e3e6ca&t=w700",
            "High Vis Yellow/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisjackethighvisyellow1005790web01png?v=4b19e493&t=w700",
            "High Vis Orange/Dark Green": "https://delivery.contenthub.cws.com/api/public/content/placeholder-image-contenthub-1500x1500png?v=e3a22d5f&t=w700",
            "High Vis Orange/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisjackethighvisorange1005785web01png?v=4d02c4ee&t=w700"
          }
        },
        {
          "name": "CWS Pro Line HighVis: Dungarees",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisdungareeshighvisyellow1005799web01png?v=7a8f81d4&t=w700",
          "highlights": [
            "Stretch inserts on the side for great freedom of movement, additional stretch insert in back bib.",
            "Elasticated, adjustable braces with quick-release buckles",
            "Ergonomically designed knee pad pockets",
            "Reflective stripes on the legs boost visibility in the..."
          ],
          "defaultColor": "High Vis Yellow/Dark Grey",
          "colors": [
            "High Vis Yellow/Dark Grey",
            "High Vis Orange/Blue",
            "High Vis Orange/Dark Grey",
            "High Vis Orange/Dark Green",
            "High Vis Yellow/Dark Green",
            "High Vis Orange/Dark Grey",
            "High Vis Yellow/Dark Blue",
            "High Vis Orange/Dark Grey",
            "High Vis Orange/Dark Grey"
          ],
          "colorImages": {
            "High Vis Yellow/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisdungareeshighvisyellow1005799web01png?v=7a8f81d4&t=w700",
            "High Vis Orange/Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisdungareeshighvisorange1005801web01png?v=1c2c7908&t=w700",
            "High Vis Orange/Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisdungareeshighvisorange1006056web01png?v=529ef406&t=w700",
            "High Vis Orange/Dark Green": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisdungareeshighvisorange1005800web01png?v=3b330eb5&t=w700",
            "High Vis Yellow/Dark Green": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisdungareeshighvisyellow1005802web01png?v=2f4f6e25&t=w700",
            "High Vis Yellow/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprolinehighvisdungareeshighvisyellow1005803web01png?v=2282e5b3&t=w700"
          }
        },
        {
          "name": "CWS Core HighVis: T-Shirt",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwscorehighvistshirthvyellow01png?v=30ed9c21&t=w700",
          "highlights": [
            "Very light: just 170 g/m2",
            "Fashionable t-shirt with stretch crew neck",
            "Multiple reflective stripes increase visibility"
          ],
          "defaultColor": "High Vis Yellow",
          "colors": [
            "High Vis Yellow",
            "High Vis Orange"
          ],
          "colorImages": {
            "High Vis Yellow": "https://delivery.contenthub.cws.com/api/public/content/cwscorehighvistshirthvyellow01png?v=30ed9c21&t=w700",
            "High Vis Orange": "https://delivery.contenthub.cws.com/api/public/content/cwscorehighvistshirthvorange01png?v=83d66e5a&t=w700"
          }
        },
        {
          "name": "CWS Core HighVis: Sweatshirt",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwscorehighvissweatshirthvyellow01png?v=9355b20f&t=w700",
          "highlights": [
            "Weighing in at 310 g/m2, the material feels very light",
            "Skin-friendly sweatshirt with zip collar, zip in contrasting colour",
            "Stand-up collar, sleeves with elasticated comfort cuff",
            "Reflective stripes on all sides increase visibility"
          ],
          "defaultColor": "High Vis Yellow",
          "colors": [
            "High Vis Yellow",
            "High Vis Orange"
          ],
          "colorImages": {
            "High Vis Yellow": "https://delivery.contenthub.cws.com/api/public/content/cwscorehighvissweatshirthvyellow01png?v=9355b20f&t=w700",
            "High Vis Orange": "https://delivery.contenthub.cws.com/api/public/content/cwscorehighvissweatshirthvorange01png?v=ef85898a&t=w700"
          }
        }
      ]
    },
    {
      "label": "Safety Welding",
      "description": "Grinding and welding come with significant risks, including extremely high temperatures, intense arcs, sharp metal splinters, and hazardous gases. Reliable protective clothing is essential—free from openings, damage, or contamination that could catch fire. Our products meet both welding protection classes: Class 1 and Class 2, ensuring maximum safety and compliance.",
      "mainImage": {
        "src": "https://www.cws.com/sites/default/files/styles/photoswipe_600_x_/public/2024-06/1004505-02_cws_ww_safety_welding_1_standard_lr_0.jpg.webp?h=6f846023&itok=b2zkZqsF",
        "alt": ""
      },
      "products": [
        {
          "name": "CWS Alpha Welding 1: Work Jacket",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwalphawelding1jacketdarkblue1004503web01png?v=d029fe9c&t=w700",
          "highlights": [
            "Low fabric weight of 335 g/m2",
            "Stand-up collar, concealed press studs on the front, hem with press stud adjustment",
            "One breast pocket on the left and two front pockets (each with flap and concealed press stud) plus an inside breast pocket on the left"
          ],
          "defaultColor": "Dark Blue",
          "colors": [
            "Dark Blue"
          ],
          "colorImages": {
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwalphawelding1jacketdarkblue1004503web01png?v=d029fe9c&t=w700"
          }
        },
        {
          "name": "CWS Alpha Welding 1: Dungarees",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwsalphawelding1dungareesdarkblue01png?v=eee300ff&t=w700",
          "highlights": [
            "Low fabric weight of 335 g/m2",
            "Elasticated braces adjustable with quick-release buckles, side openings with concealed buttons and press studs",
            "Bib inside with belt loops, fly with concealed zip",
            "Knee pad pockets with inner lining",
            "Side pockets, one bib..."
          ],
          "defaultColor": "Dark Blue",
          "colors": [
            "Dark Blue"
          ],
          "colorImages": {
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwsalphawelding1dungareesdarkblue01png?v=eee300ff&t=w700"
          }
        },
        {
          "name": "CWS Alpha Welding 1: Overall",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwsalphawelding1coveralldarkblue01png?v=ea00a03d&t=w700",
          "highlights": [
            "Low fabric weight of 335 g/m2",
            "Stand-up collar with press stud, concealed press studs on the front",
            "Hem with press stud adjustment, reach-through pockets on sides with concealed press stud",
            "Bib inside with belt loops, fly with concealed zip, knee pad..."
          ],
          "defaultColor": "Dark Blue",
          "colors": [
            "Dark Blue"
          ],
          "colorImages": {
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwsalphawelding1coveralldarkblue01png?v=ea00a03d&t=w700"
          }
        },
        {
          "name": "CWS Alpha Welding 1: Trousers",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwsalphawelding1trousersdarkblue01png?v=bbb7e64c&t=w700",
          "highlights": [
            "Low fabric weight of 335 g/m2",
            "Waist band with concealed button and belt loops, adjustable elasticated band, fly with concealed zip",
            "Knee pad pockets with inner lining",
            "Side pockets, one back pocket on the right, one reinforced bellows folding rule pocket..."
          ],
          "defaultColor": "Dark Blue",
          "colors": [
            "Dark Blue",
            "Dark Grey"
          ],
          "colorImages": {
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwsalphawelding1trousersdarkblue01png?v=bbb7e64c&t=w700",
            "Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwsalphawelding1trousersdarkgrey01png?v=7614cfd8&t=w700"
          }
        }
      ]
    },
    {
      "label": "PROknit",
      "description": "The PROknit assortment offers a wide range of t-shirts, poloshirts, sweaters.... that can be worn as work outfits in almost any industry.",
      "mainImage": {
        "src": "https://www.cws.com/sites/default/files/styles/photoswipe_600_x_/public/2024-06/1007749-02_cws_ww_industry_proknit_probasics_lr_0.jpg.webp?h=8340af92&itok=neVI0_61",
        "alt": "CWS WW Industry Proknit Probasics"
      },
      "products": [
        {
          "name": "CWS PRObasics: T-Shirt Ladies",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicstshirtgrey1007735web01png?v=e0f086d6&t=w700",
          "highlights": [
            "Stylish two-colour T-shirt",
            "Round neck with cuffs in trim colour",
            "moderately close cut, side panels in trim colour",
            "short multi-part raglan sleeves with flat hem, outer sleeve and shoulder parts in trim colour",
            "available in all sizes from 2XS..."
          ],
          "defaultColor": "Dark Grey/Black",
          "colors": [
            "Dark Grey/Black",
            "White",
            "White",
            "Red",
            "Red",
            "Red",
            "Light Grey",
            "Light Grey",
            "Grey",
            "Grey",
            "Grey",
            "Grey",
            "Dark Blue",
            "Blue/Dark Blue",
            "Blue/Dark Blue",
            "Dark Blue",
            "Dark Blue/Black",
            "Dark Blue/Black",
            "Dark Blue/Blue",
            "Dark Blue/Blue",
            "Dark Green",
            "Dark Grey",
            "Dark Green",
            "Dark Grey",
            "Dark Green",
            "Dark Grey"
          ],
          "colorImages": {
            "Dark Grey/Black": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicstshirtgrey1007735web01png?v=e0f086d6&t=w700",
            "White": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicsshirtwhite1007796web01png?v=4920abb7&t=w700",
            "Red": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicsshirtred1007785web01png?v=3782294f&t=w700",
            "Light Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicsshirtlightgrey1007784web01png?v=15ca02e9&t=w700",
            "Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicsshirtgrey1007783web01png?v=a7cbb30a&t=w700",
            "Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicsshirtdarkblue1007798web01png?v=4a4794f2&t=w700",
            "Blue/Dark Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicstshirtdarkblue1007734web01png?v=d1a25363&t=w700",
            "Dark Blue/Black": "https://delivery.contenthub.cws.com/api/public/content/cwswwindustry-proknittshirt-ladies-probasics-darkblue-black-ssl-ft1007736web01png?v=ceeb18e3&t=w700",
            "Dark Blue/Blue": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicstshirtdarkblue1007733web01png?v=860795ba&t=w700",
            "Dark Green": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicsshirtdarkgreen1007800web01png?v=86af8494&t=w700",
            "Dark Grey": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicsshirtdarkgrey1007781web01png?v=285a4d23&t=w700"
          }
        },
        {
          "name": "CWS PRObasics: Poloshirt Ladies",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicspoloshirtdarkblue1007743web01png?v=bf69ae41&t=w700",
          "highlights": [
            "Polo collar with 2-button polo trim",
            "moderately tapered cut",
            "Short sleeves with flat hem",
            "available in all sizes from 2XS to 8 XL"
          ],
          "defaultColor": "Dark Grey/Black",
          "colors": [
            "Dark Grey/Black"
          ],
          "colorImages": {
            "Dark Grey/Black": "https://delivery.contenthub.cws.com/api/public/content/cwswwprobasicspoloshirtdarkblue1007743web01png?v=bf69ae41&t=w700"
          }
        },
        {
          "name": "CWS PROcasual: Work Vest",
          "imgSrc": "https://delivery.contenthub.cws.com/api/public/content/cwswwprocasualvestdarkgrey1007813web01png?v=560fe33d&t=w700",
          "highlights": [
            "casual quilted waistcoat made from sustainable materials",
            "stand-up collar, inner lining of stand-up collar made of quilted lining",
            "close-fitting cut, side and horizontal dividing seams, narrow-edged reflective stripes in shoulder yoke in front and back..."
          ],
          "defaultColor": "Dark Grey/Black",
          "colors": [
            "Dark Grey/Black"
          ],
          "colorImages": {
            "Dark Grey/Black": "https://delivery.contenthub.cws.com/api/public/content/cwswwprocasualvestdarkgrey1007813web01png?v=560fe33d&t=w700"
          }
        }
      ]
    }
  ]
};
