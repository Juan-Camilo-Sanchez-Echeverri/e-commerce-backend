export interface PaymentGateway {
  payEpayco(data: any): boolean | Promise<boolean>;
  payPayU(data: any): boolean | Promise<boolean>;
}
