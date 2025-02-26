import {
  FactoryRegistry,
  Constructor,
  Factory,
} from '../../../common/interfaces';
import { GatewayName } from '../enums/gateway.enums';
import { PaymentGateway } from '../interfaces/payment-gateway.interface';

export class PaymentGatewayFactory
  implements
    Factory<PaymentGateway, GatewayName>,
    FactoryRegistry<PaymentGateway, GatewayName>
{
  private readonly registry = new Map<
    GatewayName,
    Constructor<PaymentGateway>
  >();

  register(name: GatewayName, constructor: Constructor<PaymentGateway>) {
    this.registry.set(name, constructor);
  }

  getInstance(name: GatewayName): PaymentGateway {
    const GatewayConstructor = this.registry.get(name)!;
    return new GatewayConstructor();
  }
}

export const paymentGatewayFactory = new PaymentGatewayFactory();
