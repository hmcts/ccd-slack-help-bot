const fs = require('fs');
const path = require('path');
const {openBannerRequestBlocks, openPastedBannerFormatter} = require('../src/messages');
const {buildBannerConfiguration} = require('../src/bannerConfiguration');

const example = {
    englishPhrase: 'The Immigration and Asylum Service will be unavailable from 7pm on Wednesday 11 March 2026 to 5am on Thursday 12 March 2026 due to essential maintenance',
    welshPhrase: 'Ni fydd y Gwasanaeth Mewnfudo a Lloches ar gael o 7pm dydd Mercher 11 Mawrth 2026 tan 5am dydd Iau 12 Mawrth 2026 oherwydd gwaith cynnal a chadw hanfodol',
    roles: 'All IA Idam roles: caseworker-ia caseworker-ia-admofficer caseworker-ia-bails caseworker-ia-caseofficer caseworker-ia-homeofficeapc caseworker-ia-homeofficebail caseworker-ia-homeofficelart caseworker-ia-homeofficepou caseworker-ia-iacjudge caseworker-ia-judiciary caseworker-ia-legalrep-solicitor caseworker-ia-readonly caseworker-ia-respondentofficer caseworker-ia-srcaseofficer caseworker-ia-system caseworker-ia-system-access caseworker-iac-bulkscan caseworker-iac-systemupdate',
    startdate: '2026-03-11',
    enddate: '2026-03-12'
};
const component = 'both';
const users = 'Professional Users / Staff / Judiciary';
const configuration = buildBannerConfiguration(example);

// Fix dates in snapshots so regenerating on another day produces the same files.
const dates = {
    startDate: {title: {selected_date: example.startdate}},
    endDate: {title: {selected_date: example.enddate}}
};
const emptyForm = openBannerRequestBlocks({values: dates});
const completedForm = openBannerRequestBlocks({values: dates, configuration});
const inputValues = {englishPhrase: example.englishPhrase, welshPhrase: example.welshPhrase, roles: example.roles, users};
for (const block of completedForm.blocks) {
    if (Object.hasOwn(inputValues, block.block_id)) block.element.initial_value = inputValues[block.block_id];
    if (['request_type', 'team'].includes(block.block_id)) {
        block.element.initial_option = block.element.options.find(option => option.value === (block.block_id === 'team' ? 'iac' : 'xui'));
    }
    if (block.block_id === 'xuiComponent') {
        block.accessory.initial_option = block.accessory.options.find(option => option.value === component);
    }
}

const pastedForm = openPastedBannerFormatter({result: {configuration, component, users}});
pastedForm.blocks.find(block => block.block_id === 'pastedRequest').element.initial_value = [
    `English Phrase: ${example.englishPhrase}`, `Welsh Phrase: ${example.welshPhrase}`,
    `Xui Component: ${component}`, `Users: ${users}`, `Roles: ${example.roles}`,
    `Start Date: ${example.startdate}`, `End Date: ${example.enddate}`
].join('\n\n');

const outputDir = path.join(__dirname, '../examples/slack');
fs.mkdirSync(outputDir, {recursive: true});
for (const [filename, view] of Object.entries({
    'banner-form-layout.json': emptyForm,
    'banner-form-with-output.json': completedForm,
    'banner-pasted-formatter.json': pastedForm
})) {
    fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(view, null, 2) + '\n');
    console.log(`Generated examples/slack/${filename}`);
}
