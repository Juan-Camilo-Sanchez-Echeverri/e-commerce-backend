import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { BadRequestException } from '@nestjs/common';

dayjs.extend(utc);
dayjs.extend(timezone);

export function setDateWithEndTime(dateConvert: Date): Date {
  const date = new Date(dateConvert);
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

export function validateDate(date: Date): void {
  if (date.getTime() < new Date().getTime()) {
    throw new BadRequestException(
      'La fecha no puede ser menor a la fecha actual',
    );
  }
}

export function checkExpiration(expiresIn: Date): boolean {
  return dayjs().isAfter(dayjs(expiresIn));
}
