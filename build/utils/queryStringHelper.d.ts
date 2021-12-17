/**
 * Creates a list query string for interfacing with Unum ID saas services.
 * For example: {{saasUrl}}/issuer?uuid[$in][]=f12b49a5-89f8-4cee-8ed6-7ac3ffab3ff3&uuid[$in][]=439e38d0-cb82-419c-bfbb-ae3abf214934
 *
 * @param key string
 * @param values string[]
 */
export declare const createListQueryString: (key: string, values: string[]) => string;
//# sourceMappingURL=queryStringHelper.d.ts.map