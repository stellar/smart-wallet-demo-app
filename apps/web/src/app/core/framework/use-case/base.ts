export interface IUseCaseBase<Result> {
  handle(...params: unknown[]): Promise<Result>
}

export abstract class UseCaseBase<Result> implements IUseCaseBase<Result> {
  /**
   * This method is where we should implement our business logic of the use case
   * @param params
   */
  abstract handle(...params: unknown[]): Promise<Result>

  static init<T, Args extends unknown[]>(this: new (...args: Args) => T, ...args: Args): T {
    return new this(...args)
  }
}
