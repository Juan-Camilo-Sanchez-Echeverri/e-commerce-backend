import {
  HydratedDocument,
  Model,
  PopulateOptions,
  QueryFilter,
  SortOrder,
} from 'mongoose';

export interface PaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page?: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  offset: number;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface PaginateQueryOptions {
  limit?: number;
  page?: number;
  sort?: string | Record<string, SortOrder> | [string, SortOrder][];
  populate?: PopulateOptions | PopulateOptions[];
  readPreference?: string;
}

const DEFAULT_LIMIT = 10;
const PAGINATION_WINDOW = 5;

/**
 * Equivalente estructural al default `{}` de Mongoose para los genéricos
 * `TQueryHelpers`, `TInstanceMethods` y `TVirtuals` de `Model`.
 */
type NoHelpers = Record<never, never>;

export async function paginateQuery<
  TRaw,
  TDoc extends HydratedDocument<TRaw> = HydratedDocument<TRaw>,
>(
  model: Model<TRaw, NoHelpers, NoHelpers, NoHelpers, TDoc>,
  filter: QueryFilter<TRaw> = {},
  options: PaginateQueryOptions = {},
): Promise<PaginateResult<TDoc>> {
  const page = Math.max(1, Math.trunc(options.page ?? 1) || 1);
  const limit = Math.max(
    1,
    Math.trunc(options.limit ?? DEFAULT_LIMIT) || DEFAULT_LIMIT,
  );
  const offset = (page - 1) * limit;

  const query = model
    .find(filter, undefined, { readPreference: options.readPreference })
    .skip(offset)
    .limit(limit);

  if (options.sort) {
    query.sort(options.sort);
  }

  if (options.populate) {
    query.populate(options.populate);
  }

  const [docs, totalDocs] = await Promise.all([
    query.exec(),
    model.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.ceil(totalDocs / limit);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  return {
    docs: docs,
    totalDocs,
    limit,
    totalPages,
    page,
    pagingCounter: Math.max(page, PAGINATION_WINDOW),
    hasPrevPage,
    hasNextPage,
    prevPage: hasPrevPage ? page - 1 : null,
    nextPage: hasNextPage ? page + 1 : null,
    offset,
  };
}
