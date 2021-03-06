module.exports = function createEventsService (prefix, methods) {
  return function ({ logging, events }) {
    const logger = logging.getLogger(`services.events.${prefix}`)
    logger.info('Creating service.')
    const service = {}

    methods.forEach(eventName => {
      const path = eventName.split('.')
      const [methodName] = path.reverse()
      let deepObject = service

      path.forEach(part => {
        if (part === methodName) {
          return
        }

        if (!deepObject[part]) {
          deepObject[part] = {}
        }

        deepObject = deepObject[part]
      })

      deepObject[methodName] = (payload, date) => {
        if (!date) {
          date = new Date()
        }

        const logName = `${prefix}.${eventName}`

        events.record(logName, date, payload)
      }
    })

    return service
  }
}
