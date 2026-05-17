import React from 'react';

type Src = string | { src?: string } | undefined;

const resolveSrc = (src: Src): string => {
  if (!src) return '';
  if (typeof src === 'string') return src;
  return src.src ?? '';
};

const NextImage = ({ src, alt, ...rest }: { src: Src; alt?: string } & Record<string, any>) => {
  return <img src={resolveSrc(src)} alt={alt ?? ''} {...rest} />;
};

export default NextImage;

export const getImageProps = ({ src, ...rest }: { src: Src } & Record<string, any>) => ({
  props: {
    ...rest,
    src: resolveSrc(src),
  },
});
