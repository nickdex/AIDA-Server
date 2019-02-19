import * as PouchDbService from 'feathers-pouchdb';
import * as PouchDBHttpAdapter from 'pouchdb-adapter-http';
import * as PouchDBCore from 'pouchdb-core';
import * as PouchDBFind from 'pouchdb-find';

const pouchDB = PouchDBCore.plugin(PouchDBHttpAdapter).plugin(PouchDBFind);
const pouchDbUrl = process.env.DATABASE_URL;

export const databaseService = (databaseName: string) => {
  return PouchDbService({
    Model: new pouchDB(`${pouchDbUrl}/${databaseName}`)
  });
};
