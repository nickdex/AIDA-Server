export interface IIotDevice {
  _id: string; // join([IIotAgent._id, name], '-')
  name: string;
  pin: number;
  isOn: boolean;

  agentId: string; // IIotAgent._id
}
