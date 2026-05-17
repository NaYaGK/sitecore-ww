/**
 * Mock data for LandingPageProductsTopPicks component.
 * Will be replaced by Sitecore datasource fields once wired up.
 */

export interface TopPickProduct {
  name: string;
  imgSrc: string;
  highlights: string[];
  defaultColor: string;
  colors: string[];
  /** Map of color name → product image URL */
  colorImages: Record<string, string>;
}

export interface TopPickHotspot {
  /** CSS top position (percentage) */
  top: string;
  /** CSS left position (percentage) */
  left: string;
  /** CSS width (percentage) */
  width: string;
  /** CSS height (percentage) */
  height: string;
  /** Associated product index */
  productIndex: number;
}

export interface TopPicksMock {
  title: string;
  lifestyleImage: { src: string; alt: string };
  hotspots: TopPickHotspot[];
  products: TopPickProduct[];
}

export const topPicksMock: TopPicksMock = {
  title: 'Top picks: Workwear that delivers',
  lifestyleImage: {
    src: 'https://www.cws.com/sites/default/files/styles/cover_medium_1500_x_/public/2025-02/1004450-01%20CWS%20WW%20Industry%20Power%20LR%20%281%29_0.jpg.webp?itok=VxR6_eoV',
    alt: 'CWS Industry Power workwear — worker wearing two-tone jacket and trousers',
  },
  hotspots: [
    {
      top: '24.5%',
      left: '50.13%',
      width: '6.27%',
      height: '9%',
      productIndex: 0,
    },
    {
      top: '52%',
      left: '47%',
      width: '7.2%',
      height: '9.9%',
      productIndex: 1,
    },
  ],
  products: [
    {
      name: 'CWS Pro Line: Work Jacket',
      imgSrc:
        'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgrey1004440web01png?v=f87f401f&t=w700',
      highlights: [
        'Material made of Fairtrade cotton and recycled polyester (REPREVE\u00ae fibres)',
        'Reflective elements (no protection according to EN ISO 20471)',
        'The extended back section protects against draughts',
        'Modern lines with contrast piping and quilting',
        'Various pockets',
      ],
      defaultColor: 'Dark Grey',
      colors: [
        'Dark Grey',
        'White/Grey',
        'Red/Dark Grey',
        'Dark Grey/Red',
        'Dark Grey/Grey',
        'Blue/Dark Blue',
        'Dark Blue',
        'Dark Brown/Brown',
        'Dark Green/Dark Grey',
        'Grey/Dark Grey',
      ],
      colorImages: {
        'Dark Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgrey1004440web01png?v=f87f401f&t=w700',
        'White/Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwindustrial-workerarbeitsjacke-pro-line-weisgrau-ft1004485web01png?v=2a3fbbe2&t=w700',
        'Red/Dark Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketred1004465web01png?v=78644964&t=w700',
        'Dark Grey/Red':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgrey1004455web01png?v=10c814dd&t=w700',
        'Dark Grey/Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgrey1004445web01png?v=3b09fc40&t=w700',
        'Blue/Dark Blue':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketblue1004480web01png?v=2f03be80&t=w700',
        'Dark Blue':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkblue1004475web01png?v=b5c00d4c&t=w700',
        'Dark Brown/Brown':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkbrown1004490web01png?v=1ed166e4&t=w700',
        'Dark Green/Dark Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketdarkgreen1004470web01png?v=5e004180&t=w700',
        'Grey/Dark Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinejacketgrey1004460web01png?v=f70aad7c&t=w700',
      },
    },
    {
      name: 'CWS Pro Line: Trousers',
      imgSrc:
        'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgrey1004441web01png?v=46d6d9a1&t=w700',
      highlights: [
        'High-quality functional material with cotton from the Fairtrade programme and recycled polyester',
        'Reflective elements (no protection according to EN ISO 20471)',
        'Concealed waistband fastener',
        'Modern lines with sporty contrast piping and quilting',
      ],
      defaultColor: 'Dark Grey',
      colors: [
        'Dark Grey',
        'White/Grey',
        'Red/Dark Grey',
        'Grey/Dark Grey',
        'Dark Grey/Red',
        'Dark Grey/Grey',
        'Blue/Dark Blue',
        'Dark Blue',
        'Dark Brown/Brown',
        'Dark Green/Dark Grey',
      ],
      colorImages: {
        'Dark Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgrey1004441web01png?v=46d6d9a1&t=w700',
        'White/Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrouserswhite1004486web01png?v=f972d2ab&t=w700',
        'Red/Dark Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersred1004466web01png?v=6abb296f&t=w700',
        'Grey/Dark Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersgrey1004461web01png?v=e27259d8&t=w700',
        'Dark Grey/Red':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgrey1004456web01png?v=707db0ca&t=w700',
        'Dark Grey/Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgrey1004446web02png?v=1157fa89&t=w700',
        'Blue/Dark Blue':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersblue1004481web01png?v=a7df1b8b&t=w700',
        'Dark Blue':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkblue1004476web01png?v=42688acb&t=w700',
        'Dark Brown/Brown':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkbrown1004491web01png?v=4c7ab84f&t=w700',
        'Dark Green/Dark Grey':
          'https://delivery.contenthub.cws.com/api/public/content/cwswwprolinetrousersdarkgreen1004471web01png?v=55614165&t=w700',
      },
    },
  ],
};
