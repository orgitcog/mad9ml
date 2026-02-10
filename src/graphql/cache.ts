import NodeCache from 'node-cache';
import fs from 'fs';
import path from 'path';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache TTL set to 1 hour

export function getCachedIntrospectionResult(key: string): any {
  return cache.get(key);
}

export function setCachedIntrospectionResult(key: string, value: any): void {
  cache.set(key, value);
}

export function invalidateCacheOnSchemaChange(schemaFilePath: string): void {
  fs.watch(schemaFilePath, (eventType: string, filename: string) => {
    if (eventType === 'change') {
      cache.flushAll();
    }
  });
}

// Monitor schema files for changes to invalidate cache
const schemaFilePath = path.resolve(__dirname, 'schema.ts');
const resolversFilePath = path.resolve(__dirname, 'resolvers.ts');
invalidateCacheOnSchemaChange(schemaFilePath);
invalidateCacheOnSchemaChange(resolversFilePath);
