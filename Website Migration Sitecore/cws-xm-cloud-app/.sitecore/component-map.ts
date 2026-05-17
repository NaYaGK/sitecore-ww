// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCWrapper, NextjsContentSdkComponent, FEaaSWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as FormValidation from 'src/components/FormValidation';
import * as EditingScriptsWrapper from 'src/components/EditingScriptsWrapper';
import * as dialog from 'src/components/ui/dialog';
import * as SitecoreRenderRoot from 'src/components/sitecore/SitecoreRenderRoot';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as nextImageSrcdev from 'src/components/image/nextImageSrc.dev';
import * as imageprops from 'src/components/image/image.props';
import * as imageoptimizationcontext from 'src/components/image/image-optimization.context';
import * as ImageWrapperdev from 'src/components/image/ImageWrapper.dev';
import * as ImageBlock from 'src/components/image/ImageBlock';
import * as WysiwygTableprops from 'src/components/WysiwygTable/WysiwygTable.props';
import * as WysiwygTable from 'src/components/WysiwygTable/WysiwygTable';
import * as wysiwygblockprops from 'src/components/WysiwygBlock/wysiwyg-block.props';
import * as WysiwygBlock from 'src/components/WysiwygBlock/WysiwygBlock';
import * as WorkwearCollectionsTeaserGridprops from 'src/components/WorkwearCollectionsTeaserGrid/WorkwearCollectionsTeaserGrid.props';
import * as WorkwearCollectionsTeaserGrid from 'src/components/WorkwearCollectionsTeaserGrid/WorkwearCollectionsTeaserGrid';
import * as VideoPlayerprops from 'src/components/VideoPlayer/VideoPlayer.props';
import * as VideoPlayer from 'src/components/VideoPlayer/VideoPlayer';
import * as TopHeader from 'src/components/TopHeader/TopHeader';
import * as TextHighlightprops from 'src/components/TextHighlight/TextHighlight.props';
import * as TextHighlight from 'src/components/TextHighlight/TextHighlight';
import * as Testimonialprops from 'src/components/Testimonial/Testimonial.props';
import * as Testimonial from 'src/components/Testimonial/Testimonial';
import * as StickyContactBarprops from 'src/components/StickyContactBar/StickyContactBar.props';
import * as StickyContactBar from 'src/components/StickyContactBar/StickyContactBar';
import * as StickyBackToTopprops from 'src/components/StickyBackToTop/StickyBackToTop.props';
import * as StickyBackToTop from 'src/components/StickyBackToTop/StickyBackToTop';
import * as SpotlightStoriesMobile from 'src/components/Spotlight Stories/SpotlightStoriesMobile';
import * as SpotlightStoriesprops from 'src/components/Spotlight Stories/SpotlightStories.props';
import * as SpotlightStories from 'src/components/Spotlight Stories/SpotlightStories';
import * as SliderComponentprops from 'src/components/SliderComponent/SliderComponent.props';
import * as SliderComponent from 'src/components/SliderComponent/SliderComponent';
import * as SliderCarouselComponentprops from 'src/components/SliderCarouselComponent/SliderCarouselComponent.props';
import * as SliderCarouselComponent from 'src/components/SliderCarouselComponent/SliderCarouselComponent';
import * as SitecoreForm from 'src/components/SitecoreForm/SitecoreForm';
import * as SimpleHeadingprops from 'src/components/SimpleHeading/SimpleHeading.props';
import * as SimpleHeading from 'src/components/SimpleHeading/SimpleHeading';
import * as search_filter_panelprops from 'src/components/Search/SearchFilterPanel/search_filter_panel.props';
import * as searchFilterPanelData from 'src/components/Search/SearchFilterPanel/searchFilterPanelData';
import * as SearchFilterPanel from 'src/components/Search/SearchFilterPanel/SearchFilterPanel';
import * as SearchContainer from 'src/components/Search/SearchContainer/SearchContainer';
import * as SearchBarSearchPage from 'src/components/Search/SearchBar/SearchBarSearchPage';
import * as SearchBarAllPages from 'src/components/Search/SearchBar/SearchBarAllPages';
import * as SearchBarprops from 'src/components/Search/SearchBar/SearchBar.props';
import * as SearchBar from 'src/components/Search/SearchBar/SearchBar';
import * as SearchBannerprops from 'src/components/Search/SearchBanner/SearchBanner.props';
import * as SearchBanner from 'src/components/Search/SearchBanner/SearchBanner';
import * as SearchRecommendations from 'src/components/Search/Recommendations/SearchRecommendations';
import * as NewsDetailprops from 'src/components/Search/NewsDetail/NewsDetail.props';
import * as NewsDetail from 'src/components/Search/NewsDetail/NewsDetail';
import * as NewsAndPressListingprops from 'src/components/Search/NewsAndPressListing/NewsAndPressListing.props';
import * as NewsAndPressListing from 'src/components/Search/NewsAndPressListing/NewsAndPressListing';
import * as SearchListingprops from 'src/components/Search/Listing/SearchListing.props';
import * as SearchListing from 'src/components/Search/Listing/SearchListing';
import * as SearchFacetsModal from 'src/components/Search/Listing/SearchFacetsModal';
import * as JobListingprops from 'src/components/Search/JobListing/JobListing.props';
import * as JobListing from 'src/components/Search/JobListing/JobListing';
import * as ScrollIndicator from 'src/components/ScrollIndicator/ScrollIndicator';
import * as SEO from 'src/components/SEO/SEO';
import * as QuoteHighlightprops from 'src/components/QuoteHighlight/QuoteHighlight.props';
import * as QuoteHighlight from 'src/components/QuoteHighlight/QuoteHighlight';
import * as PromoCardprops from 'src/components/PromoCard/PromoCard.props';
import * as PromoCard from 'src/components/PromoCard/PromoCard';
import * as ProductTeaserGridprops from 'src/components/ProductTeaserGrid/ProductTeaserGrid.props';
import * as ProductTeaserGrid from 'src/components/ProductTeaserGrid/ProductTeaserGrid';
import * as ProductDetail from 'src/components/ProductDetail/ProductDetail';
import * as PersonContactprops from 'src/components/PersonContact/PersonContact.props';
import * as PersonContact from 'src/components/PersonContact/PersonContact';
import * as MfeLink from 'src/components/MfeLink/MfeLink';
import * as MarginBottomprops from 'src/components/MarginBottom/MarginBottom.props';
import * as MarginBottom from 'src/components/MarginBottom/MarginBottom';
import * as Logosprops from 'src/components/Logos/Logos.props';
import * as Logos from 'src/components/Logos/Logos';
import * as LinkListprops from 'src/components/LinkList/LinkList.props';
import * as LinkList from 'src/components/LinkList/LinkList';
import * as linkanimatedcomponentprops from 'src/components/LinkAnimated/link-animated-component.props';
import * as LinkAnimatedComponent from 'src/components/LinkAnimated/LinkAnimatedComponent';
import * as LatestNewsFeedprops from 'src/components/LatestNewsFeed/LatestNewsFeed.props';
import * as LatestNewsFeed from 'src/components/LatestNewsFeed/LatestNewsFeed';
import * as LanguageSelector from 'src/components/LanguageSelector/LanguageSelector';
import * as LandingPageProductsTopPicksprops from 'src/components/LandingPageProductsTopPicks/LandingPageProductsTopPicks.props';
import * as LandingPageProductsTopPicks from 'src/components/LandingPageProductsTopPicks/LandingPageProductsTopPicks';
import * as LandingPageProductsCollectionsprops from 'src/components/LandingPageProductsCollections/LandingPageProductsCollections.props';
import * as LandingPageProductsCollections from 'src/components/LandingPageProductsCollections/LandingPageProductsCollections';
import * as LandingPageHeroprops from 'src/components/LandingPageHero/LandingPageHero.props';
import * as LandingPageHeromock from 'src/components/LandingPageHero/LandingPageHero.mock';
import * as LandingPageHero from 'src/components/LandingPageHero/LandingPageHero';
import * as LandingPageFooterprops from 'src/components/LandingPageFooter/LandingPageFooter.props';
import * as LandingPageFooter from 'src/components/LandingPageFooter/LandingPageFooter';
import * as LandingPageColumnsprops from 'src/components/LandingPageColumns/LandingPageColumns.props';
import * as LandingPageColumns from 'src/components/LandingPageColumns/LandingPageColumns';
import * as LandingPageTableprops from 'src/components/LandingPageTable/LandingPageTable.props';
import * as LandingPageTable from 'src/components/LandingPageTable/LandingPageTable';
import * as JobDescriptionprops from 'src/components/Jobs/JobDescription/JobDescription.props';
import * as JobDescription from 'src/components/Jobs/JobDescription/JobDescription';
import * as JobBannerprops from 'src/components/Jobs/JobBanner/JobBanner.props';
import * as JobBanner from 'src/components/Jobs/JobBanner/JobBanner';
import * as IndustrySectorTeaserGridprops from 'src/components/IndustrySectorTeaserGrid/IndustrySectorTeaserGrid.props';
import * as IndustrySectorTeaserGrid from 'src/components/IndustrySectorTeaserGrid/IndustrySectorTeaserGrid';
import * as industrysectorteaserprops from 'src/components/IndustrySectorTeaser/industry-sector-teaser.props';
import * as IndustrySectorTeaser from 'src/components/IndustrySectorTeaser/IndustrySectorTeaser';
import * as IndividualProductsDisplayprops from 'src/components/IndividualProductsDisplay/IndividualProductsDisplay.props';
import * as IndividualProductsDisplay from 'src/components/IndividualProductsDisplay/IndividualProductsDisplay';
import * as IndividualProductTeaserGridprops from 'src/components/IndividualProductTeaserGrid/IndividualProductTeaserGrid.props';
import * as IndividualProductTeaserGrid from 'src/components/IndividualProductTeaserGrid/IndividualProductTeaserGrid';
import * as ImageGalleryprops from 'src/components/ImageGallery/ImageGallery.props';
import * as ImageGallery from 'src/components/ImageGallery/ImageGallery';
import * as ImageComponentprops from 'src/components/ImageComponent/ImageComponent.props';
import * as ImageComponent from 'src/components/ImageComponent/ImageComponent';
import * as IFrameComponentprops from 'src/components/IFrameComponent/IFrameComponent.props';
import * as IFrameComponent from 'src/components/IFrameComponent/IFrameComponent';
import * as horizontalteaserprops from 'src/components/HorizontalTeaser/horizontal-teaser.props';
import * as HorizontalTeaser from 'src/components/HorizontalTeaser/HorizontalTeaser';
import * as HealthcareHeader from 'src/components/HealthcareHeader/HealthcareHeader';
import * as HorizontalCardsprops from 'src/components/HorizontalCards/HorizontalCards.props';
import * as HorizontalCards from 'src/components/HorizontalCards/HorizontalCards';
import * as HeroBannerprops from 'src/components/HeroBanner/HeroBanner.props';
import * as HeroBanner from 'src/components/HeroBanner/HeroBanner';
import * as HeaderLogo from 'src/components/HeaderLogo/HeaderLogo';
import * as Headerprops from 'src/components/Header/Header.props';
import * as Header from 'src/components/Header/Header';
import * as index from 'src/components/FormSubmissionDialog/index';
import * as FormSubmissionDialog from 'src/components/FormSubmissionDialog/FormSubmissionDialog';
import * as Footerprops from 'src/components/Footer/Footer.props';
import * as Footer from 'src/components/Footer/Footer';
import * as GlobalFooterprops from 'src/components/Footer/GlobalFooter/GlobalFooter.props';
import * as GlobalFooter from 'src/components/Footer/GlobalFooter/GlobalFooter';
import * as FooterSocialAccountsprops from 'src/components/Footer/FooterSocialAccounts/FooterSocialAccounts.props';
import * as FooterSocialAccounts from 'src/components/Footer/FooterSocialAccounts/FooterSocialAccounts';
import * as FindYourProductprops from 'src/components/FindYourProduct/FindYourProduct.props';
import * as FindYourProduct from 'src/components/FindYourProduct/FindYourProduct';
import * as FindYourJobprops from 'src/components/FindYourJob/FindYourJob.props';
import * as FindYourJob from 'src/components/FindYourJob/FindYourJob';
import * as EntityReferenceItemprops from 'src/components/EntityReferenceItem/EntityReferenceItem.props';
import * as EntityReferenceItem from 'src/components/EntityReferenceItem/EntityReferenceItem';
import * as EntityReferenceprops from 'src/components/EntityReference/EntityReference.props';
import * as EntityReference from 'src/components/EntityReference/EntityReference';
import * as DownwardAnimationprops from 'src/components/DownwardAnimation/DownwardAnimation.props';
import * as DownwardAnimation from 'src/components/DownwardAnimation/DownwardAnimation';
import * as Downloadsprops from 'src/components/Downloads/Downloads.props';
import * as Downloads from 'src/components/Downloads/Downloads';
import * as DownloadComponentprops from 'src/components/DownloadComponent/DownloadComponent.props';
import * as DownloadComponent from 'src/components/DownloadComponent/DownloadComponent';
import * as DialogPopupLinkprops from 'src/components/DialogPopupLink/DialogPopupLink.props';
import * as DialogPopupLink from 'src/components/DialogPopupLink/DialogPopupLink';
import * as ContactFormBanner from 'src/components/ContactFormBanner/ContactFormBanner';
import * as Comparisonprops from 'src/components/Comparison/Comparison.props';
import * as Comparison from 'src/components/Comparison/Comparison';
import * as ClientEndorsementsprops from 'src/components/Client Endorsements/ClientEndorsements.props';
import * as ClientEndorsements from 'src/components/Client Endorsements/ClientEndorsements';
import * as CircularAnimationComponentprops from 'src/components/CircularAnimationComponent/CircularAnimationComponent.props';
import * as CircularAnimationComponent from 'src/components/CircularAnimationComponent/CircularAnimationComponent';
import * as certificatessliderprops from 'src/components/CertificatesSlider/certificates-slider.props';
import * as CertificatesSlider from 'src/components/CertificatesSlider/CertificatesSlider';
import * as CategoryListing from 'src/components/CategoryListing/CategoryListing';
import * as Categorylistingprops from 'src/components/CategoryListing/Category-listing.props';
import * as CardComponentprops from 'src/components/CardComponent/CardComponent.props';
import * as CardComponent from 'src/components/CardComponent/CardComponent';
import * as Carouselprops from 'src/components/Carousel/Carousel.props';
import * as Carousel from 'src/components/Carousel/Carousel';
import * as ButtonGroupComponentprops from 'src/components/ButtonGroupComponent/ButtonGroupComponent.props';
import * as ButtonGroupComponent from 'src/components/ButtonGroupComponent/ButtonGroupComponent';
import * as BreadcrumbNavigation from 'src/components/BreadcrumbNavigation/BreadcrumbNavigation';
import * as Breadcrumbtypes from 'src/components/Breadcrumb/Breadcrumb.types';
import * as Breadcrumbprops from 'src/components/Breadcrumb/Breadcrumb.props';
import * as Breadcrumb from 'src/components/Breadcrumb/Breadcrumb';
import * as BoxesComponentprops from 'src/components/BoxesComponent/BoxesComponent.props';
import * as BoxesComponent from 'src/components/BoxesComponent/BoxesComponent';
import * as ArticleHighlightprops from 'src/components/ArticleHighlight/ArticleHighlight.props';
import * as ArticleHighlight from 'src/components/ArticleHighlight/ArticleHighlight';
import * as AreasComponentprops from 'src/components/AreasComponent/AreasComponent.props';
import * as AreasComponent from 'src/components/AreasComponent/AreasComponent';
import * as AdvantageCardsprops from 'src/components/AdvantageCards/AdvantageCards.props';
import * as AdvantageCards from 'src/components/AdvantageCards/AdvantageCards';
import * as accordionItemprops from 'src/components/Accordion Item/accordionItem.props';
import * as AccordionItem from 'src/components/Accordion Item/AccordionItem';
import * as accordionprops from 'src/components/Accordion/accordion.props';
import * as Accordion from 'src/components/Accordion/Accordion';

