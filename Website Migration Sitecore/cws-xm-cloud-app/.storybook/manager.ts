import { addons } from '@storybook/manager-api';

const matchesPrefix = (itemTitle: string | undefined, pattern: RegExp): boolean => {
  if (!itemTitle) {
    return false;
  }
  return pattern.test(itemTitle);
};

addons.setConfig({
  sidebar: {
    showRoots: true,
  },
});
