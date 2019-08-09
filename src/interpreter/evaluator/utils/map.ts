/**
 * @authors https://github.com/eou/php-interpreter
 * @description
 * The Map interface represent an object that maps keys to values.
 * Keys must be string and will be convert to string in the map.
 */
export interface IMap<T> {
    [key: string]: T;
}
