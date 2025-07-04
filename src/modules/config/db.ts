import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

import { Connection, Schema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import * as autopopulate from 'mongoose-autopopulate';

import { ExecModes } from '@common/enums';
import { validateMongo } from '@common/helpers';

import { envs } from './envs';

type MongoosePlugin = (schema: Schema, options?: any) => void;

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: envs.databaseUrl,
      connectionFactory: (connection: Connection) => {
        connection.set('debug', envs.nodeEnv === ExecModes.LOCAL);
        connection.plugin(autopopulate as unknown as MongoosePlugin);
        connection.plugin(paginate);

        connection.plugin((schema) => {
          schema.post('save', validateMongo);
          schema.post('findOneAndUpdate', validateMongo);
          schema.post('updateOne', validateMongo);
        });

        return connection;
      },
    };
  }
}
