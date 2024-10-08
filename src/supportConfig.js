
const config = require('config');

const supportConfig = {
    ccd: {
        reportChannel: config.get('slack.ccd.report_channel'),
        reportChannelId: config.get('slack.ccd.report_channel_id'),
        jiraProject: config.get('jira.ccd.project'),
        issueTypeId: config.get('jira.ccd.issue_type_id'),
        issueTypeName: config.get('jira.ccd.issue_type_name'),
        jiraStartTransitionId: config.get('jira.ccd.start_transition_id'),
        jiraDoneTransitionId: config.get('jira.ccd.done_transition_id'),
        fixedVersion: "CCD No Release Required",
        components: "No Component"
    },
    cfts: {
        reportChannel: config.get('slack.cfts.report_channel'),
        reportChannelId: config.get('slack.cfts.report_channel_id'),
        jiraProject: config.get('jira.cfts.project'),
        issueTypeId: config.get('jira.cfts.issue_type_id'),
        issueTypeName: config.get('jira.cfts.issue_type_name'),
        jiraStartTransitionId: config.get('jira.cfts.start_transition_id'),
        jiraDoneTransitionId: config.get('jira.cfts.done_transition_id'),
        fixedVersion: "CCD No Release Required",
        components: "No Component"
    },
    hmc: {
        reportChannel: config.get('slack.hmc.report_channel'),
        reportChannelId: config.get('slack.hmc.report_channel_id'),
        jiraProject: config.get('jira.hmc.project'),
        issueTypeId: config.get('jira.hmc.issue_type_id'),
        issueTypeName: config.get('jira.hmc.issue_type_name'),
        jiraStartTransitionId: config.get('jira.hmc.start_transition_id'),
        jiraDoneTransitionId: config.get('jira.hmc.done_transition_id'),
        fixedVersion: "HMC No Release Required",
        components: "HMC"
    },
    ucr: {
        reportChannel: config.get('slack.ucr.report_channel'),
        reportChannelId: config.get('slack.ucr.report_channel_id'),
        jiraProject: config.get('jira.ucr.project'),
        issueTypeId: config.get('jira.ucr.issue_type_id'),
        issueTypeName: config.get('jira.ucr.issue_type_name'),
        jiraStartTransitionId: config.get('jira.ucr.start_transition_id'),
        jiraDoneTransitionId: config.get('jira.ucr.done_transition_id'),
        fixedVersion: "CCD No Release Required",
        components: "CDM Configuration"
    },
    dir: {
        reportChannel: config.get('slack.dir.report_channel'),
        reportChannelId: config.get('slack.dir.report_channel_id'),
        jiraProject: config.get('jira.dir.project'),
        issueTypeId: config.get('jira.dir.issue_type_id'),
        issueTypeName: config.get('jira.dir.issue_type_name'),
        jiraStartTransitionId: config.get('jira.dir.start_transition_id'),
        jiraDoneTransitionId: config.get('jira.dir.done_transition_id'),
        fixedVersion: "CCD No Release Required",
        components: "CDM Configuration"
    },
    xui: {
        reportChannel: config.get('slack.xui.report_channel'),
        reportChannelId: config.get('slack.xui.report_channel_id'),
        jiraProject: config.get('jira.xui.project'),
        issueTypeId: config.get('jira.xui.issue_type_id'),
        issueTypeName: config.get('jira.xui.issue_type_name'),
        jiraStartTransitionId: config.get('jira.xui.start_transition_id'),
        jiraDoneTransitionId: config.get('jira.xui.done_transition_id'),
        fixedVersion: "CCD No Release Required",
        components: "No Component"
        }
}

const extractProjectRegex = new RegExp(`((${getJiraProjects().join('|')})-[\\d]+)`)

function getReportChannel(requestType) {
    return supportConfig[requestType].reportChannel
}

function getJiraProject(requestType) {
    return supportConfig[requestType].jiraProject
}

function getIssueTypeId(requestType) {
    return supportConfig[requestType].issueTypeId
}

function getJiraStartTransitionId(requestType) {
    return supportConfig[requestType].jiraStartTransitionId
}

function getJiraDoneTransitionId(requestType) {
    return supportConfig[requestType].jiraDoneTransitionId
}

function isReportChannel(channelId) {
    return getConfigKeys().find(key => supportConfig[key].reportChannelId === channelId) != undefined
}

function getJiraProjects() {
    return getConfigKeys().map(key => supportConfig[key].jiraProject)
}

function getFixedVersion(requestType) {
    return supportConfig[requestType].fixedVersion
}

function getComponents(requestType) {
    return supportConfig[requestType].components
}

function getIssueTypeNames() {
    return getConfigKeys().map(key => supportConfig[key].issueTypeName)
}

function getConfigKeys() {
    return Object.keys(supportConfig)
}

function getRequestTypeFromJiraId(jiraId) {
    const jiraProject = extractJiraProject(jiraId)
    return getRequestTypeFromJiraProject(jiraProject)
}

function getRequestTypeFromJiraProject(jiraProject) {
    return getConfigKeys().find(key => supportConfig[key].jiraProject === jiraProject)
}

function extractJiraProject(text) {
    return extractProjectRegex.exec(text)[2]
}

module.exports.extractProjectRegex = extractProjectRegex
module.exports.getRequestTypeFromJiraId = getRequestTypeFromJiraId
module.exports.getReportChannel = getReportChannel
module.exports.isReportChannel = isReportChannel
module.exports.getJiraProjects = getJiraProjects
module.exports.getJiraProject = getJiraProject
module.exports.getIssueTypeNames = getIssueTypeNames
module.exports.getIssueTypeId = getIssueTypeId
module.exports.getJiraStartTransitionId = getJiraStartTransitionId
module.exports.getJiraDoneTransitionId = getJiraDoneTransitionId
module.exports.getComponents = getComponents
module.exports.getFixedVersion = getFixedVersion
