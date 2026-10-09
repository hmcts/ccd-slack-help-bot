const {buildBannerConfiguration, bannerConfigurationFromValues, bannerConfigurationFromText, parseLabeledInput} = require('./bannerConfiguration');

const roles = 'caseworker-ia caseworker-ia-admofficer caseworker-ia-bails caseworker-ia-caseofficer caseworker-ia-homeofficeapc caseworker-ia-homeofficebail caseworker-ia-homeofficelart caseworker-ia-homeofficepou caseworker-ia-iacjudge caseworker-ia-judiciary caseworker-ia-legalrep-solicitor caseworker-ia-readonly caseworker-ia-respondentofficer caseworker-ia-srcaseofficer caseworker-ia-system caseworker-ia-system-access caseworker-iac-bulkscan caseworker-iac-systemupdate';
const example = {
    englishPhrase: 'The Immigration and Asylum Service will be unavailable from 7pm on Wednesday 11 March 2026 to 5am on Thursday 12 March 2026 due to essential maintenance',
    welshPhrase: 'Ni fydd y Gwasanaeth Mewnfudo a Lloches ar gael o 7pm dydd Mercher 11 Mawrth 2026 tan 5am dydd Iau 12 Mawrth 2026 oherwydd gwaith cynnal a chadw hanfodol',
    roles: `All IA Idam roles: ${roles}`,
    startdate: '2026-03-11',
    enddate: '2026-03-12'
};

describe('buildBannerConfiguration', () => {
    it('produces the requested JSON for the complete example', () => {
        expect(buildBannerConfiguration(example)).toEqual({
            begin: '2026-03-11T19:00:00', end: '2026-03-12T05:00:00', index: 1,
            message_cy: example.welshPhrase, message_en: example.englishPhrase,
            roles: roles.split(' ').map(role => `(${role})`).join('|')
        });
    });
    it.each([
        ['12am to 12pm', '00:00', '12:00'],
        ['7:30 PM to 5:15 am', '19:30', '05:15'],
        ['19:45 to 05:20', '19:45', '05:20']
    ])('supports times in %s', (englishPhrase, start, end) => {
        const result = buildBannerConfiguration({...example, englishPhrase});
        expect(result.begin).toBe(`2026-03-11T${start}:00`);
        expect(result.end).toBe(`2026-03-12T${end}:00`);
    });
    it('uses explicit times for phrases without times', () => {
        expect(buildBannerConfiguration({...example, englishPhrase: 'Maintenance', starttime: '18:30', endtime: '06:00'}).begin)
            .toBe('2026-03-11T18:30:00');
    });
    it('defaults missing times to the start and end of the day', () => {
        const result = buildBannerConfiguration({...example, englishPhrase: 'Maintenance'});
        expect(result.begin).toBe('2026-03-11T00:00:00');
        expect(result.end).toBe('2026-03-12T23:59:00');
    });
    it('defaults only the end time when the phrase has one time', () => {
        const result = buildBannerConfiguration({...example, englishPhrase: 'Maintenance from 7pm'});
        expect(result.begin).toBe('2026-03-11T19:00:00');
        expect(result.end).toBe('2026-03-12T23:59:00');
    });
    it('uses the first two times when the phrase contains more', () => {
        const result = buildBannerConfiguration({...example, englishPhrase: '7pm then 8pm then 5am'});
        expect(result.end).toBe('2026-03-12T20:00:00');
    });
    it.each(['all', 'All users', ' ALL USERS '])('uses .+ for %s', roles => {
        expect(buildBannerConfiguration({...example, roles}).roles).toBe('.+');
    });
    it('accepts common role separators and removes duplicates', () => {
        expect(buildBannerConfiguration({...example, roles: '(caseworker-ia)|(caseworker-ia),\ncaseworker-iac-bulkscan'}).roles)
            .toBe('(caseworker-ia)|(caseworker-iac-bulkscan)');
    });
    it.each([
        {englishPhrase: '13pm to 5am'},
        {englishPhrase: '25:00 to 05:00'},
        {englishPhrase: '7:75pm to 5am'},
        {starttime: '25:00'},
        {roles: 'All IA Idam roles'},
        {roles: ''},
        {roles: 'caseworker-ia.*'},
        {startdate: '2026-02-30'},
        {enddate: '2026-03-10'},
        {welshPhrase: ''}
    ])('rejects incomplete or invalid input: %j', override => {
        expect(() => buildBannerConfiguration({...example, ...override})).toThrow();
    });
    it('reads the Slack modal state', () => {
        expect(bannerConfigurationFromValues({
            englishPhrase: {title: {value: example.englishPhrase}},
            welshPhrase: {title: {value: example.welshPhrase}},
            roles: {title: {value: example.roles}},
            startDate: {title: {selected_date: example.startdate}},
            endDate: {title: {selected_date: example.enddate}}
        })).toEqual(buildBannerConfiguration(example));
    });
});

describe('pasted requests', () => {
    const text = `English Phrase: ${example.englishPhrase}\n\nWelsh Phrase: ${example.welshPhrase}\n\nXui Component: both\n\nUsers: Professional Users / Staff / Judiciary\n\nRoles: ${example.roles}\n\nStart Date: ${example.startdate}\n\nEnd Date: ${example.enddate}`;
    it('produces the same payload from the pasted example and individual fields', () => {
        expect(bannerConfigurationFromText(text)).toEqual({
            configuration: buildBannerConfiguration(example), component: 'both', users: 'Professional Users / Staff / Judiciary'
        });
    });
    it('supports Windows newlines, mixed label case, multiline phrases and roles', () => {
        const parsed = parseLabeledInput('english phrase: Maintenance\r\novernight\r\nROLES: caseworker-ia\r\ncaseworker-ia-bails\r\nEnd Date: 2026-03-12');
        expect(parsed['english phrase']).toBe('Maintenance\novernight');
        expect(parsed.roles).toBe('caseworker-ia\ncaseworker-ia-bails');
    });
    it('rejects missing required labels', () => {
        expect(() => bannerConfigurationFromText('English Phrase: Maintenance')).toThrow();
    });
});