export const componentMap = new Map<string, NextjsContentSdkComponent>(([
  ['BYOCWrapper', BYOCWrapper],
  ['FEaaSWrapper', FEaaSWrapper],
  ['Form', Form],
  ['FormValidation', { ...FormValidation }],
  ['EditingScriptsWrapper', { ...EditingScriptsWrapper, componentType: 'client' }],
  ['dialog', { ...dialog, componentType: 'client' }],
  ['SitecoreRenderRoot', { ...SitecoreRenderRoot, componentType: 'client' }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['nextImageSrc', { ...nextImageSrcdev }],
  ['image', { ...imageprops }],
  ['image-optimization', { ...imageoptimizationcontext }],
  ['ImageWrapper', { ...ImageWrapperdev }],
  ['ImageBlock', { ...ImageBlock }],
  ['WysiwygTable', { ...WysiwygTableprops, ...WysiwygTable, componentType: 'client' }],
  ['wysiwyg-block', { ...wysiwygblockprops }],
  ['WysiwygBlock', { ...WysiwygBlock, componentType: 'client' }],
  ['WorkwearCollectionsTeaserGrid', { ...WorkwearCollectionsTeaserGridprops, ...WorkwearCollectionsTeaserGrid, componentType: 'client' }],
  ['VideoPlayer', { ...VideoPlayerprops, ...VideoPlayer, componentType: 'client' }],
  ['TopHeader', { ...TopHeader }],
  ['TextHighlight', { ...TextHighlightprops, ...TextHighlight, componentType: 'client' }],
  ['Testimonial', { ...Testimonialprops, ...Testimonial, componentType: 'client' }],
  ['StickyContactBar', { ...StickyContactBarprops, ...StickyContactBar, componentType: 'client' }],
  ['StickyBackToTop', { ...StickyBackToTopprops, ...StickyBackToTop, componentType: 'client' }],
  ['SpotlightStoriesMobile', { ...SpotlightStoriesMobile, componentType: 'client' }],
  ['SpotlightStories', { ...SpotlightStoriesprops, ...SpotlightStories, componentType: 'client' }],
  ['SliderComponent', { ...SliderComponentprops, ...SliderComponent, componentType: 'client' }],
  ['SliderCarouselComponent', { ...SliderCarouselComponentprops, ...SliderCarouselComponent, componentType: 'client' }],
  ['SitecoreForm', { ...SitecoreForm }],
  ['SimpleHeading', { ...SimpleHeadingprops, ...SimpleHeading }],
  ['search_filter_panel', { ...search_filter_panelprops }],
  ['searchFilterPanelData', { ...searchFilterPanelData }],
  ['SearchFilterPanel', { ...SearchFilterPanel }],
  ['SearchContainer', { ...SearchContainer }],
  ['SearchBarSearchPage', { ...SearchBarSearchPage, componentType: 'client' }],
  ['SearchBarAllPages', { ...SearchBarAllPages, componentType: 'client' }],
  ['SearchBar', { ...SearchBarprops, ...SearchBar, componentType: 'client' }],
  ['SearchBanner', { ...SearchBannerprops, ...SearchBanner }],
  ['SearchRecommendations', { ...SearchRecommendations }],
  ['NewsDetail', { ...NewsDetailprops, ...NewsDetail, componentType: 'client' }],
  ['NewsAndPressListing', { ...NewsAndPressListingprops, ...NewsAndPressListing, componentType: 'client' }],
  ['SearchListing', { ...SearchListingprops, ...SearchListing, componentType: 'client' }],
  ['SearchFacetsModal', { ...SearchFacetsModal, componentType: 'client' }],
  ['JobListing', { ...JobListingprops, ...JobListing, componentType: 'client' }],
  ['ScrollIndicator', { ...ScrollIndicator, componentType: 'client' }],
  ['SEO', { ...SEO }],
  ['QuoteHighlight', { ...QuoteHighlightprops, ...QuoteHighlight, componentType: 'client' }],
  ['PromoCard', { ...PromoCardprops, ...PromoCard, componentType: 'client' }],
  ['ProductTeaserGrid', { ...ProductTeaserGridprops, ...ProductTeaserGrid, componentType: 'client' }],
  ['ProductDetail', { ...ProductDetail, componentType: 'client' }],
  ['PersonContact', { ...PersonContactprops, ...PersonContact }],
  ['MfeLink', { ...MfeLink, componentType: 'client' }],
  ['MarginBottom', { ...MarginBottomprops, ...MarginBottom, componentType: 'client' }],
  ['Logos', { ...Logosprops, ...Logos, componentType: 'client' }],
  ['Carousel', { ...Carouselprops, ...Carousel, componentType: 'client' }],
  ['LinkList', { ...LinkListprops, ...LinkList }],
  ['link-animated-component', { ...linkanimatedcomponentprops }],
  ['LinkAnimatedComponent', { ...LinkAnimatedComponent, componentType: 'client' }],
  ['LatestNewsFeed', { ...LatestNewsFeedprops, ...LatestNewsFeed, componentType: 'client' }],
  ['LanguageSelector', { ...LanguageSelector, componentType: 'client' }],
  ['LandingPageProductsTopPicks', { ...LandingPageProductsTopPicksprops, ...LandingPageProductsTopPicks, componentType: 'client' }],
  ['LandingPageProductsCollections', { ...LandingPageProductsCollectionsprops, ...LandingPageProductsCollections, componentType: 'client' }],
  ['LandingPageHero', { ...LandingPageHeroprops, ...LandingPageHeromock, ...LandingPageHero, componentType: 'client' }],
  ['LandingPageFooter', { ...LandingPageFooterprops, ...LandingPageFooter, componentType: 'client' }],
  ['LandingPageColumns', { ...LandingPageColumnsprops, ...LandingPageColumns, componentType: 'client' }],
  ['LandingPageTable', { ...LandingPageTableprops, ...LandingPageTable, componentType: 'client' }],
  ['JobDescription', { ...JobDescriptionprops, ...JobDescription, componentType: 'client' }],
  ['JobBanner', { ...JobBannerprops, ...JobBanner, componentType: 'client' }],
  ['IndustrySectorTeaserGrid', { ...IndustrySectorTeaserGridprops, ...IndustrySectorTeaserGrid }],
  ['industry-sector-teaser', { ...industrysectorteaserprops }],
  ['IndustrySectorTeaser', { ...IndustrySectorTeaser }],
  ['IndividualProductsDisplay', { ...IndividualProductsDisplayprops, ...IndividualProductsDisplay, componentType: 'client' }],
  ['IndividualProductTeaserGrid', { ...IndividualProductTeaserGridprops, ...IndividualProductTeaserGrid, componentType: 'client' }],
  ['ImageGallery', { ...ImageGalleryprops, ...ImageGallery, componentType: 'client' }],
  ['ImageComponent', { ...ImageComponentprops, ...ImageComponent, componentType: 'client' }],
  ['IFrameComponent', { ...IFrameComponentprops, ...IFrameComponent, componentType: 'client' }],
  ['horizontal-teaser', { ...horizontalteaserprops }],
  ['HorizontalTeaser', { ...HorizontalTeaser, componentType: 'client' }],
  ['HealthcareHeader', { ...HealthcareHeader }],
  ['HorizontalCards', { ...HorizontalCardsprops, ...HorizontalCards, componentType: 'client' }],
  ['HeroBanner', { ...HeroBannerprops, ...HeroBanner, componentType: 'client' }],
  ['HeaderLogo', { ...HeaderLogo }],
  ['Header', { ...Headerprops, ...Header, componentType: 'client' }],
  ['index', { ...index }],
  ['FormSubmissionDialog', { ...FormSubmissionDialog, componentType: 'client' }],
  ['Footer', { ...Footerprops, ...Footer, componentType: 'client' }],
  ['GlobalFooter', { ...GlobalFooterprops, ...GlobalFooter, componentType: 'client' }],
  ['FooterSocialAccounts', { ...FooterSocialAccountsprops, ...FooterSocialAccounts, componentType: 'client' }],
  ['FindYourProduct', { ...FindYourProductprops, ...FindYourProduct, componentType: 'client' }],
  ['FindYourJob', { ...FindYourJobprops, ...FindYourJob, componentType: 'client' }],
  ['EntityReferenceItem', { ...EntityReferenceItemprops, ...EntityReferenceItem }],
  ['EntityReference', { ...EntityReferenceprops, ...EntityReference, componentType: 'client' }],
  ['DownwardAnimation', { ...DownwardAnimationprops, ...DownwardAnimation, componentType: 'client' }],
  ['Downloads', { ...Downloadsprops, ...Downloads }],
  ['DownloadComponent', { ...DownloadComponentprops, ...DownloadComponent }],
  ['DialogPopupLink', { ...DialogPopupLinkprops, ...DialogPopupLink, componentType: 'client' }],
  ['ContactFormBanner', { ...ContactFormBanner, componentType: 'client' }],
  ['Comparison', { ...Comparisonprops, ...Comparison, componentType: 'client' }],
  ['ClientEndorsements', { ...ClientEndorsementsprops, ...ClientEndorsements }],
  ['CircularAnimationComponent', { ...CircularAnimationComponentprops, ...CircularAnimationComponent, componentType: 'client' }],
  ['certificates-slider', { ...certificatessliderprops }],
  ['CertificatesSlider', { ...CertificatesSlider }],
  ['CategoryListing', { ...CategoryListing, componentType: 'client' }],
  ['Category-listing', { ...Categorylistingprops }],
  ['CardComponent', { ...CardComponentprops, ...CardComponent, componentType: 'client' }],
  ['ButtonGroupComponent', { ...ButtonGroupComponentprops, ...ButtonGroupComponent }],
  ['BreadcrumbNavigation', { ...BreadcrumbNavigation }],
  ['Breadcrumb', { ...Breadcrumbtypes, ...Breadcrumbprops, ...Breadcrumb }],
  ['BoxesComponent', { ...BoxesComponentprops, ...BoxesComponent, componentType: 'client' }],
  ['ArticleHighlight', { ...ArticleHighlightprops, ...ArticleHighlight, componentType: 'client' }],
  ['AreasComponent', { ...AreasComponentprops, ...AreasComponent, componentType: 'client' }],
  ['AdvantageCards', { ...AdvantageCardsprops, ...AdvantageCards, componentType: 'client' }],
  ['accordionItem', { ...accordionItemprops }],
  ['AccordionItem', { ...AccordionItem, componentType: 'client' }],
  ['accordion', { ...accordionprops }],
  ['Accordion', { ...Accordion, componentType: 'client' }],
]) as [string, NextjsContentSdkComponent][]);

export default componentMap;
