/**
 * Module that builds the GraphQL configuration.
 * It simply maps GraphQL queries to services.
 *
 * @param {Object} container The DI container.
 */
module.exports = container => {
  const rssService = container.resolve('rssService')
  const lightsService = container.resolve('lightsService')
  const weatherService = container.resolve('weatherService')
  const listsService = container.resolve('listsService')
  const pubSub = container.resolve('pubSub')

  return {
    typeDefs: require('./typeDefs'),
    resolvers: {
      RootQuery: {
        feed: () => rssService.feed(),
        light: (_, { id }) => lightsService.light(id),
        lights: () => lightsService.lights(),
        weather: (_, { lon, lat }) =>
          weatherService.getCurrentWeather({ lon, lat }),
        lists: () => listsService.lists(),
        list: (_, { id }) => listsService.list(id),
        sources: () => rssService.sources()
      },
      RootMutation: {
        switchLight: async (_, { input }) => {
          const light = await lightsService.toggleLight(input.id, input.isOn)

          return { light }
        },
        setLightBrightness: async (_, { input }) => {
          const light = await lightsService.updateLight(input.id, {
            bri: input.bri
          })

          return { light }
        },
        updateLightInformation: async (_, { input }) => {
          const light = await lightsService.updateLight(input.id, {
            name: input.name
          })

          return { light }
        },
        createList: async (_, { input }) => {
          const list = await listsService.create(input.name)

          pubSub.publish('listCreated', list.id)

          return { list }
        },
        updateList: async (_, { input }) => {
          const list = await listsService.update(input.id, {
            name: input.name
          })

          return { list }
        },
        deleteList: async (_, { input }) => {
          const list = await listsService.list(input.id)
          await listsService.delete(input.id)

          return { list }
        },
        addListItem: async (_, { input }) => {
          const item = await listsService.addItem(input.listId, input.text)
          const list = await listsService.list(input.listId)

          return { list, item }
        },
        updateListItem: async (_, { input }) => {
          const item = await listsService.updateItem(input.id, {
            text: input.text,
            done: input.done
          })

          return { item }
        },
        deleteListItem: async (_, { input }) => {
          const item = await listsService.item(input.id)
          await listsService.deleteItem(input.id)

          return { item }
        },
        addRssSource: async (_, { input }) => {
          const source = await rssService.addSource(input.url)

          return { source }
        },
        deleteRssSource: async (_, { input }) => {
          const source = await rssService.source(input.id)
          await rssService.deleteSource(input.id)

          return { source }
        }
      },
      RootSubscription: {
        listCreated: {
          subscribe: () => pubSub.asyncIterator('listCreated'),
          resolve: id => listsService.list(id)
        }
      }
    }
  }
}
