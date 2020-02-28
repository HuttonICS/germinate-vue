import axios from 'axios'
import { mapGetters } from 'vuex'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  computed: {
    ...mapGetters([
      'asyncJobCount',
      'asyncJobUuids',
      'baseUrl',
      'cookiesAccepted',
      'entityTypeStats',
      'helpKey',
      'hiddenColumns',
      'locale',
      'markedIds',
      'originalTarget',
      'serverSettings',
      'sidebarState',
      'tableFiltering',
      'tablePerPage',
      'token'
    ])
  },
  data: function () {
    return {
      MAX_JAVA_INTEGER: 2147483647,
      gatekeeperErrors: {
        'BAD_REQUEST_MISSING_FIELDS': 'gatekeeperErrorBadRequestMissingField',
        'CONFLICT_USER_ALREADY_HAS_ACCESS': 'gatekeeperErrorConflictUserAlreadyHasAccess',
        'CONFLICT_USER_ALREADY_REQUESTED_ACCESS': 'gatekeeperErrorConflictUserAlreadyRequestedAccess',
        'CONFLICT_USERNAME_EMAIL_ALREADY_IN_USE': 'gatekeeperErrorConflictUsernameEmailAlreadyInUse',
        'FORBIDDEN_ACCESS_TO_OTHER_USER': 'gatekeeperErrorForbiddenAccessToOtherUser',
        'FORBIDDEN_INSUFFICIENT_PERMISSIONS': 'gatekeeperErrorForbiddenInsufficientPermissions',
        'FORBIDDEN_INVALID_CREDENTIALS': 'gatekeeperErrorForbiddenInvalidCredentials',
        'NOT_FOUND_ACTIVATION_KEY': 'gatekeeperErrorNotFoundActivationKey',
        'NOT_FOUND_ACTIVATION_REQUEST': 'gatekeeperErrorNotFoundActivationRequest',
        'NOT_FOUND_ID': 'gatekeeperErrorNotFoundId',
        'NOT_FOUND_ID_OR_PAYLOAD': 'gatekeeperErrorNotFoundIdOrPayload',
        'NOT_FOUND_INSTITUTION': 'gatekeeperErrorNotFoundInstitution',
        'NOT_FOUND_PAYLOAD': 'gatekeeperErrorNotFoundPayload',
        'NOT_FOUND_TOKEN': 'gatekeeperErrorNotFoundToken',
        'NOT_FOUND_USER': 'gatekeeperErrorNotFoundUser',
        'UNAVAILABLE_EMAIL': 'gatekeeperErrorUnavailableEmail'
      },
      operators: {
        and: {
          text: () => this.$t('operatorsAnd'),
          value: 'and'
        },
        or: {
          text: () => this.$t('operatorsOr'),
          value: 'or'
        }
      },
      comparators: {
        contains: {
          text: () => this.$t('comparatorsContains'),
          values: 1
        },
        equals: {
          text: () => this.$t('comparatorsEqual'),
          values: 1
        },
        between: {
          text: () => this.$t('comparatorsBetween'),
          values: 2
        },
        greaterThan: {
          text: () => this.$t('comparatorsGreaterThan'),
          values: 1
        },
        greaterOrEquals: {
          text: () => this.$t('comparatorsGreaterThanOrEquals'),
          values: 1
        },
        lessThan: {
          text: () => this.$t('comparatorsLessThan'),
          values: 1
        },
        lessOrEquals: {
          text: () => this.$t('comparatorsLessThanOrEquals'),
          values: 1
        },
        inSet: {
          text: () => this.$t('comparatorsInSet'),
          values: 1
        }
      },
      exportFormats: {
        flapjack: {
          name: 'Flapjack',
          logo: 'tools/flapjack.png',
          text: () => this.$t('pageExportFormatsFlapjackText'),
          tags: ['genotype', 'phenotype'],
          link: 'https://ics.hutton.ac.uk/flapjack'
        },
        helium: {
          name: 'Helium',
          logo: 'tools/helium.png',
          text: () => this.$t('pageExportFormatsHeliumText'),
          tags: ['pedigree', 'phenotype'],
          link: 'https://ics.hutton.ac.uk/helium'
        },
        curlywhirly: {
          name: 'CurlyWhirly',
          logo: 'tools/curlywhirly.png',
          text: () => this.$t('pageExportFormatsCurlyWhirlyText'),
          tags: ['pca'],
          link: 'https://ics.hutton.ac.uk/curlywhirly'
        },
        strudel: {
          name: 'Strudel',
          logo: 'tools/strudel.png',
          text: () => this.$t('pageExportFormatsStrudelText'),
          tags: ['genotype'],
          link: 'https://ics.hutton.ac.uk/strudel'
        },
        excel: {
          name: 'Excel',
          logo: 'tools/excel.svg',
          text: () => this.$t('pageExportFormatsExcelText'),
          tags: ['genotype', 'phenotype'],
          link: 'https://products.office.com/excel'
        }
      },
      dataTypes: {
        'char_': {
          text: () => this.$t('dataTypeChar'),
          icon: 'mdi-alphabetical',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          databaseValue: 'char'
        },
        'int_': {
          text: () => this.$t('dataTypeInt'),
          icon: 'mdi-number',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          databaseValue: 'int'
        },
        'float_': {
          text: () => this.$t('dataTypeFloat'),
          icon: 'mdi-decimal',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          databaseValue: 'float'
        }
      },
      entityTypes: {
        'Accession': {
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('entityTypeAccession')
        },
        'Plant/Plot': {
          icon: 'mdi-grid',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('entityTypePlantPlot')
        },
        'Sample': {
          icon: 'mdi-leaf',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('entityTypeSample')
        }
      },
      groupTypes: {
        germinatebase: {
          icon: 'mdi-sprout',
          apiName: 'germplasm',
          itemType: 'germplasm',
          idColumn: 'germplasmId',
          nameColumn: 'germplasmName',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          icon: 'mdi-dna',
          apiName: 'marker',
          itemType: 'markers',
          idColumn: 'markerId',
          nameColumn: 'markerName',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          icon: 'mdi-map-marker',
          apiName: 'location',
          itemType: 'locations',
          idColumn: 'locationId',
          nameColumn: 'locationName',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeLocation')
        }
      },
      markedItemTypes: {
        germplasm: {
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          icon: 'mdi-dna',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          icon: 'mdi-map-marker',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeLocation')
        }
      },
      imageTypes: {
        germinatebase: {
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('imageTypeGerminatebase')
        },
        compounds: {
          icon: 'mdi-flask',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('imageTypeCompounds')
        },
        phenotypes: {
          icon: 'mdi-tag-text-outline',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('imageTypePhenotypes')
        }
      },
      locationTypes: {
        trialsite: {
          icon: 'mdi-shovel',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('locationTypeTrialsite')
        },
        collectingsites: {
          icon: 'mdi-basket-fill',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('locationTypeCollectingsite')
        },
        datasets: {
          icon: 'mdi-database',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('locationTypeDataset')
        }
      },
      datasetTypes: {
        allelefreq: {
          id: 4,
          icon: 'mdi-pulse',
          pageName: 'export-allelefrequency',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeAllelefreq')
        },
        climate: {
          id: 5,
          icon: 'mdi-weather-snowy-rainy',
          pageName: 'export-climate',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeClimate')
        },
        compound: {
          id: 6,
          icon: 'mdi-flask',
          pageName: 'export-compounds',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeCompound')
        },
        genotype: {
          id: 1,
          icon: 'mdi-dna',
          pageName: 'export-genotypes',
          color: () => this.serverSettings.colorsTemplate[3 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeGenotype')
        },
        trials: {
          id: 3,
          icon: 'mdi-shovel',
          pageName: 'export-trials',
          color: () => this.serverSettings.colorsTemplate[4 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeTrials')
        },
        unknown: {
          id: -1,
          icon: 'mdi-help-box',
          color: () => this.serverSettings.colorsTemplate[5 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeUnknown')
        }
      }
    }
  },
  methods: {
    userIsAtLeast: function (userType, atLeast) {
      switch (atLeast) {
        case 'Administrator':
          return userType === 'Administrator'
        case 'Data Curator':
          return userType === 'Administrator' || userType === 'Data Curator'
        case 'Regular User':
          return userType === 'Administrator' || userType === 'Data Curator' || userType === 'Regular User'
      }

      return false
    },
    getWindowWidth: function () {
      return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      )
    },
    isTableColumnHidden: function (tableName, columnKey) {
      if (this.hiddenColumns[tableName]) {
        return (this.hiddenColumns[tableName].indexOf(columnKey) !== -1) ? 'd-none' : ''
      } else {
        console.log(tableName, columnKey)
        return ''
      }
    },
    getNumberWithSuffix: function (value, decimals = 2) {
      if (value === undefined || value === null || value === 0) {
        return '0'
      }

      const k = 1000
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

      const i = Math.floor(Math.log(value) / Math.log(k))

      return parseFloat((value / Math.pow(k, i)).toFixed(dm)) + sizes[i]
    },
    createColorGradient: function (one, two, steps) {
      var oneRgb = this.hexToRgb(one)
      var twoRgb = this.hexToRgb(two)

      var result = []
      for (var i = 0; i < steps; i++) {
        var iNorm = i / (steps - 1)
        result.push(this.rgbToHex(
          Math.floor(oneRgb.r + iNorm * (twoRgb.r - oneRgb.r)),
          Math.floor(oneRgb.g + iNorm * (twoRgb.g - oneRgb.g)),
          Math.floor(oneRgb.b + iNorm * (twoRgb.b - oneRgb.b))
        ))
      }
      return result
    },
    hexToRgb: function (hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    },
    rgbToHex: function (r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    },
    isPageAvailable: function (name) {
      if (this.serverSettings != null && this.serverSettings.hiddenPages != null) {
        return this.serverSettings.hiddenPages.indexOf(name) === -1
      } else {
        return true
      }
    },
    downloadBlob: function (object) {
      if (!object || !object.blob) {
        return
      }

      var extension = object.extension

      var url = window.URL.createObjectURL(object.blob)

      var downloadLink = document.createElement('a')
      downloadLink.href = url
      if (object.filename && extension) {
        downloadLink.download = object.filename + '.' + extension
      }
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      this.$ga.event('download', 'data', object.filename + '.' + extension)
    },
    downloadSvgsFromContainer: function (container, isPlotly, filename) {
      // get svg source.
      var serializer = new XMLSerializer()
      var svgs = isPlotly ? container.querySelectorAll('svg:not(.icon):not(:last-child)') : container.querySelectorAll('svg')
      var source = '<?xml version="1.0" standalone="no"?>\r\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'

      svgs.forEach(s => {
        // serializer.serializeToString(s)
        var children = s.children
        for (var i = 0; i < children.length; i++) {
          source += serializer.serializeToString(children[i]) + '\r\n'
        }
      })

      source += '</svg>'

      // convert svg source to URI data scheme.
      var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)

      var downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.download = filename + '.svg'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      this.$ga.event('download', 'svg', filename + '.svg')
    },
    toUrlString: function (params) {
      return Object.keys(params).filter(function (key) {
        return params[key] !== undefined && params[key] !== null
      }).map(function (key) {
        return params[key] ? (key + '=' + encodeURIComponent(params[key])) : ''
      }).join('&')
    },
    uuidv4: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0
        var v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    getHighContrastTextColor: function (backgroundColor) {
      const rgb = this.hexToRgb(backgroundColor)
      var o = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000)
      return (o > 125) ? 'black' : 'white'
    },
    getPaginationTexts () {
      return {
        count: this.$t('paginationCount'),
        first: this.$t('paginationFirst'),
        last: this.$t('paginationLast'),
        filter: this.$t('paginationFilter'),
        filterPlaceholder: this.$t('paginationFilterPlaceholder'),
        limit: this.$t('paginationLimit'),
        page: this.$t('paginationPage'),
        noResults: this.$t('paginationNoResult'),
        filterBy: this.$t('paginationFilterBy'),
        loading: this.$t('paginationLoading'),
        defaultOption: this.$t('paginationDefaultOption'),
        columns: this.$t('paginationColumns')
      }
    },
    /**
     * This is the default error method that gets called if no other error handler is defined for the error code that caused it.
     * @param {*} error The error response object
     */
    handleError: function (error) {
      EventBus.$emit('show-loading', false)
      var variant = 'danger'
      var title = this.$t('genericError')
      var message = error.statusText

      if (error.data && error.data.reasonPhrase && this.gatekeeperErrors[error.data.reasonPhrase]) {
        message = this.$t(this.gatekeeperErrors[error.data.reasonPhrase])
      } else {
        switch (error.status) {
          case 400:
            message = this.$t('httpErrorFourOO')
            break
          case 401:
            message = this.$t('httpErrorFourOOne')
            break
          case 403:
            message = this.$t('httpErrorFourOThree')
            this.$store.dispatch('ON_TOKEN_CHANGED', null)
            var authMode = this.serverSettings.authMode
            if (authMode === 'FULL') {
              this.$router.push({ name: 'login' })
            } else if (authMode === 'SELECTIVE') {
              EventBus.$emit('on-show-login-form')
            }
            return
          case 404:
            message = this.$t('httpErrorFourOFour')
            break
          case 405:
            message = this.$t('httpErrorFourOFour')
            break
          case 408:
            message = this.$t('httpErrorFourOEight')
            break
          case 409:
            message = this.$t('httpErrorFourONine')
            break
          case 410:
            message = this.$t('httpErrorFourTen')
            break
          case 500:
            message = this.$t('httpErrorFiveOO')
            break
          case 501:
            message = this.$t('httpErrorFiveOOne')
            break
          case 503:
            message = this.$t('httpErrorFiveOThree')
            break
        }
      }

      this.$ga.exception(error.status + ' ' + message)

      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        autoHideDelay: 5000,
        appendToast: true
      })
    },
    authForm ({ url = null, formData, success = null, error = { codes: [], callback: this.handleError } }) {
      var vm = this

      const promise = axios.post(url, formData, {
        crossDomain: true,
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + this.getToken()
        }
      })

      promise.then(function (result) {
        var t = vm.$store.getters.token

        // Check if the token is still valid. Renew it if so.
        if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
          t.createdOn = new Date().getTime()
          vm.$store.dispatch('ON_TOKEN_CHANGED', t)
        }

        if (success) {
          success(result.data)
        }
      })

      promise.catch(function (err) {
        if (err.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          // Log the user out if the result is forbidden and no error method has been provided
          // Otherwise, we assume that the calling method takes care of the error
          if (!error) {
            if (err.response.status === 403) {
              vm.$store.dispatch('ON_TOKEN_CHANGED', null)
              var authMode = vm.$store.getters.serverSettings.authMode
              if (authMode === 'FULL') {
                vm.$router.push({ name: 'login' })
              } else if (authMode === 'SELECTIVE') {
                EventBus.$emit('on-show-login-form')
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          } else if (error && error.callback) {
            if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
              error.callback(err.response)
            } else {
              vm.handleError(err.response)
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.error(error)
          }
        } else if (err.request) {
          // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
          if (err.request.textStatus === 'timeout') {
            vm.$bvToast.toast('Request to the server timed out.', {
              title: 'Error',
              variant: 'danger',
              autoHideDelay: 5000,
              appendToast: true
            })
          }
        } else {
          // Something happened in setting up the request that triggered an Error
          if (process.env.NODE_ENV === 'development') {
            console.error(err)
          }
        }
      })

      return promise
    },
    authAjax ({ url = null, method = 'GET', data = null, formData = null, dataType = 'json', contentType = 'application/json; charset=utf-8', success = null, error = { codes: [], callback: this.handleError } }) {
      var vm = this
      var requestData = null
      var requestParams = null

      // Stringify the data object for non-GET requests
      if (data !== null || data !== undefined) {
        if (method === 'GET') {
          requestParams = data
        } else {
          requestData = data
        }
      }

      const promise = axios({
        url: url,
        method: method,
        data: requestData,
        formData: formData,
        params: requestParams,
        crossDomain: true,
        responseType: dataType,
        withCredentials: true,
        headers: {
          'Content-Type': contentType,
          'Authorization': 'Bearer ' + this.getToken()
        }
      })

      promise.then(function (result) {
        var t = vm.$store.getters.token

        // Check if the token is still valid. Renew it if so.
        if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
          t.createdOn = new Date().getTime()
          vm.$store.dispatch('ON_TOKEN_CHANGED', t)
        }

        if (success) {
          if (dataType === 'blob' && result.headers && result.headers['content-disposition']) {
            const filename = result.headers['content-disposition']
              .split(';')
              .map(p => p.trim())
              .filter(p => p.indexOf('filename') === 0)
              .map(p => p.replace('filename=', ''))

            if (filename && filename.length > 0) {
              result.data.filename = filename[0]
            }
          }

          success(result.data)
        }
      })

      promise.catch(function (err) {
        if (err.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          // Log the user out if the result is forbidden and no error method has been provided
          // Otherwise, we assume that the calling method takes care of the error
          if (!error) {
            if (err.response.status === 403) {
              vm.$store.dispatch('ON_TOKEN_CHANGED', null)
              var authMode = vm.$store.getters.serverSettings.authMode
              if (authMode === 'FULL') {
                vm.$router.push({ name: 'login' })
              } else if (authMode === 'SELECTIVE') {
                EventBus.$emit('on-show-login-form')
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          } else if (error && error.callback) {
            if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
              error.callback(err.response)
            } else {
              vm.handleError(err.response)
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.error(error)
          }
        } else if (err.request) {
          // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
          if (err.request.textStatus === 'timeout') {
            vm.$bvToast.toast('Request to the server timed out.', {
              title: 'Error',
              variant: 'danger',
              autoHideDelay: 5000,
              appendToast: true
            })
          }
        } else {
          // Something happened in setting up the request that triggered an Error
          if (process.env.NODE_ENV === 'development') {
            console.error(err)
          }
        }

        throw err
      })

      return promise
    },
    getToken () {
      var t = this.$store.getters.token

      // Check if the token is still valid
      if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) > t.lifetime)) {
        t = null
        this.$store.dispatch('ON_TOKEN_CHANGED', t)
      }

      return t ? t.token : null
    }
  }
}
