import { objects } from "./objects";
import { singletons } from "./singletons";
import { documents } from "./documents";

export const schemaTypes = [...objects, ...singletons, ...documents];
export { singletonTypes } from "./singletons";
