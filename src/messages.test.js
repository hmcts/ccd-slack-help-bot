const messages = require('./messages')

describe('banner JSON output', () => {
    it('adds a generation button without showing an output before generation', () => {
        const modal = messages.openBannerRequestBlocks();
        expect(modal.blocks.flatMap(block => block.elements || []).some(element => element.action_id === 'generate_banner_json')).toBe(true);
        expect(modal.blocks.some(block => block.type === 'rich_text')).toBe(false);
    });
    it('preserves selected dates and component during a preview update', () => {
        const component = {text: {type: 'plain_text', text: 'both'}, value: 'both'};
        const modal = messages.openBannerRequestBlocks({values: {
            startDate: {title: {selected_date: '2026-03-11'}},
            endDate: {title: {selected_date: '2026-03-12'}},
            xuiComponent: {component: {selected_option: component}}
        }});
        expect(modal.blocks.find(block => block.block_id === 'startDate').accessory.initial_date).toBe('2026-03-11');
        expect(modal.blocks.find(block => block.block_id === 'endDate').accessory.initial_date).toBe('2026-03-12');
        expect(modal.blocks.find(block => block.block_id === 'xuiComponent').accessory.initial_option).toEqual(component);
    });
    it('renders complete, parseable JSON including quotes, newlines and backticks', () => {
        const configuration = {message_en: 'Quoted "message"\n``` & <text>', message_cy: 'Mewnfudo a Lloches', roles: '(caseworker-ia)'.repeat(300)};
        const modal = messages.openBannerRequestBlocks({configuration});
        const output = modal.blocks.find(block => block.type === 'rich_text').elements[0].elements[0].text;
        expect(JSON.parse(output)).toEqual(configuration);
    });
    it('replaces the preview with guidance when generation fails', () => {
        const modal = messages.openBannerRequestBlocks({error: 'Enter explicit roles.'});
        expect(modal.blocks.at(-1).text.text).toBe('Enter explicit roles.');
        expect(modal.blocks.some(block => block.type === 'rich_text')).toBe(false);
    });
});

describe('extractSlackLinkFromText', () => {
    it('returns undefined when undefined', () => {
        expect(messages.extractSlackLinkFromText(undefined)).toBe(undefined)
    })
    it('returns undefined when no match', () => {
        expect(messages.extractSlackLinkFromText("hello world")).toBe(undefined)
    })
    it('returns slack message link when found', () => {
        expect(messages.extractSlackLinkFromText("h6. _This is an automatically generated ticket created from Slack, do not reply or update in here, [view in Slack|https://platformengin-tzf2541.slack.com/archives/C01KHKNJUKE/p1611568116006500]_"))
            .toBe('https://platformengin-tzf2541.slack.com/archives/C01KHKNJUKE/p1611568116006500')
    })
})
