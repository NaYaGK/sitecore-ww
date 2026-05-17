import {
    TextField,
  } from '@sitecore-content-sdk/nextjs';
  
  import { ComponentProps } from '@/lib/component-props';
  
 
  export interface SearchBannerFields {
    Heading?: TextField;
    SearchQuery?: TextField;
    ResultCountText?: TextField;
    FilterButtonText?: TextField;
  }
  
  
  export interface SearchBannerProps extends Omit<ComponentProps, 'params'> {
    fields: SearchBannerFields;
    params?: {
      Styles?: string;
      RenderingIdentifier?: string;
      DynamicPlaceholderId?:string
    };
  }
  