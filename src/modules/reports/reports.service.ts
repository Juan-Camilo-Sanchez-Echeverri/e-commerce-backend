import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SalesStatus, Role } from '../../common/enums';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';

import { PaginationDto } from '../../common/dto';
import { StoreCustomerService } from '../customers/store-customer.service';
import { ProductCategoriesService } from '../product-categories/product-categories.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,

    private readonly storeCustomerService: StoreCustomerService,
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  async generalReport(): Promise<GeneralReport> {
    const [totalAdmins, totalAgents, totalProducts] = await Promise.all([
      this.usersService.findByQuery({ roles: Role.Admin }),
      this.usersService.findByQuery({ roles: Role.Agent }),
      this.productsService.findAll(),
    ]);

    return {
      totalAdmins: totalAdmins.length,
      totalAgents: totalAgents.length,
      totalProducts: totalProducts.length,
    };
  }

  // async getOrdersOrQuotationsReport(storeId: string): Promise<OrdersReport> {
  async getOrdersOrQuotationsReport() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // const items = await this.getItemsByStoreMode(store.mode);

    // const itemsForYearAndPastMonths = this.filterItemsByYearAndMonth(
    //   items,
    //   currentYear,
    //   currentMonth,
    // );

    // return this.calculateItemsCountByMonth(itemsForYearAndPastMonths);
  }

  async getProductsReport(
    paginationDto: PaginationDto,
    // ): Promise<ProductsReport> {
  ) {
    // const items = await this.getItemsByStoreMode(store.mode);
    // const { dateStart, dateEnd } = paginationDto;
    // this.validateDateRange(dateStart, dateEnd);
    // const itemsInDateRange = this.filterItemsByDateRange(
    //   items,
    //   dateStart,
    //   dateEnd,
    // );
    // const productSalesCount =
    //   await this.calculateItemsCountByProduct(itemsInDateRange);
    // const paginatedResults = paginateResults(productSalesCount, paginationDto);
    // return paginatedResults;
  }

  async getRegisteredUsersByMonth() {
    // ): Promise<RegisteredUsersByMonth> {
    // const store = await this.storesService.findOne(storeId);
    // const storeCustomers =
    //   await this.storeCustomerService.findCustomersByStore(storeId);
    // const currentDate = new Date();
    // const currentYear = currentDate.getFullYear();
    // const currentMonth = currentDate.getMonth();
    // const items = await this.getItemsByStoreMode(store.mode);
    // const itemsForYearAndPastMonths = items.filter(
    //   (item): boolean =>
    //     item.createdAt.getFullYear() === currentYear &&
    //     item.createdAt.getMonth() <= currentMonth &&
    //     item.processStatus === SalesStatus.APPROVED &&
    //     this.isCustomerInStore(item.client, storeCustomers),
    // );
    // return this.calculateUniqueUsersCountByMonth(itemsForYearAndPastMonths);
  }

  async getProductsByCategoryReport(): Promise<CategoryReport[]> {
    const products = await this.productsService.findAll();

    const productCategories = await this.productCategoriesService.findAll();

    const productsByCategory = {};

    productCategories.forEach(
      (category): number => (productsByCategory[category.name] = 0),
    );

    products.forEach((product): void => {
      product?.categories?.forEach((categoryId): void => {
        const category = productCategories.find(
          (category): boolean => String(category._id) === String(categoryId),
        );
        productsByCategory[category!.name]++;
      });
    });
    const resultArray = Object.keys(productsByCategory).map(
      (categoryName): CategoryReport => ({
        categoryName,
        totalProducts: productsByCategory[categoryName],
      }),
    );
    resultArray.sort((a, b): number => b.totalProducts - a.totalProducts);
    return resultArray;
  }

  // async getDayOfWeekWithMostItems(storeId: string): Promise<DayOfWeek> {
  async getDayOfWeekWithMostItems() {
    // const store = await this.storesService.findOne(storeId);
    // const items = await this.getItemsByStoreMode(store.mode);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // const itemsForYearAndMonth = this.filterItemsByYearAndMonth(
    //   items,
    //   currentYear,
    //   currentMonth,
    // );

    // const itemsCountByDayOfWeek =
    //   this.calculateItemsCountByDayOfWeek(itemsForYearAndMonth);

    // const mostItemsDay = this.getMostItemsDayOfWeek(itemsCountByDayOfWeek);
    // return { mostItemsDay };
  }

  async getUsersZone(
    paginationDto: PaginationDto,
    // ): Promise<PaginationDto> {
  ) {
    // const storeCustomers =
    //   await this.storeCustomerService.findCustomersByStore(storeId);
    // const { dateStart, dateEnd } = paginationDto;
    // this.validateDateRange(dateStart, dateEnd);
    // const usersZone = {};
    // for (const customer of storeCustomers) {
    //   const { city } = await this.storeCustomerService.findById(
    //     String(customer._id),
    //   );
    //   if (!usersZone[city]) usersZone[city] = 0;
    //   usersZone[city]++;
    // }
    // const zoneArra = Object.keys(usersZone).map(
    //   (city): UsersZone => ({ zonaName: city, totalUsers: usersZone[city] }),
    // );
    // zoneArra.sort((a, b): number => b.totalUsers - a.totalUsers);
    // const paginatedResults = paginateResults(zoneArra, paginationDto);
    // return paginatedResults;
  }

  private calculateItemsCountByDayOfWeek(items: any[]): OrdersReport {
    const itemsCountByDayOfWeek = {};
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    dayNames.forEach((day): number => (itemsCountByDayOfWeek[day] = 0));

    items.forEach(({ createdAt }): void => {
      const dayOfWeek = createdAt.getDay();
      itemsCountByDayOfWeek[dayNames[dayOfWeek]]++;
    });
    return itemsCountByDayOfWeek;
  }

  private getMostItemsDayOfWeek(itemsCountByDayOfWeek: OrdersReport): string {
    let mostItemsDay = '';
    let maxItemsCount = 0;

    for (const dayOfWeek in itemsCountByDayOfWeek) {
      if (itemsCountByDayOfWeek[dayOfWeek] > maxItemsCount) {
        maxItemsCount = itemsCountByDayOfWeek[dayOfWeek];
        mostItemsDay = dayOfWeek;
      }
    }

    return mostItemsDay;
  }

  private filterItemsByYearAndMonth(
    items: any[],
    year: number,
    month: number,
  ): any[] {
    return items.filter(
      ({ createdAt, processStatus }): boolean =>
        createdAt.getFullYear() === year &&
        createdAt.getMonth() <= month &&
        processStatus === SalesStatus.APPROVED,
    );
  }

  private validateDateRange(dateStart: Date, dateEnd: Date): void {
    const maxDateDifferenceInMonths = 3;
    if (!dateStart || !dateEnd) {
      dateStart = new Date();
      dateEnd = new Date();
      dateEnd.setMonth(dateEnd.getMonth() - maxDateDifferenceInMonths);
    }
    const dateDifferenceInMonths = this.getMonthsDifference(dateStart, dateEnd);

    if (dateDifferenceInMonths > maxDateDifferenceInMonths)
      throw new BadRequestException(
        'La diferencia entre las fechas no puede ser mayor de 3 meses.',
      );
  }

  private filterItemsByDateRange(
    items: any[],
    dateStart: Date,
    dateEnd: Date,
  ): any[] {
    return items.filter(
      (item) =>
        item.createdAt >= dateStart &&
        item.createdAt <= dateEnd &&
        item.processStatus === SalesStatus.APPROVED,
    );
  }

  private isCustomerInStore(clientId: string, storeCustomers: any[]): boolean {
    return storeCustomers.some(
      (customer): boolean => String(clientId) === String(customer._id),
    );
  }

  private async calculateUniqueUsersCountByMonth(
    items: any[],
  ): Promise<RegisteredUsersByMonth> {
    const uniqueUsersCountByMonth = {};
    const monthNames = this.getMonthNames();

    monthNames.forEach((month): number => (uniqueUsersCountByMonth[month] = 0));

    const uniqueUserIdsByMonth = {};

    items.forEach((item) => {
      const month = item.createdAt.getMonth();
      const monthName = this.getMonthName(month);

      if (!uniqueUserIdsByMonth[monthName])
        uniqueUserIdsByMonth[monthName] = new Set();

      const userId = String(item.client);

      if (!uniqueUserIdsByMonth[monthName].has(userId)) {
        uniqueUserIdsByMonth[monthName].add(userId);
        uniqueUsersCountByMonth[monthName]++;
      }
    });

    return uniqueUsersCountByMonth;
  }

  private getMonthsDifference(date1: Date, date2: Date): number {
    return (
      (date2.getFullYear() - date1.getFullYear()) * 12 +
      (date2.getMonth() - date1.getMonth())
    );
  }

  private async calculateItemsCountByProduct(
    items: any[],
  ): Promise<ItemsCountByProduct[]> {
    const productSalesCount = {};

    for (const item of items) {
      if (item.products && Array.isArray(item.products)) {
        for (const product of item.products) {
          const productId = product.product.toString();
          const { name } = await this.productsService.findOne(productId);
          const productName = name;
          productSalesCount[productName] =
            (productSalesCount[productName] || 0) + 1;
        }
      }
    }

    const resultArray = Object.keys(productSalesCount).map(
      (productName): ItemsCountByProduct => ({
        productName,
        totalSales: productSalesCount[productName],
      }),
    );

    resultArray.sort((a, b): number => b.totalSales - a.totalSales);
    return resultArray;
  }

  private calculateItemsCountByMonth(items: any[]) {
    const itemsCountByMonth = {};
    const monthNames = this.getMonthNames();

    monthNames.forEach((month) => (itemsCountByMonth[month] = 0));

    items.forEach((item) => {
      const month = item.createdAt.getMonth();
      itemsCountByMonth[this.getMonthName(month)]++;
    });
    return itemsCountByMonth;
  }

  private getMonthNames(): string[] {
    return [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
  }

  private getMonthName(month: number): string {
    const monthNames = this.getMonthNames();
    return monthNames[month];
  }
}
