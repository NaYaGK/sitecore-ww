import type { SearchFilterPanelProps } from './search_filter_panel.props';

// Helper to create text field JSON structure
const textFieldJson = (value: string) => ({ jsonValue: { value } });

// Content type options
export const contentTypeOptions = [
  {
    label: textFieldJson('Inhaltsseite'),
    value: textFieldJson('inhaltsseite'),
    count: { jsonValue: { value: 245 } },
  },
  {
    label: textFieldJson('News'),
    value: textFieldJson('news'),
    count: { jsonValue: { value: 89 } },
  },
  {
    label: textFieldJson('Produkte'),
    value: textFieldJson('produkte'),
    count: { jsonValue: { value: 156 } },
  },
];

// Tags options
export const tagsOptions = [
  {
    label: textFieldJson('Blog'),
    value: textFieldJson('tags_workwear:Blog'),
    count: { jsonValue: { value: 42 } },
  },
  {
    label: textFieldJson('Certifications'),
    value: textFieldJson('tags_workwear:Certifications'),
    count: { jsonValue: { value: 28 } },
  },
  {
    label: textFieldJson('Digital'),
    value: textFieldJson('tags_workwear:Digital'),
    count: { jsonValue: { value: 35 } },
  },
  {
    label: textFieldJson('Diversity'),
    value: textFieldJson('tags_workwear:Diversity'),
    count: { jsonValue: { value: 19 } },
  },
  {
    label: textFieldJson('Events'),
    value: textFieldJson('tags_workwear:Events'),
    count: { jsonValue: { value: 67 } },
  },
  {
    label: textFieldJson('General'),
    value: textFieldJson('tags_workwear:General'),
    count: { jsonValue: { value: 124 } },
  },
  {
    label: textFieldJson('Innovation'),
    value: textFieldJson('tags_workwear:Innovation'),
    count: { jsonValue: { value: 53 } },
  },
  {
    label: textFieldJson('Know-How'),
    value: textFieldJson('tags_workwear:Know-How'),
    count: { jsonValue: { value: 78 } },
  },
  {
    label: textFieldJson('Locations'),
    value: textFieldJson('tags_workwear:Locations'),
    count: { jsonValue: { value: 45 } },
  },
  {
    label: textFieldJson('Partnerships'),
    value: textFieldJson('tags_workwear:Partnerships'),
    count: { jsonValue: { value: 31 } },
  },
  {
    label: textFieldJson('People'),
    value: textFieldJson('tags_workwear:People'),
    count: { jsonValue: { value: 56 } },
  },
  {
    label: textFieldJson('Products'),
    value: textFieldJson('tags_workwear:Products'),
    count: { jsonValue: { value: 142 } },
  },
  {
    label: textFieldJson('Promotions'),
    value: textFieldJson('tags_workwear:Promotions'),
    count: { jsonValue: { value: 38 } },
  },
  {
    label: textFieldJson('Sale'),
    value: textFieldJson('tags_workwear:Sale'),
    count: { jsonValue: { value: 22 } },
  },
  {
    label: textFieldJson('Services'),
    value: textFieldJson('tags_workwear:Services'),
    count: { jsonValue: { value: 94 } },
  },
  {
    label: textFieldJson('Solutions'),
    value: textFieldJson('tags_workwear:Solutions'),
    count: { jsonValue: { value: 87 } },
  },
  {
    label: textFieldJson('Sustainability'),
    value: textFieldJson('tags_workwear:Sustainability'),
    count: { jsonValue: { value: 63 } },
  },
  {
    label: textFieldJson('Technology'),
    value: textFieldJson('tags_workwear:Technology'),
    count: { jsonValue: { value: 49 } },
  },
  {
    label: textFieldJson('Tips-Tricks'),
    value: textFieldJson('tags_workwear:Tips-Tricks'),
    count: { jsonValue: { value: 71 } },
  },
];

export const createSearchFilterPanelProps = (
  overrides: Partial<SearchFilterPanelProps> = {}
): SearchFilterPanelProps => ({
  rendering: {
    uid: 'search-filter-panel-1',
    componentName: 'SearchFilterPanel',
    dataSource: '',
  },
  params: {},
  fields: {
    data: {
      datasource: {
        filterHeading: textFieldJson('Filter'),
        resetButtonText: textFieldJson('Reset'),
        closeButtonText: textFieldJson('Close'),
        contentTypeGroup: {
          heading: textFieldJson('Content Type'),
          options: contentTypeOptions,
        },
        tagsGroup: {
          heading: textFieldJson('Tags'),
          options: tagsOptions,
        },
      },
    },
  },
  isOpen: false,
  ...overrides,
});
