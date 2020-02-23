/* eslint-disable @typescript-eslint/no-explicit-any */
export function applyMixins (derivedCtor: any, baseCtors: any[]): void
{
    baseCtors.forEach(baseCtor =>
    {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name =>
        {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        })
    });
}