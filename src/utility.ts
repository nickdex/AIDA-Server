import { Service } from '@feathersjs/feathers';
import * as lodash from 'lodash';

export namespace Utility {
  export const equalsIgnoreCase = (string1: string, string2: string) => {
    return string1.toUpperCase() === string2.toUpperCase();
  };

  export const findIdsWhere = (service: Service<any>, parentIdKvPair) =>
    service.find({
      query: { $select: ['_id'], ...parentIdKvPair }
    });

  export const includes = async (id: string, ids: string[]) => {
    return (
      !(lodash.isNil(ids) || lodash.isEmpty(ids)) && lodash.includes(ids, id)
    );
  };

  export const isChild = async (childId, childStore, parentIdKvPair) => {
    return includes(childId, await findIdsWhere(childStore, parentIdKvPair));
  };

  export const generateId = (parentId, param) => {
    const updatedId = lodash
      .chain(param)
      .map(char => lodash.toLower(char))
      .filter(char => char >= 'a' && char <= 'z')
      .join('')
      .value();

    return lodash.join([parentId, updatedId], '-');
  };
}
