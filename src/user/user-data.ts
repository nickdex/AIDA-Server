import { userData } from '../database/data';

export namespace UserData {
  export const getUsers = async () => {
    return Promise.resolve(userData);
  };

  export const updateUsers = async (users: any) => {
    // userData = users;
    return Promise.resolve(null);
  };
}
