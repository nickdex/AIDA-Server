import { clientData } from '../database/data';

export namespace ClientData {
  export const getClients = async () => {
    return Promise.resolve(clientData);
  };

  export const updateClients = async (clients: any) => {
    clientData.Nikhil = clients;

    return Promise.resolve(null);
  };
}
