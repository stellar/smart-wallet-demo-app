export abstract class SingletonBase {
  private static instances: Map<unknown, unknown> = new Map()

  // eslint-disable-next-line no-empty-function
  protected constructor() {}

  public static getInstance<T, Args extends unknown[]>(this: new (...args: Args) => T, ...args: Args): T {
    // Ensure the static `instances` map is accessed correctly
    if (!SingletonBase.instances.has(this)) {
      SingletonBase.instances.set(this, new this(...args))
    }
    return SingletonBase.instances.get(this) as T
  }
}
