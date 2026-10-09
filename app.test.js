const mockApp = {
    action: jest.fn(), view: jest.fn(), shortcut: jest.fn(), event: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined)
};
jest.mock('@slack/bolt', () => ({App: jest.fn(() => mockApp)}));
jest.mock('@hmcts/properties-volume', () => ({addTo: config => config}));
jest.mock('config', () => ({get: () => 'test-value'}));
jest.mock('http', () => ({createServer: () => ({listen: jest.fn()})}));
jest.mock('./src/supportConfig', () => ({getReportChannel: () => 'test-channel'}));
jest.mock('./src/service/persistence', () => ({
    createHelpRequest: jest.fn().mockResolvedValue('TEST-1'),
    updateHelpRequestCommonFields: jest.fn().mockResolvedValue(undefined),
    updateHelpRequestDescription: jest.fn().mockResolvedValue(undefined)
}));

const {createHelpRequest} = require('./src/service/persistence');
const {buildBannerConfiguration} = require('./src/bannerConfiguration');
const log = jest.spyOn(console, 'log').mockImplementation(() => {});
require('./app');
const preview = mockApp.action.mock.calls.find(([id]) => id === 'generate_banner_json')[1];
const submit = mockApp.view.mock.calls.find(([id]) => id === 'create_banner_request')[1];
const openFormatter = mockApp.action.mock.calls.find(([id]) => id === 'open_pasted_banner_formatter')[1];
const formatPasted = mockApp.view.mock.calls.find(([id]) => id === 'format_pasted_banner_request')[1];

const values = {
    englishPhrase: {title: {value: 'Maintenance from 7pm to 5am'}},
    welshPhrase: {title: {value: 'Gwaith cynnal a chadw'}},
    roles: {title: {value: 'caseworker-ia'}},
    startDate: {title: {selected_date: '2026-03-11'}},
    endDate: {title: {selected_date: '2026-03-12'}},
    references: {title: {value: null}},
    request_type: {request_type: {selected_option: {value: 'xui'}}},
    team: {team: {selected_option: {value: 'iac'}}},
    xuiComponent: {component: {selected_option: {value: 'both', text: {type: 'plain_text', text: 'both'}}}}
};

afterAll(() => log.mockRestore());

it('opens the pasted formatter above the existing request form', async () => {
    const ack = jest.fn();
    const push = jest.fn();
    await openFormatter({ack, body: {trigger_id: 'TRIGGER-1'}, client: {views: {push}}});
    expect(ack).toHaveBeenCalledWith();
    expect(push).toHaveBeenCalledWith(expect.objectContaining({trigger_id: 'TRIGGER-1', view: expect.objectContaining({callback_id: 'format_pasted_banner_request'})}));
});

it('keeps the pasted formatter open with JSON and metadata', async () => {
    const ack = jest.fn();
    await formatPasted({ack, view: {state: {values: {pastedRequest: {request_text: {value:
        'English Phrase: Maintenance\nWelsh Phrase: Cynnal a chadw\nRoles: all users\nStart Date: 2026-03-11\nEnd Date: 2026-03-12\nXui Component: both\nUsers: Staff'
    }}}}}});
    const response = ack.mock.calls[0][0];
    expect(response.response_action).toBe('update');
    const output = response.view.blocks.find(block => block.type === 'rich_text');
    expect(JSON.parse(output.elements[0].elements[0].text)).toMatchObject({begin: '2026-03-11T00:00:00', end: '2026-03-12T23:59:00', roles: '.+'});
    expect(response.view.blocks.find(block => block.type === 'context').elements[0].text).toBe('Component: both | Users: Staff');
    expect(createHelpRequest).not.toHaveBeenCalled();
});

it('shows a pasted-input error without publishing a request', async () => {
    const ack = jest.fn();
    await formatPasted({ack, view: {state: {values: {}}}});
    expect(ack).toHaveBeenCalledWith({response_action: 'errors', errors: {pastedRequest: expect.any(String)}});
    expect(createHelpRequest).not.toHaveBeenCalled();
});

it('generates a preview in the existing modal without creating a request', async () => {
    const ack = jest.fn();
    const update = jest.fn();
    await preview({ack, body: {view: {id: 'VIEW-1', hash: 'hash', state: {values}}}, client: {views: {update}}});
    expect(ack).toHaveBeenCalledWith();
    expect(update.mock.calls[0][0]).toMatchObject({view_id: 'VIEW-1', hash: 'hash'});
    const output = update.mock.calls[0][0].view.blocks.find(block => block.type === 'rich_text');
    expect(JSON.parse(output.elements[0].elements[0].text).begin).toBe('2026-03-11T19:00:00');
    expect(createHelpRequest).not.toHaveBeenCalled();
});

it('keeps incomplete submissions open with field errors', async () => {
    const ack = jest.fn();
    await submit({ack, view: {state: {values: {}}}});
    expect(ack.mock.calls[0][0]).toMatchObject({response_action: 'errors', errors: {roles: expect.any(String), startTime: expect.any(String)}});
    expect(createHelpRequest).not.toHaveBeenCalled();
});

it('posts JSON using the final submitted values even when they differ from a preview', async () => {
    const edited = {...values, startTime: {title: {value: '18:30'}}};
    const postMessage = jest.fn().mockResolvedValue({channel: 'test-channel', message: {ts: '123'}});
    await submit({ack: jest.fn(), body: {user: {id: 'USER-1'}}, view: {state: {values: edited}}, client: {
        users: {profile: {get: jest.fn().mockResolvedValue({profile: {email: 'test@example.com'}})}},
        chat: {postMessage, getPermalink: jest.fn().mockResolvedValue({permalink: 'https://example.com/thread'})}
    }});
    expect(createHelpRequest).toHaveBeenCalledTimes(1);
    const thread = postMessage.mock.calls[1][0];
    expect(thread.thread_ts).toBe('123');
    const output = thread.blocks.find(block => block.type === 'rich_text');
    expect(JSON.parse(output.elements[0].elements[0].text)).toEqual(buildBannerConfiguration({
        englishPhrase: 'Maintenance from 7pm to 5am', welshPhrase: 'Gwaith cynnal a chadw',
        roles: 'caseworker-ia', startdate: '2026-03-11', enddate: '2026-03-12', starttime: '18:30'
    }));
});
