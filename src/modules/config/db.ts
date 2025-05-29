import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { envs } from './envs';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: envs.databaseUrl,
      connectionFactory: (connection: Connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        connection.plugin(paginate);
        return connection;
      },
    };
  }
}
