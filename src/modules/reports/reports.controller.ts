import { Controller, Get, Query } from '@nestjs/common';

import { ReportsService } from './reports.service';

import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';

import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(Role.Supervisor)
  @Get('general')
  generalReport(): Promise<GeneralReport> {
    return this.reportsService.generalReport();
  }

  @Roles(Role.Supervisor, Role.Admin)
  @Get('salesYear')
  // : Promise<OrdersReport> {
  async getOrders() {
    return this.reportsService.getOrdersOrQuotationsReport();
  }

  @Roles(Role.Supervisor, Role.Admin)
  @Get('customers')
  async getCustomers() {
    // ): Promise<RegisteredUsersByMonth> {
    return await this.reportsService.getRegisteredUsersByMonth();
  }

  @Roles(Role.Supervisor, Role.Admin)
  @Get('products-categories')
  async getProductsCategories(): Promise<CategoryReport[]> {
    return await this.reportsService.getProductsByCategoryReport();
  }

  @Roles(Role.Supervisor, Role.Admin)
  @Get('most-items-day-of-week/')
  async getMostItemsDayOfWeek() {
    // ): Promise<DayOfWeek> {
    return await this.reportsService.getDayOfWeekWithMostItems();
  }

  @Roles(Role.Supervisor, Role.Admin)
  @Get('products')
  async getProducts(
    @Query() paginationDto: PaginationDto,
    // ): Promise<ProductsReport> {
  ) {
    return await this.reportsService.getProductsReport(paginationDto);
  }

  @Roles(Role.Supervisor, Role.Admin)
  @Get('usersZone/')
  async getUsersZone(@Query() paginationDto: PaginationDto) {
    return await this.reportsService.getUsersZone(paginationDto);
  }
}
