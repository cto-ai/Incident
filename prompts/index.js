const { ux } = require('@cto.ai/sdk')
const moment = require('moment')

const { secondary } = ux.colors

const newRunPrompts = [
  {
    type: 'input',
    name: 'gitlabToken',
    message: `Please input your GitLab Access Token`,
  },
  {
    type: 'input',
    name: 'projectId',
    message: `Please input your GitLab Project Id`,
  },
  {
    type: 'input',
    name: 'slackWebHook',
    message: `Please input your Slack WebHook URL`,
  },
  {
    type: 'input',
    name: 'pagerDutyKey',
    message: `Please input your PagerDuty API Key`,
  },
]

const userPrompts = [
  {
    type: 'input',
    name: 'email',
    message: 'Please enter your email for PagerDuty',
  },
  {
    type: 'input',
    name: 'firstName',
    message: 'Please enter your first name',
  },
  {
    type: 'input',
    name: 'lastName',
    message: 'Please enter your last name',
  },
]

const useOldAuthPrompt = [
  {
    type: 'confirm',
    name: 'useOld',
    message: `Would you like to use your previously entered GitLab, Slack, and PagerDuty configuration`,
  },
]

const whichJobPrompt = choices => {
  return [
    {
      type: 'list',
      name: 'job',
      message: `What would you like to do`,
      choices,
    },
  ]
}

const incidentTitlePrompt = {
  type: 'input',
  name: 'description',
  message: `\n⚠️  Please describe the incident: ${secondary(
    '(Maximum 255 characters)'
  )}`,
}

const incidentStartPrompts = [
  {
    type: 'list',
    name: 'impact',
    message: 'What impact is the incident having',
    choices: [
      '🔥   All customers are affected.',
      '😭   Large segment of customers are affected.',
      '😫   Small segment of customers are affected.',
      '😣   Site performance degraded for some customers.',
      '☹️    Potential issue, but customers are currently unaware.',
    ],
  },
  {
    type: 'datetime',
    name: 'started_at',
    message: 'When did the incident start',
    maximum: new Date(),
  },
  {
    type: 'list',
    name: 'status',
    message: 'What is the current status of the incident',
    choices: [
      '🔍 Investigating',
      '🚨 Identified',
      '📈 Monitoring',
      '👍 Resolved',
    ],
  },
  {
    type: 'input',
    name: 'message',
    message: 'What is the current incident update',
  },
]

const whereToCreatePrompt = [
  {
    type: 'confirm',
    name: 'gitlab',
    message: `Would you like to create a GitLab issue`,
  },
  {
    type: 'confirm',
    name: 'slack',
    message: `Would you like to send a Slack message to your linked channel`,
  },
  {
    type: 'confirm',
    name: 'pagerDuty',
    message: `Would you like to create a PagerDuty incident`,
  },
]

const pagerDutyAssigneePrompt = choices => {
  return [
    {
      type: 'list',
      name: 'assignee',
      message: `Which PagerDuty user would you like to assign to this incident`,
      choices,
    },
  ]
}

const escalationPolicyPrompt = choices => {
  return [
    {
      type: 'list',
      name: 'escalationPolicy',
      message: `Which PagerDuty escalation policy would you like to use for this incident`,
      choices,
    },
  ]
}

const servicePrompt = choices => {
  return [
    {
      type: 'list',
      name: 'service',
      message: `Which PagerDuty service would you like to use for this incident`,
      choices,
    },
  ]
}

const updateSelectPrompt = choices => {
  return [
    {
      type: 'list',
      name: 'selected',
      message: `Which incident would you like to update`,
      choices,
    },
  ]
}

const howUpdatePrompt = [
  {
    type: 'list',
    name: 'updateType',
    message: `How would you like to update this incident`,
    choices: [
      'Resolve this incident',
      'Escalate this incident',
      'Add a note',
      'Snooze this incident',
    ],
  },
]

const noteContentsPrompt = [
  {
    type: 'input',
    name: 'content',
    message: `Please enter your note`,
  },
]

const snoozeDurationPrompt = [
  {
    type: 'datetime',
    name: 'snoozeDuration',
    message: `How long would you like to snooze this incident`,
    format: ['mm', '/', 'dd', '/', 'yy', ' ', 'hh', ':', 'MM', ' ', 'TT'],
    minimum: new Date(),
  },
]

async function getSearchQuery() {
  // Datetime prompt does not currently support formatting of the date @ sdk v2.0.1
  const currentTime = moment().format()
  const endDatePrompt = {
    type: 'datetime',
    name: 'until',
    message: `What is the end of the date range over which you want to search`,
    maximum: currentTime,
  }
  const { until } = await ux.prompt(endDatePrompt)
  const chosenEndDate = moment(until)
  // PagerDuty getIncident API returns a bad request when date ranges are longer than 179 days from current time
  const optionPrompts = [
    {
      type: 'datetime',
      name: 'since',
      message: `What is the start of the date range over which you want to search`,
      maximum: chosenEndDate.format(),
      minimum: chosenEndDate
        .clone()
        .subtract(179, 'days')
        .format(),
    },
    {
      type: 'checkbox',
      name: 'statuses',
      message: `Which statuses would you like to search for`,
      choices: ['Triggered', 'Acknowledged', 'Resolved'],
    },
    {
      type: 'checkbox',
      name: 'urgencies',
      message: `Which urgencies would you like to search for`,
      choices: ['High', 'Low'],
    },
  ]
  const query = await ux.prompt(optionPrompts)
  return { until, ...query }
}

const shouldContinuePrompt = [
  {
    type: 'confirm',
    name: 'shouldContinue',
    message: `Would you like to perform another task`,
  },
]

const escalatePrompt = [
  {
    type: 'input',
    name: 'level',
    message: `Please enter the escalation level to promote this incident to`,
  },
]

module.exports = {
  newRunPrompts,
  userPrompts,
  useOldAuthPrompt,
  whichJobPrompt,
  incidentTitlePrompt,
  incidentStartPrompts,
  whereToCreatePrompt,
  pagerDutyAssigneePrompt,
  escalationPolicyPrompt,
  servicePrompt,
  updateSelectPrompt,
  howUpdatePrompt,
  noteContentsPrompt,
  snoozeDurationPrompt,
  getSearchQuery,
  shouldContinuePrompt,
  escalatePrompt,
}
