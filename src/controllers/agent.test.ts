import { parseActionString, parseContext } from './agent';

const action = 'smarthome.device.switch.on';
const context = [
    {
        name: 'device-switch',
        parameters: {
            device: 'fan'
        }
    },
    {
        name: 'switch',
        parameters: {
            room: 'outdoor'
        }
    }
];

test('parses action string', () => {
    const parsedString = parseActionString(action);

    expect(parsedString.entity).toBe('device');
    expect(parsedString.action).toBe('on');
});

test('parses action string', () => {
    const parsedContext = parseContext(context);

    expect(parsedContext.device).toBe('fan');
    expect(parsedContext.room).toBe('outdoor');
});
