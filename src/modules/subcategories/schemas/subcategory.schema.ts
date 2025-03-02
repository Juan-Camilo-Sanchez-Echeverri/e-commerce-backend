import { Document } from 'mongoose';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';

import { Status } from '@common/enums';
import { validateMongo } from '@common/helpers';

@Schema({ timestamps: true, versionKey: false })
export class Subcategory extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status?: Status;
}

export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);

SubcategorySchema.post('save', validateMongo);

SubcategorySchema.post('findOneAndDelete', async function (doc) {
  // Sacar de categories.subcategories

  if (this.model && this.model.db) {
    const id = doc._id;

    await this.model.db.collection('categories').updateMany(
      {
        subcategories: { $in: [id] },
      },
      { $pull: { subcategories: doc._id } },
    );
  }
});
