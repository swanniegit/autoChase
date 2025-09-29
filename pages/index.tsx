import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/autochase',
      permanent: false,
    },
  };
};

export default function HomeRedirect() {
  return null;
}
