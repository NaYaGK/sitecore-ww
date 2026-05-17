import { GetStaticPaths } from 'next';
import JobPage, { getStaticProps } from '../../jobs/[...path]';

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export { getStaticProps };
export default JobPage;
