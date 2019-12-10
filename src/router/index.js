import Vue from 'vue'
import Router from 'vue-router'
import auth from '@/auth'
import store from '@/store/store'
import { loadLanguageAsync } from '@/plugins/i18n'
import { EventBus } from '@/plugins/event-bus.js'

Vue.use(Router)

function requireAuth (to, from, next) {
  var authMode = store.getters.serverSettings ? store.getters.serverSettings.authMode : 'NONE'
  var token = store.getters.token

  EventBus.$emit('show-loading', false)

  // If we're in full auth mode, check credentials for each call
  if (authMode === 'FULL') {
    if (!auth.loggedIn()) {
      // Remember the original target
      if (!store.getters.originalTarget) {
        store.dispatch('ON_ORIGINAL_TARGET_CHANGED', to)
      }
      next({ path: '/g8/login' })
      return
    } else if (to.meta && to.meta.requiresAdmin && token.userType !== 'Administrator') {
      next({ path: '/403' })
      return
    }
  } else if (authMode === 'SELECTIVE' && to.meta && to.meta.requiresAdmin && (!token || token.userType !== 'Administrator')) {
    if (from.name) {
      EventBus.$emit('on-show-login-form')
    } else {
      next({ path: '/home' })
    }
    return
  }

  next()
}

