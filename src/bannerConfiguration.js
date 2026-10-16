function buildBannerConfiguration({englishPhrase, welshPhrase, roles, startdate, enddate, starttime, endtime}) {
    const errors = {};
    if (!englishPhrase?.trim()) errors.englishPhrase = 'Enter the English phrase.';
    if (!welshPhrase?.trim()) errors.welshPhrase = 'Enter the Welsh phrase.';

    // Match the static formatter: use the first two times, with all-day defaults.
    const matches = [...(englishPhrase || '').matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b(\d{1,2}):(\d{2})\b/gi)];
    const inferred = matches.slice(0, 2).map(match => {
        if (match[4] !== undefined) return `${match[4].padStart(2, '0')}:${match[5]}`;
        const hour = Number(match[1]);
        if (hour < 1 || hour > 12) return match[0];
        return `${String(hour % 12 + (match[3].toLowerCase() === 'pm' ? 12 : 0)).padStart(2, '0')}:${match[2] || '00'}`;
    });
    const start = starttime?.trim() || inferred[0] || '00:00';
    const end = endtime?.trim() || inferred[1] || '23:59';
    for (const [field, time] of [['startTime', start], ['endTime', end]]) {
        if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time || '')) {
            errors[field] = 'Use a valid time in the English phrase, or enter an override in HH:mm format.';
        }
    }
    for (const [field, date] of [['startTime', startdate], ['endTime', enddate]]) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') ||
            !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
            errors[field] = 'Select a valid date above.';
        }
    }
    const begin = `${startdate}T${start}:00`;
    const finish = `${enddate}T${end}:00`;
    if (!errors.startTime && !errors.endTime && finish <= begin) {
        errors.endTime = 'The end date and time must be after the start date and time.';
    }

    // Accept a descriptive prefix ending in a colon, and common list separators.
    const allUsers = ['all', 'all users'].includes((roles || '').trim().toLowerCase());
    const roleList = (roles || '').replace(/^[^:]*:/, '').trim().split(/[\s,|()]+/).filter(Boolean);
    if (!allUsers && (!roleList.length || roleList.some(role => !/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(role)) ||
        (!(roles || '').includes(':') && /\ball\b.*\broles\b/i.test(roles || '')))) {
        errors.roles = 'Enter IDAM role IDs separated by spaces or commas, or "all" / "all users" for every user.';
    }
    if (Object.keys(errors).length) {
        const error = new Error(Object.values(errors).join('\n'));
        error.fields = errors;
        throw error;
    }
    return {
        begin,
        end: finish,
        index: 1,
        message_cy: welshPhrase,
        message_en: englishPhrase,
        roles: allUsers ? '.+' : [...new Set(roleList)].map(role => `(${role})`).join('|')
    };
}

function bannerConfigurationFromValues(values) {
    return buildBannerConfiguration({
        englishPhrase: values.englishPhrase?.title?.value,
        welshPhrase: values.welshPhrase?.title?.value,
        roles: values.roles?.title?.value,
        startdate: values.startDate?.title?.selected_date,
        enddate: values.endDate?.title?.selected_date,
        starttime: values.startTime?.title?.value,
        endtime: values.endTime?.title?.value
    });
}

function parseLabeledInput(text) {
    const normalized = (text || '').replace(/\r/g, '');
    const matches = [...normalized.matchAll(/^(English Phrase|Welsh Phrase|Xui Component|Users|Roles|Start Date|End Date):[ \t]*/gmi)];
    const parsed = {};
    for (let index = 0; index < matches.length; index++) {
        const current = matches[index];
        parsed[current[1].toLowerCase()] = normalized.slice(
            current.index + current[0].length,
            matches[index + 1]?.index ?? normalized.length
        ).trim();
    }
    return parsed;
}

function bannerConfigurationFromText(text) {
    const parsed = parseLabeledInput(text);
    return {
        configuration: buildBannerConfiguration({
            englishPhrase: parsed['english phrase'], welshPhrase: parsed['welsh phrase'],
            roles: parsed.roles, startdate: parsed['start date'], enddate: parsed['end date']
        }),
        component: parsed['xui component'] || 'n/a',
        users: parsed.users || 'n/a'
    };
}

module.exports = {buildBannerConfiguration, bannerConfigurationFromValues, parseLabeledInput, bannerConfigurationFromText};
