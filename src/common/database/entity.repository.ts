import {
  AggregateOptions,
  ClientSession,
  HydratedDocument,
  Model,
  PipelineStage,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';

import { FilterDto } from '../dto';

import {
  PaginateQueryOptions,
  PaginateResult,
  paginateQuery,
} from './paginate';

/**
 * Mongoose 9 declara `{}` como default en los genéricos `TQueryHelpers`,
 * `TInstanceMethods` y `TVirtuals` de `Model`. `Record<never, never>` es el
 * equivalente estructural que no dispara `no-empty-object-type`.
 */
type NoHelpers = Record<never, never>;

type MongooseModel<
  TRawDocType,
  THydratedDocumentType extends HydratedDocument<TRawDocType>,
> = Model<TRawDocType, NoHelpers, NoHelpers, NoHelpers, THydratedDocumentType>;

export type EntityId = string | Types.ObjectId;

/**
 * Mongoose 9 usa `UpdateOptions` para updateOne/updateMany y `QueryOptions`
 * para las lecturas. Se deriva de la propia firma del Model para no duplicar
 * (ni desincronizar) esa definición.
 */
export type EntityUpdateOptions<TRawDocType> = NonNullable<
  Parameters<Model<TRawDocType>['updateOne']>[2]
>;

export abstract class EntityRepository<
  TRawDocType,
  THydratedDocumentType extends HydratedDocument<TRawDocType> =
    HydratedDocument<TRawDocType>,
> {
  protected readonly readOptions: QueryOptions<TRawDocType> = {
    readPreference: 'secondaryPreferred',
  };

  constructor(
    protected readonly entityModel: MongooseModel<
      TRawDocType,
      THydratedDocumentType
    >,
  ) {}

  async findOne(
    filter: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocumentType | null> {
    return await this.entityModel
      .findOne(filter, projection, { ...this.readOptions, ...options })
      .exec();
  }

  async findOneById(
    id: EntityId,
    projection?: ProjectionType<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocumentType | null> {
    return await this.entityModel
      .findById(id, projection, { ...this.readOptions, ...options })
      .exec();
  }

  async find(
    filter: QueryFilter<TRawDocType>,
    projection?: ProjectionType<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocumentType[]> {
    return await this.entityModel
      .find(filter, projection, { ...this.readOptions, ...options })
      .exec();
  }

  async findPaginate(
    filter: FilterDto<TRawDocType>,
    options?: Omit<PaginateQueryOptions, 'limit' | 'page'>,
  ): Promise<PaginateResult<THydratedDocumentType>> {
    const { data, limit, page } = filter;

    return await paginateQuery<TRawDocType, THydratedDocumentType>(
      this.entityModel,
      data,
      {
        limit,
        page,
        ...options,
        readPreference: this.readOptions.readPreference,
      },
    );
  }

  async create(
    createDto: Partial<TRawDocType>,
    session?: ClientSession,
  ): Promise<THydratedDocumentType> {
    const doc = new this.entityModel(createDto);

    return (await doc.save(
      session ? { session } : undefined,
    )) as THydratedDocumentType;
  }

  async findOneAndUpdate(
    filter: QueryFilter<TRawDocType>,
    update: UpdateQuery<TRawDocType>,
    options: QueryOptions<TRawDocType> = { new: true },
  ): Promise<THydratedDocumentType | null> {
    return await this.entityModel
      .findOneAndUpdate(filter, update, options)
      .exec();
  }

  async findByIdAndUpdate(
    id: EntityId,
    update: UpdateQuery<TRawDocType>,
    options: QueryOptions<TRawDocType> = { new: true },
  ): Promise<THydratedDocumentType | null> {
    return await this.entityModel.findByIdAndUpdate(id, update, options).exec();
  }

  async updateOne(
    filter: QueryFilter<TRawDocType>,
    update: UpdateQuery<TRawDocType>,
    options?: EntityUpdateOptions<TRawDocType>,
  ): Promise<UpdateWriteOpResult> {
    return await this.entityModel.updateOne(filter, update, options).exec();
  }

  async updateMany(
    filter: QueryFilter<TRawDocType>,
    update: UpdateQuery<TRawDocType>,
    options?: EntityUpdateOptions<TRawDocType>,
  ): Promise<UpdateWriteOpResult> {
    return await this.entityModel.updateMany(filter, update, options).exec();
  }

  async findOneAndDelete(
    filter: QueryFilter<TRawDocType>,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocumentType | null> {
    return await this.entityModel.findOneAndDelete(filter, options).exec();
  }

  async findByIdAndDelete(
    id: EntityId,
    options?: QueryOptions<TRawDocType>,
  ): Promise<THydratedDocumentType | null> {
    return await this.entityModel.findByIdAndDelete(id, options).exec();
  }

  async deleteMany(filter: QueryFilter<TRawDocType>): Promise<boolean> {
    const result = await this.entityModel.deleteMany(filter).exec();
    return result.deletedCount >= 1;
  }

  async aggregate<R>(
    pipeline: PipelineStage[],
    options?: AggregateOptions,
  ): Promise<R[]> {
    return await this.entityModel
      .aggregate<R>(pipeline, {
        ...options,
        readPreference: 'secondaryPreferred',
      })
      .exec();
  }

  async count(filter: QueryFilter<TRawDocType>): Promise<number> {
    return await this.entityModel.countDocuments(filter).exec();
  }
}
