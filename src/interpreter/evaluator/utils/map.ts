/**
 * @authors https://github.com/eou/php-interpreter
 * @description
 * The Map interface represent an object that maps keys to values.
 */
export interface IMap<T> {
    [key: string]: T;
}
