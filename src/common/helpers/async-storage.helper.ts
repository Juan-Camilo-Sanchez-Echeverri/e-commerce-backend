import {
  AsyncLocalStorageMiddleware,
  AsyncStorage,
} from '../middlewares/async-storage.middleware';

export const getItemsFromAsyncStore = (select: keyof typeof AsyncStorage) => {
  const store = AsyncLocalStorageMiddleware.getStore();

  if (store) return store.get(select);

  return null;
};
