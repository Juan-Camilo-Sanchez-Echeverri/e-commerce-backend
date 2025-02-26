import { Constructor } from './constructor.interface';

export interface Factory<T, U> {
  getInstance(name: U): T;
}

export interface FactoryRegistry<T, U> {
  register(name: U, constructor: Constructor<T>);
}
