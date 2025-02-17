export interface VatValidationResponse {
  isValid: boolean;
  requestDate: string;
  userError: string;
  name: string;
  address: string;
  requestIdentifier: string;
  originalVatNumber: string;
  vatNumber: string;
  viesApproximate: {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    companyType: string;
    matchName: number;
    matchStreet: number;
    matchPostalCode: number;
    matchCity: number;
    matchCompanyType: number;
  };
  rulesApplied: string[];
}

export const fetchCompanyForVatNumber = async (vat: string) => {
  const vatNumber = vat.replace(/[^0-9]/g, '');
  const countryCode = vat.slice(0, 2);

  const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data: VatValidationResponse = await response.json();

  return data;
};
