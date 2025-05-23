const { convertIso8601ToEpochSeconds } = require('./dateHelper');

function convertJiraKeyToUrl(jiraId) {
    return `https://tools.hmcts.net/jira/browse/${jiraId}`;
}

const slackLinkRegex = /view in Slack\|(https:\/\/.+slack\.com.+)]/

function extractSlackLinkFromText(text) {
    if (text === undefined) {
        return undefined
    }

    const regexResult = slackLinkRegex.exec(text);
    if (regexResult === null) {
        return undefined
    }
    return regexResult[1]
}

function stringTrim(string, maxLength) {
    const truncationMessage = '... [Truncated] see Jira for rest of message.';

    if (string.length >= maxLength) {
        return string.slice(0, maxLength - truncationMessage.length).concat(truncationMessage);
    } else {
        return string;
    }
}

function helpRequestRaised({
                               user,
                               summary,
                               priority,
                               environment,
                               references,
                               jiraId
                           }) {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*${summary}*`,
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": "*Status* :fire:  \n Open"
                },
                {
                    "type": "mrkdwn",
                    "text": `*Priority* :rotating_light: \n ${priority}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Reporter* :man-surfing: \n <@${user}>`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Environment* :house_with_garden: \n ${environment}`
                }
            ]
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*Jira/ServiceNow references* :pencil: \n${references}`
                }
            ]
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": `View on Jira: <${convertJiraKeyToUrl(jiraId)}|${jiraId}>`
                }
            ]
        },
        {
            "type": "divider"
        },
        {
            "type": "actions",
            "block_id": "actions",
            "elements": [
                {
                    "type": "users_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Unassigned",
                        "emoji": true
                    },
                    "action_id": "assign_help_request_to_user"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": ":raising_hand: Take it",
                        "emoji": true
                    },
                    "style": "primary",
                    "value": "assign_help_request_to_me",
                    "action_id": "assign_help_request_to_me"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": ":female-firefighter: Start",
                        "emoji": true
                    },
                    "style": "primary",
                    "value": "start_help_request",
                    "action_id": "start_help_request"
                }
            ]
        },
        {
            "type": "divider"
        }
    ]
}

function helpRequestDetails(
    {
        description,
        analysis
    }) {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": stringTrim(`:spiral_note_pad: Description: ${description}`, 3000),
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": stringTrim(`:thinking_face: Analysis: ${analysis}`, 3000),
            }
        },
    ]
}

function bannerRequestDetails(
    {
        englishPhrase,
        welshPhrase,
        startdate,
        enddate
    }) {
    const diffInMs   = new Date(enddate) - new Date(startdate);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (diffInDays >= 14) {
        return [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": stringTrim(`:flag-england: English: ${englishPhrase}`, 3000),
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": stringTrim(`:flag-wales: Welsh: ${welshPhrase}`, 3000),
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": stringTrim(`:calendar: Start Date: ${startdate}`, 3000),
                }    
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": stringTrim(`:calendar: End Date: ${enddate}`, 3000),
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `:memo: <!subteam^S08JJRRP1A5> please review this banner message as it's greater than 2 weeks in length`,
                }
            },
        ]
      } else {
        return [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": stringTrim(`:flag-england: English: ${englishPhrase}`, 3000),
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": stringTrim(`:flag-wales: Welsh: ${welshPhrase}`, 3000),
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": stringTrim(`:calendar: Start Date: ${startdate}`, 3000),
                }    
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": stringTrim(`:calendar: End Date: ${enddate}`, 3000),
                }
            },
        ]
      }
    }
    

