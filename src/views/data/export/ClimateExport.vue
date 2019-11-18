<template>
  <div>
    <h1>{{ $t('pageClimateExportTitle') }}</h1>
    <template v-if="datasets && datasets.length > 0">
      <hr />
      <h2>{{ $t('widgetSelectedDatasetsTitle') }}</h2>
      <ul>
        <li v-for="dataset in datasets" :key="`dataset-list-${dataset.datasetId}`">{{ dataset.datasetId + ' - ' + dataset.datasetName }}</li>
      </ul>
      <b-row class="climate-tabs" v-if="tabs">
        <b-col cols=12 sm=6 xl=3 v-for="(tab, index) in tabs" :key="'climate-tabs-' + tab.key">
          <a href="#" @click.prevent="tab.onSelection">
            <b-card no-body :style="`border: 1px solid ${getColor(index)}; filter: ${getFilter(index)};`">
              <b-card-body :style="`background-color: ${getColor(index)}; color: white;`">
                <b-row>
                  <b-col cols=12 class="text-center">
                    <i :class="`mdi mdi-48px ${tab.icon}`" />
                  </b-col>
                </b-row>
              </b-card-body>
              <b-card-footer :style="`color: ${getColor(index)}`">
                <i class="mdi mdi-18px mdi-arrow-right-bold-circle" /><span> {{ tab.text() }}</span>
              </b-card-footer>
            </b-card>
          </a>
        </b-col>
      </b-row>
      <BoxplotSelection :datasetIds="datasetIds"
                        v-bind="config"
                        :texts="textsChart"
                        :getItems="getClimates"
                        v-show="currentTab === 'overview'" />
      <ClimateExportChartSelection :datasetIds="datasetIds"
                                   v-bind="config"
                                   :texts="textsChart"
                                   :getItems="getClimates"
                                   v-show="currentTab === 'matrix'"/>
      <ClimateDataTable :getData="getClimateData" :getIds="getClimateDataIds" :downloadTable="downloadClimateDataTable" v-show="currentTab === 'table'" />
      <ExportDownloadSelection :datasetIds="datasetIds"
                               v-bind="config"
                               :texts="textsExport"
                               :getItems="getClimates"
                               v-show="currentTab === 'export'" />
    </template>
    <h2 v-else>{{ $t('headingNoData') }}</h2>
  </div>
</template>

<script>
import BoxplotSelection from '@/components/export/BoxplotSelection'
import ClimateDataTable from '@/components/tables/ClimateDataTable'
import ClimateExportChartSelection from '@/components/export/ClimateExportChartSelection'
import ExportDownloadSelection from '@/components/export/ExportDownloadSelection'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  props: [ 'datasetIds' ],
  data: function () {
    return {
      datasets: null,
      climates: null,
      config: {
        idKey: 'climateId',
        nameKey: 'climateName',
        downloadKey: 'climate',
        itemType: 'locations',
        xType: 'climates',
        groupType: 'locations',
        experimentType: 'climate'
      },
      textsChart: {
        boxplotTitle: 'pageClimateExportClimateBoxplotTitle',
        boxplotText: 'pageClimateExportClimateBoxplotText',
        exportTitle: 'pageClimateExportSelectClimateTitle',
        exportText: 'pageClimateExportSelectClimateChartText',
        groupTitle: 'pageClimateExportSelectGroupTitle',
        groupText: 'pageClimateExportSelectGroupChartText',
        groupTooltip: 'pageExportSelectGroupTooltip',
        exportButton: 'buttonPlot'
      },
      textsExport: {
        exportTitle: 'pageClimateExportSelectClimateTitle',
        exportText: 'pageClimateExportSelectClimateExportText',
        groupTitle: 'pageClimateExportSelectGroupTitle',
        groupText: 'pageClimateExportSelectGroupExportText',
        groupTooltip: 'pageExportSelectGroupTooltip',
        exportButton: 'buttonExport'
      },
      currentTab: 'overview',
      tabs: [{
        key: 'overview',
        text: () => this.$t('pageDataExportTabDataStatistics'),
        icon: 'mdi-eye',
        onSelection: () => this.tabSelected('overview')
      }, {
        key: 'matrix',
        text: () => this.$t('pageDataExportTabDataMatrix'),
        icon: 'mdi-grid',
        onSelection: () => this.tabSelected('matrix')
      }, {
        key: 'table',
        text: () => this.$t('pageDataExportTabDataTable'),
        icon: 'mdi-table-search',
        onSelection: () => this.tabSelected('table')
      }, {
        key: 'export',
        text: () => this.$t('pageDataExportTabDataExport'),
        icon: 'mdi-file-download-outline',
        onSelection: () => this.tabSelected('export')
      }]
    }
  },
  components: {
    BoxplotSelection,
    ClimateDataTable,
    ClimateExportChartSelection,
    ExportDownloadSelection
  },
  methods: {
    getClimates: function (callback) {
      callback(this.climates)
    },
    downloadClimateDataTable: function (data, callback) {
      return this.apiPostTableExport(data, 'dataset/data/climate', callback)
    },
    getClimateData: function (data, callback) {
      data.datasetIds = this.datasetIds
      return this.apiPostClimateDataTable(data, callback)
    },
    getClimateDataIds: function (data, callback) {
      data.datasetIds = this.datasetIds
      return this.apiPostClimateDataTableIds(data, callback)
    },
    tabSelected: function (tab) {
      this.currentTab = tab
    },
    getFilter: function (index) {
      return this.tabs[index].key === this.currentTab ? '' : 'brightness(75%)'
    },
    getColor: function (index) {
      if (!this.serverSettings || !this.serverSettings.colorsTemplate) {
        return '#00acef'
      } else {
        const colors = this.serverSettings.colorsTemplate
        return colors[index % colors.length]
      }
    },
    redirectBack: function () {
      this.$store.dispatch('ON_TABLE_FILTERING_CHANGED', [{
        column: {
          name: 'datasetId',
          type: Number
        },
        comparator: 'inSet',
        operator: 'and',
        values: this.datasetIds
      }])
      this.$nextTick(() => this.$router.push({ name: 'export', params: { experimentType: 'trials' } }))
    },
    isAccepted: function (dataset) {
      if (this.token) {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(this.token.id) !== -1
      } else {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(-1000) !== -1
      }
    },
    getDatasets: function () {
      const request = {
        page: 1,
        limit: this.JAVA_MAX_INTEGER,
        filter: [{
          column: 'experimentType',
          comparator: 'equals',
          operator: 'and',
          values: ['climate']
        }, {
          column: 'isExternal',
          comparator: 'equals',
          operator: 'and',
          values: [0]
        }, {
          column: 'datasetId',
          comparator: 'inSet',
          operator: 'and',
          values: this.datasetIds
        }]
      }

      this.apiPostDatasetTable(request, result => {
        this.datasets = result.data.filter(d => {
          return (!d.licenseName || this.isAccepted(d))
        })

        if (this.datasets.length < 1) {
          this.redirectBack()
        }
      }, {
        codes: [404],
        callback: () => {
          this.redirectBack()
        }
      })
    }
  },
  mounted: function () {
    EventBus.$emit('show-loading', true)
    this.apiPostDatasetClimates(this.datasetIds, result => {
      this.climates = result

      this.getDatasets()
      EventBus.$emit('show-loading', false)
    })
  }
}
</script>

<style>
.climate-tabs *:hover {
  text-decoration: none;
}
.climate-tabs .card-footer i.mdi {
  vertical-align: sub;
}
.climate-tabs .card,
.climate-tabs .card * {
  transition: filter 0.15s;
}
</style>