import {
  AsyncLocalStorageMiddleware,
  AsyncStorageKeys,
} from '../middlewares/async-storage.middleware';

export const getItemsFromAsyncStore = (
  select: keyof typeof AsyncStorageKeys,
) => {
  const store = AsyncLocalStorageMiddleware.getStore();

  if (store) return store.get(select);

  return null;
};