const router = new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/g8',
      redirect: '/g8/login',
      name: 'login',
      component: () => import('@/containers/DefaultPublic'),
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import(/* webpackChunkName: "login" */ '@/views/pages/Login.vue')
        }
      ]
    },
    {
      path: '/',
      redirect: '/home',
      name: '',
      component: () => import('@/containers/DefaultContainer'),
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/Dashboard'),
          beforeEnter: requireAuth
        },
        {
          path: 'admin',
          redirect: '/admin/settings',
          name: '',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'settings',
              name: 'admin-settings',
              meta: { requiresAdmin: true },
              component: () => import('@/views/admin/Settings.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'user-permissions',
              name: 'user-permissions',
              meta: { requireAdmin: true },
              component: () => import('@/views/admin/UserPermissions.vue'),
              beforeEnter: requireAuth
            }
          ]
        },
        {
          path: 'data',
          redirect: '/data/germplasm',
          name: '',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'germplasm',
              name: 'germplasm',
              component: () => import('@/views/data/germplasm/Germplasm.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'germplasm/:germplasmId',
              name: 'passport',
              component: () => import('@/views/data/germplasm/Passport.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'datasets',
              name: 'datasets',
              component: () => import('@/views/data/Datasets.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'experiments/:experimentId',
              name: 'experiment-details',
              component: () => import('@/views/data/Experiments.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'statistics',
              name: 'statistics',
              component: () => import('@/views/data/DataStatistics.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'trials',
              redirect: '/data/trials/traits',
              name: '',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'traits',
                  name: 'traits',
                  component: () => import('@/views/data/trials/Traits.vue'),
                  beforeEnter: requireAuth
                },
                {
                  path: 'traits/:traitId',
                  name: 'trait-details',
                  component: () => import('@/views/data/trials/TraitDetails.vue'),
                  beforeEnter: requireAuth
                }
              ]
            },
            {
              path: 'compounds',
              redirect: '/data/compounds/compounds',
              name: '',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'compounds',
                  name: 'compounds',
                  component: () => import('@/views/data/compound/Compounds.vue'),
                  beforeEnter: requireAuth
                },
                {
                  path: 'compounds/:compoundId',
                  name: 'compound-details',
                  component: () => import('@/views/data/compound/CompoundDetails.vue'),
                  beforeEnter: requireAuth
                }
              ]
            },
            {
              path: 'genotypes',
              redirect: '/data/genotypes/maps',
              name: '',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'markers',
                  name: 'markers',
                  component: () => import('@/views/data/genotype/Markers.vue'),
                  beforeEnter: requireAuth
                },
                {
                  path: 'maps',
                  name: 'maps',
                  component: () => import('@/views/data/genotype/Maps.vue'),
                  beforeEnter: requireAuth
                },
                {
                  path: 'maps/:mapId',
                  name: 'map-details',
                  component: () => import('@/views/data/genotype/Maps.vue'),
                  beforeEnter: requireAuth
                }
              ]
            },
            {
              path: 'climate',
              redirect: '/data/climate/climates',
              name: '',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'climates',
                  name: 'climates',
                  component: () => import('@/views/data/climate/Climates.vue'),
                  beforeEnter: requireAuth
                }
              ]
            },
            {
              path: 'geography',
              redirect: '/data/geography/locations',
              name: '',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'locations',
                  name: 'locations',
                  component: () => import('@/views/data/geography/Locations.vue'),
                  beforeEnter: requireAuth
                },
                {
                  path: 'geographic-search',
                  name: 'geographic-search',
                  component: () => import('@/views/data/geography/GeographicSearch.vue'),
                  beforeEnter: requireAuth
                }
              ]
            },
            {
              path: 'export/:experimentType',
              name: 'export',
              component: () => import('@/views/DatasetSelector.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'export/climate/:datasetIds',
              name: 'export-climate',
              component: () => import('@/views/data/export/ClimateExport.vue'),
              beforeEnter: requireAuth,
              props (route) {
                const datasetIds = route.params.datasetIds || ''

                return {
                  datasetIds: datasetIds === '' ? [] : datasetIds.split(',').map(Number)
                }
              }
            },
            {
              path: 'export/climates/:datasetIds',
              name: 'export-climates',
              component: () => import('@/views/data/export/ClimateExport.vue'),
              beforeEnter: requireAuth,
              props (route) {
                const datasetIds = route.params.datasetIds || ''

                return {
                  datasetIds: datasetIds === '' ? [] : datasetIds.split(',').map(Number)
                }
              }
            },
            {
              path: 'export/trials/:datasetIds',
              name: 'export-trials',
              component: () => import('@/views/data/export/TrialsExport.vue'),
              beforeEnter: requireAuth,
              props (route) {
                const datasetIds = route.params.datasetIds || ''

                return {
                  datasetIds: datasetIds === '' ? [] : datasetIds.split(',').map(Number)
                }
              }
            },
            {
              path: 'export/compounds/:datasetIds',
              name: 'export-compounds',
              component: () => import('@/views/data/export/CompoundExport.vue'),
              beforeEnter: requireAuth,
              props (route) {
                const datasetIds = route.params.datasetIds || ''

                return {
                  datasetIds: datasetIds === '' ? [] : datasetIds.split(',').map(Number)
                }
              }
            },
            {
              path: 'export/genotypes/:datasetIds',
              name: 'export-genotypes',
              component: () => import('@/views/data/export/GenotypeExport.vue'),
              beforeEnter: requireAuth,
              props (route) {
                const datasetIds = route.params.datasetIds || ''

                return {
                  datasetIds: datasetIds === '' ? [] : datasetIds.split(',').map(Number)
                }
              }
            },
            {
              path: 'export/allelefreq/:datasetIds',
              name: 'export-allelefrequency',
              component: () => import('@/views/data/export/AlleleFrequencyExport.vue'),
              beforeEnter: requireAuth,
              props (route) {
                const datasetIds = route.params.datasetIds || ''

                return {
                  datasetIds: datasetIds === '' ? [] : datasetIds.split(',').map(Number)
                }
              }
            }
          ]
        },
        {
          path: 'import',
          redirect: '/import/data-upload',
          name: '',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'data-upload',
              name: 'import-upload',
              component: () => import('@/views/data/DataUploader.vue'),
              beforeEnter: requireAuth
            }
          ]
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('@/views/Search.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'search/:searchTerm',
          name: 'search-query',
          component: () => import('@/views/Search.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'groups',
          name: 'groups',
          component: () => import('@/views/Groups.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'groups/upload/:file',
          name: 'group-upload',
          component: () => import('@/views/GroupUpload.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'groups/:groupId',
          name: 'group-details',
          component: () => import('@/views/Groups.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'images',
          name: 'images',
          component: () => import('@/views/Images.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'marked-items',
          name: 'marked-items',
          component: () => import('@/views/MarkedItemsView.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'marked-items/:itemType',
          name: 'marked-items-type',
          component: () => import('@/views/MarkedItemsView.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'about',
          redirect: '/about/germinate',
          name: '',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'germinate',
              name: 'about-germinate',
              meta: { canBeHidden: false },
              component: () => import('@/views/about/AboutGerminate.vue')
            },
            {
              path: 'project',
              name: 'about-project',
              component: () => import('@/views/about/AboutProject.vue')
            },
            {
              path: 'export-formats',
              name: 'about-export-formats',
              component: () => import('@/views/about/ExportFormats.vue')
            },
            {
              path: 'export-formats/:format',
              name: 'about-export-formats-specific',
              component: () => import('@/views/about/ExportFormats.vue')
            }
          ]
        },
        {
          path: '404',
          name: '404',
          component: () => import('@/views/pages/Page404.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  var serverSettings = store.getters.serverSettings

  if (Vue.$ga) {
    Vue.$ga.page(router)
  }

  // Check if this page can be hidden
  const canBeHidden = !to.meta || to.meta.canBeHidden !== false
  // If the requested page isn't available because it has been hidden, redirect to 404
  if (serverSettings && serverSettings.hiddenPages && canBeHidden) {
    if (serverSettings.hiddenPages.indexOf(to.name) !== -1) {
      next({ name: '404' })
      return
    }
  }

  store.dispatch('ON_HELP_KEY_CHANGED', null)
  loadLanguageAsync(store.getters.locale).then(() => next())
})

export default router
