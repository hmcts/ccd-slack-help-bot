function optionalField(prefix, value) {
    if (value) {
        return `*${prefix}*: ${value}`
    }
    return ""
}

function mapFieldsToDescription(
    {
        user,
        userEmail,
        references,
        environment,
        description,
        analysis,
        slackLink,
        englishPhrase,
        welshPhrase,
        xuiComponent,
        users,
        roles,
        startdate,
        enddate,
    }) {
    return `
h6. _This is an automatically generated ticket created from Slack, do not reply or update in here, [view in Slack|${slackLink}]_

${optionalField('Jira/ServiceNow references', references)}

${optionalField('Environment', environment)}

${optionalField('English Phrase', englishPhrase)}

${optionalField('Welsh Phrase', welshPhrase)}

${optionalField('Xui Component', xuiComponent)}

${optionalField('Users', users)}

${optionalField('Roles', roles)}

${optionalField('Start Date', startdate)}

${optionalField('End Date', enddate)}

*Issue description*
${description}

*Analysis done so far*: ${analysis}

*Reporter*: ${userEmail}
`
}

function createComment({slackLink, displayName, message}) {
return `
h6. _This is an automatically added comment created from Slack, do not reply or update in here, [view in Slack|${slackLink}]_

h6. ${displayName}:
${message}
`
}

module.exports.mapFieldsToDescription = mapFieldsToDescription
module.exports.createComment = createComment
