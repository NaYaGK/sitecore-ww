import { EditingScripts } from '@sitecore-content-sdk/nextjs';
// The BYOC bundle imports external (BYOC) components into the app and makes sure they are ready to be used
import BYOC from 'byoc';
// Using relative imports to avoid tsconfig path mapping confusion
import FEAASScripts from './components/content-sdk/FEAASScripts';
import CdpPageView from './components/content-sdk/CdpPageView';
import { JSX } from 'react';

const Scripts = (): JSX.Element => {
  return (
    <>
      <BYOC />
      <FEAASScripts />
      <CdpPageView />
      <EditingScripts />
    </>
  );
};

export default Scripts;