function unassignedOpenIssue({
                                 summary,
                                 slackLink,
                                 jiraId,
                                 created,
                                 updated
                             }) {
    const link = slackLink ? slackLink : convertJiraKeyToUrl(jiraId)

    return [
        {
            "type": "divider"
        },
        {
            "type": "section",
            "block_id": `${jiraId}_link`,
            "text": {
                "type": "mrkdwn",
                "text": `*<${link}|${summary}>*`
            },
        },
        {
            "type": "actions",
            "block_id": `${jiraId}_actions`,
            "elements": [
                {
                    "type": "users_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Assign to",
                        "emoji": true
                    },
                    "action_id": "app_home_unassigned_user_select"
                },
                {
                    "type": "button",
                    "action_id": "app_home_take_unassigned_issue",
                    "text": {
                        "type": "plain_text",
                        "text": ":raising_hand: Take it"
                    },
                    "style": "primary"
                }
            ]
        },
        {
            "type": "section",
            "block_id": `${jiraId}_fields`,
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*:alarm_clock: Opened:*\n <!date^${convertIso8601ToEpochSeconds(created)}^{date_pretty} ({time})|${created}>`
                },
                {
                    "type": "mrkdwn",
                    "text": `*:hourglass: Last Updated:*\n <!date^${convertIso8601ToEpochSeconds(updated)}^{date_pretty} ({time})|${updated}>`
                },
                {
                    "type": "mrkdwn",
                    "text": `*View on Jira*:\n <${convertJiraKeyToUrl(jiraId)}|${jiraId}>`
                }
            ]
        },
        ]
}

function appHomeUnassignedIssues(openIssueBlocks) {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Open unassigned issues*"
            }
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Unassigned open issues",
                        "emoji": true
                    },
                    "value": "unassigned_open_issues",
                    "action_id": "unassigned_open_issues"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "My issues",
                        "emoji": true
                    },
                    "value": "my_issues",
                    "action_id": "my_issues"
                }
            ]
        },
        ...openIssueBlocks
    ]
}

function option(name, option) {
    return {
        text: {
            type: "plain_text",
            text: name,
            emoji: true
        },
        value: option ?? name.toLowerCase()
    }
}

function openHelpRequestBlocks() {
    return {
        "title": {
            "type": "plain_text",
            "text": "Support request"
        },
        "submit": {
            "type": "plain_text",
            "text": "Submit"
        },
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Please refer to the following confluence pages for the minimum data set required to process a support request",
                    "emoji": true
                }
            },
            {
                "type": "actions",
                "block_id": "actionblock789",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "CCD Minimum Data set"
                        },
                        "url": "https://tools.hmcts.net/confluence/display/CCD/How+to+create+a+Support+Request+via+Slackbot+and+minimum+data+set"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "HMC Minimum Data Set"
                        },
                        "url": "https://tools.hmcts.net/confluence/display/HMAN/How+to+create+a+Support+Request+via+Slackbot+and+minimum+data+set"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "User Config Request"
                        },
                        "url": "https://tools.hmcts.net/confluence/pages/viewpage.action?pageId=375685806#ProductionUserManagement-RaisingrequestsintheformofJIRATickets"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Definition Import Request"
                        },
                        "url": "https://tools.hmcts.net/confluence/display/RCCD/Production:+Case+Configuration"
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "If any of the information is not provided the team will pause the request and ask for the ticket to be updated",
                    "emoji": true
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "input",
                "block_id": "request_type",
                "element": {
                    "type": "radio_buttons",
                    "options": [
                        option('CCD Support', 'ccd'),
                        option('CFTS Level 2 Support', 'cfts'),
                        option('HMC Support', 'hmc'),
                        option('User Config Request', 'ucr'),
                        option('Definition Import Request', 'dir'),
                    ],
                    "action_id": "request_type"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Request type"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "input",
                "block_id": "summary",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Short description of the issue"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Issue summary"
                }
            },
            {
                "type": "input",
                "block_id": "priority",
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Standard priority classification",
                        "emoji": true
                    },
                    "options": [
                        option('Highest'),
                        option('High'),
                        option('Medium'),
                        option('Low'),
                    ],
                    "action_id": "priority"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Priority",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "references",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Any relevant ticket references"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Jira/ServiceNow references"
                }
            },
            {
                "type": "input",
                "block_id": "environment",
                "optional": true,
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Choose an environment",
                        "emoji": true
                    },
                    "options": [
                        option('AAT / Staging', 'staging'),
                        option('Preview / Dev', 'dev'),
                        option('Production'),
                        option('Perftest / Test', 'test'),
                        option('Demo'),
                        option('Demo INT', 'demo-int'),
                        option('WA INT', 'wa-int'),
                        option('ITHC'),
                        option('N/A', 'none'),
                    ],
                    "action_id": "environment"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Environment",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "description",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "description"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Issue description",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "analysis",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "analysis"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Analysis done so far",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "team",
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select other if missing",
                        "emoji": true
                    },
                    "options": [
                        option('Access Management', 'am'),
                        option('Adoption'),
                        option('Architecture'),
                        option('Bulk scan', 'bulkscan'),
                        option('Bulk print', 'bulkprint'),
                        option('CCD'),
                        option('Civil Damages', 'civildamages'),
                        option('Civil Unspecified', 'CivilUnspec'),
                        option('Civil Enforcement', 'CivilEnforce'),
                        option('CMC'),
                        option('Divorce'),
                        option('Domestic Abuse', "domesticabuse"),
                        option('No fault divorce', 'nfdivorce'),
                        option('Employment Tribunals', 'et'),
                        option('Ethos'),
                        option('Evidence Management', 'evidence'),
                        option('Expert UI', 'xui'),
                        option('FaCT'),
                        option('Fee & Pay', 'feeAndPay'),
                        option('Financial Remedy', 'finrem'),
                        option('FPLA'),
                        option('Family Private Law', 'FPRL'),
                        option('Family Public Law', 'FPL'),
                        option('Heritage'),
                        option('HMI'),
                        option('Management Information', 'mi'),
                        option('Immigration and Asylum', 'iac'),
                        option('IDAM'),
                        option('Other'),
                        option('Private Law','private-law'),
                        option('Probate'),
                        option('Reference Data', 'refdata'),
                        option('Reform Software Engineering', 'reform-software-engineering'),
                        option('Security Operations or Secure design', 'security'),
                        option('Special Tribunals', 'sptribs'),
                        option('SSCS'),
                        option('PayBubble'),
                        option('PET'),
                        option('Work Allocation', 'workallocation'),
                    ],
                    "action_id": "team"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Which team are you from?",
                    "emoji": true
                }
            }
        ],
        "type": "modal",
        "callback_id": "create_help_request"
    }
}

function openBannerRequestBlocks() {
    return {
        "title": {
            "type": "plain_text",
            "text": "Banner Message request"
        },
        "submit": {
            "type": "plain_text",
            "text": "Submit"
        },
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Please note your message should comply with the following: \n - Begins with which service the message is applicable for \n - Includes all relevant information in clear and concise language, no acronyms and appropriate grammar",
                    "emoji": true
                }
            },
            {
                "type": "actions",
                "block_id": "actionblock790",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Banner Request Guidance"
                        },
                        "url": "https://tools.hmcts.net/confluence/display/EXUI/How+to+request+a+service+message+banner+on+Slack"
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "If any of the information is not provided the team will pause the request and ask for the ticket to be updated",
                    "emoji": true
                }
            },
            {
			    "type": "divider"
		    },
            {
                "type": "input",
                "block_id": "request_type",
                "element": {
                    "type": "radio_buttons",
                    "options": [
                        option('XUI Banner Message', 'xui'),
                    ],
                    "action_id": "request_type"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Request type"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "input",
                "block_id": "references",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Any relevant ticket references"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Jira/Change references"
                }
            },
            {
                "type": "input",
                "block_id": "englishPhrase",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "English Phrase"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "English Phrase"
                }
            },
            {
                "type": "input",
                "block_id": "welshPhrase",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Welsh Phrase"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Welsh Phrase"
                }
            },
            {
                "type": "section",
                "block_id": "xuiComponent",
                "text": {
                  "type": "mrkdwn",
                  "text": " In what ExUI component should the message be published?"
                },
                "accessory": {
                  "action_id": "component",
                  "type": "static_select",
                  "placeholder": {
                    "type": "plain_text",
                    "text": "Select an item"
                  },
                  "options": [
                    {
                      "text": {
                        "type": "plain_text",
                        "text": "Manage Case (MC)"
                      },
                      "value": "mc"
                    },
                    {
                      "text": {
                        "type": "plain_text",
                        "text": "Manage Org (MO)"
                      },
                      "value": "mo"
                    },
                    {
                      "text": {
                        "type": "plain_text",
                        "text": "both"
                      },
                      "value": "both"
                    }
                  ]
                }
              },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Please refer to the following roles list to specify which roles the message should apply too"
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Role List",
                        "emoji": true
                    },
                    "value": "click_me_123",
                    "url": "https://tools.hmcts.net/confluence/display/EXUI/IDAM+Role+List",
                    "action_id": "button-action"
                }
            },
            {
                "type": "input",
                "block_id": "users",
                "optional": false,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "what group of users should see the message? Professional Users / Staff / Judiciary"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "users"
                }
            },{
                "type": "input",
                "block_id": "roles",
                "optional": false,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "if known what idam roles is this applicable for"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "roles"
                }
            },
            {
                "type": "section",
                "block_id": "startDate",
                "text": {
                  "type": "mrkdwn",
                  "text": "Pick a start date for the message."
                },
                "accessory": {
                  "type": "datepicker",
                  "action_id": "title",
                  "initial_date": new Date().toISOString().slice(0, 10),
                  "placeholder": {
                    "type": "plain_text",
                    "text": "Select a date"
                  }
                }
              },
              {
                "type": "section",
                "block_id": "endDate",
                "text": {
                  "type": "mrkdwn",
                  "text": "Pick an end date for the message."
                },
                "accessory": {
                  "type": "datepicker",
                  "action_id": "title",
                  "initial_date": new Date().toISOString().slice(0, 10),
                  "placeholder": {
                    "type": "plain_text",
                    "text": "Select a date"
                  }
                }
              },
            {
                "type": "input",
                "block_id": "team",
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select other if missing",
                        "emoji": true
                    },
                    "options": [
                        option('Access Management', 'am'),
                        option('Adoption'),
                        option('Architecture'),
                        option('Bulk scan', 'bulkscan'),
                        option('Bulk print', 'bulkprint'),
                        option('CCD'),
                        option('Civil Damages', 'civildamages'),
                        option('Civil Unspecified', 'CivilUnspec'),
                        option('CMC'),
                        option('Divorce'),
                        option('Domestic Abuse', "domesticabuse"),
                        option('No fault divorce', 'nfdivorce'),
                        option('Employment Tribunals', 'et'),
                        option('Ethos'),
                        option('Evidence Management', 'evidence'),
                        option('Expert UI', 'xui'),
                        option('FaCT'),
                        option('Fee & Pay', 'feeAndPay'),
                        option('Financial Remedy', 'finrem'),
                        option('FPLA'),
                        option('Family Private Law', 'FPRL'),
                        option('Family Public Law', 'FPL'),
                        option('Heritage'),
                        option('HMI'),
                        option('Management Information', 'mi'),
                        option('Immigration and Asylum', 'iac'),
                        option('IDAM'),
                        option('Other'),
                        option('Private Law','private-law'),
                        option('Probate'),
                        option('Reference Data', 'refdata'),
                        option('Reform Software Engineering', 'reform-software-engineering'),
                        option('Security Operations or Secure design', 'security'),
                        option('Special Tribunals', 'sptribs'),
                        option('SSCS'),
                        option('PayBubble'),
                        option('PET'),
                        option('Work Allocation', 'workallocation'),
                    ],
                    "action_id": "team"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Which team are you from?",
                    "emoji": true
                }
            }

        ],
        "type": "modal",
        "callback_id": "create_banner_request"
    }
}


module.exports.appHomeUnassignedIssues = appHomeUnassignedIssues;
module.exports.unassignedOpenIssue = unassignedOpenIssue;
module.exports.helpRequestRaised = helpRequestRaised;
module.exports.helpRequestDetails = helpRequestDetails;
module.exports.bannerRequestDetails = bannerRequestDetails;
module.exports.openHelpRequestBlocks = openHelpRequestBlocks;
module.exports.openBannerRequestBlocks = openBannerRequestBlocks;
module.exports.extractSlackLinkFromText = extractSlackLinkFromText;
