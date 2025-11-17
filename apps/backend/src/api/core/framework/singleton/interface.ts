export abstract class SingletonBase {
  private static instances: Map<unknown, Map<string, unknown>> = new Map()

  // eslint-disable-next-line no-empty-function
  protected constructor() {}

  public static getInstance<T, Args extends unknown[]>(this: new (...args: Args) => T, ...args: Args): T {
    // Create sub-map for this class if it doesn't exist yet
    if (!SingletonBase.instances.has(this)) {
      SingletonBase.instances.set(this, new Map())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const classMap = SingletonBase.instances.get(this)!

    // Serialize args to make them part of the uniqueness key
    const argsKey = JSON.stringify(args)

    if (!classMap.has(argsKey)) {
      classMap.set(argsKey, new this(...args))
    }

    return classMap.get(argsKey) as T
  }
}
