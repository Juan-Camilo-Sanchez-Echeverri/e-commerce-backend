interface GeneralReport {
  totalAdmins: number;
  totalProducts: number;
}

interface ProductsReport {
  page: number;
  totalPages: number;
  totalItems: number;
  items: any[];
}

interface CategoryReport {
  categoryName: string;
  totalProducts: number;
}

interface OrdersReport {
  [dayOfWeek: string]: number;
}

interface RegisteredUsersByMonth {
  [month: string]: number;
}

interface DayOfWeek {
  [mostItemsDay: string]: string;
}

interface ItemsCountByProduct {
  productName: string;
  totalSales: number;
}

interface UsersZone {
  zonaName: string;
  totalUsers: number;
}
