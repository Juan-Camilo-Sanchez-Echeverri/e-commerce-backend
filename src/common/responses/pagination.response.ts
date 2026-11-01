import { ApiHideProperty } from '@nestjs/swagger';
import { PaginateResult } from '../database';

export class PaginationResponse<T> implements PaginateResult<T> {
  /**
   * Represents a paginated response for a collection of documents.
   */
  [customLabel: string]: number | boolean | T[] | null | undefined;

  @ApiHideProperty()
  docs: T[];

  /**
   * The total number of documents in the collection.
   */
  totalDocs: number;

  /**
   * The number of documents per page.
   */
  limit: number = 10;

  /**
   * Indicates if there is a previous page.
   */
  hasPrevPage: boolean;

  /**
   * Indicates if there is a next page.
   */
  hasNextPage: boolean;

  /**
   * The current page number.
   */
  page?: number = 1;

  /**
   * The total number of pages.
   */
  totalPages: number;

  @ApiHideProperty()
  offset: number;

  /**
   * The previous page number, if it exists.
   *
   */
  prevPage?: number | null;

  /**
   * The next page number, if it exists.
   */
  nextPage?: number | null;

  /**
   * The paging counter for the current page.
   */
  pagingCounter: number;
}
