import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

import * as autoPopulate from 'mongoose-autopopulate';
import * as paginate from 'mongoose-paginate-v2';
import { envs } from './envs';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: envs.databaseUrl,
      connectionFactory: (connection) => {
        connection.plugin(autoPopulate);
        connection.plugin(paginate);
        return connection;
      },
    };
  }
}
