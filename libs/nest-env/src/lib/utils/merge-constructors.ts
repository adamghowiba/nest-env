import { ClassConstructor } from 'class-transformer';

export function mergeConstructors<T extends ClassConstructor<T>>(
  ...constructors: T[]
): any {
  class MergedClass {}

  for (const constructor of constructors) {
    const prototype = constructor.prototype;

    // Get all properties of the constructor
    const properties = Object.getOwnPropertyNames(prototype);

    for (const property of properties) {
      // Skip constructor
      if (property === 'constructor') continue;

      // Get property descriptor
      const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
      if (descriptor && descriptor.get) {
        // If it's a getter, we use the getter
        Object.defineProperty(MergedClass.prototype, property, descriptor);
      } else {
        // Otherwise, we just assign the property
        (MergedClass.prototype as any)[property] = (prototype as any)[property];
      }
    }
  }

  return MergedClass;
}
