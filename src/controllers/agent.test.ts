import { parseActionString } from './agent';

const action = 'smarthome.device.switch.on';

test('parses action string', () => {
    const parsedString = parseActionString(action);

    expect(parsedString.entity).toBe('device');
    expect(parsedString.action).toBe('on');
});
