import { CompanyEdit } from '@/components/onboarding/CompanyEdit';

export const metadata = {
  title: 'Dashboard : Profile'
};

export default async function Page() {
  return <>
    <CompanyEdit />
  </>;
}
