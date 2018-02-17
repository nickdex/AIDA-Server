// Type definitions for feathers-nedb 3.0
// Project: http://github.com/feathersjs-nedb
// Definitions by: Nikhil Warke <https://github.com/nickdex>
// TypeScript Version: 2.6.2

/// <reference types="node" />

declare module 'feathers-nedb' {
  import { PaginationOptions, Id, ServiceMethods } from '@feathersjs/feathers';

  export default function init<T>(options: Option): ServiceMethods<T>;

  export class Option {
    Model: Nedb;
    events?: any[];
    id?: Id;
    paginate?: PaginationOptions;
  }
}
