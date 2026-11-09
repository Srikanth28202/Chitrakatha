interface MongoLikeError {
  code?: number;
  name?: string;
  message?: string;
}

export function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as MongoLikeError).code === 11000
  );
}

export function isMongooseValidationError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as MongoLikeError).name === 'ValidationError'
  );
}

export function getMongoErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && typeof (error as MongoLikeError).message === 'string') {
    return (error as MongoLikeError).message as string;
  }
  return 'Unknown database error';
}
