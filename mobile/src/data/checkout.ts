export type ShippingInfo = {
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
};

export type PaymentInfo = {
  cardHolder: string;
  cardNumber: string;
  expiration: string;
  securityCode: string;
};

export const validShipping: ShippingInfo = {
  fullName: 'Paolo Villanueva',
  address: 'Av. Javier Prado 1234',
  city: 'Lima',
  zipCode: '15001',
  country: 'Peru',
};

export const validPayment: PaymentInfo = {
  cardHolder: 'Paolo Villanueva',
  cardNumber: '4111111111111111',
  expiration: '03/27',
  securityCode: '123',
};
