import { Allow } from 'class-validator';

export class BaseDto {
  /**
   *  The user created resource.
   */
  @Allow()
  createdBy: string | null;
}
