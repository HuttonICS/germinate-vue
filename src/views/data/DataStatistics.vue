<template>
  <div>
    <h1>Data statistics<small> - A summary of all the data in Germinate</small></h1>
    <hr />
    <b-row>
      <b-col cols=12 sm=6>
        <h2>{{ $t('pageStatisticsTaxonomyTitle') }}</h2>
        <p>{{ $t('pageStatisticsTaxonomyText') }}</p>
        <TaxonomyPieChart />
      </b-col>
      <b-col cols=12 sm=6>
        <h2>{{ $t('pageStatisticsBiologicalStatusTitle') }}</h2>
        <p>{{ $t('pageStatisticsBiologicalStatusText') }}</p>
        <BarChart xColumn="biologicalstatus"
                  :xTitle="$t('pageStatisticsBiologicalStatusXAxis')"
                  :yTitle="$t('genericCount')"
                  downloadName="biological-status"
                  :sourceFile="biologicalstatusFile"
                  v-on:bar-clicked="biologicalStatusClicked" />
      </b-col>
    </b-row>
    <h2>{{ $t('pageStatisticsPdciTitle') }}</h2>
    <p v-html="$t('pagePassportPdciModal')" />
    <BarChart xColumn="bin"
              xTitle="PDCI"
              :yTitle="$t('genericCount')"
              downloadName="pdci"
              :sourceFile="pdciFile"
              v-on:bar-clicked="pdciClicked" />

    <h2>{{ $t('pageStatisticsLocationsTitle') }}</h2>
    <p>{{ $t('pageStatisticsLocationsText') }}</p>
    <ChoroplethChart />

    <h2>{{ $t('pageStatisticsDatasetTitle') }}</h2>
    <p>{{ $t('pageStatisticsDatasetText') }}</p>
    <BarChart xColumn="ExperimentType"
              xTitle="Experiment type"
              yTitle="Data points"
              downloadName="datasets"
              :sourceFile="datasetsFile"
              v-on:bar-clicked="datasetClicked" />
  </div>
</template>

<script>
import BarChart from '@/components/charts/BarChart'
import ChoroplethChart from '@/components/charts/ChoroplethChart'
import TaxonomyPieChart from '@/components/charts/TaxonomyPieChart'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  data: function () {
    return {
      biologicalstatusFile: null,
      datasetsFile: null,
      pdciFile: null
    }
  },
  components: {
    BarChart,
    ChoroplethChart,
    TaxonomyPieChart
  },
  methods: {
    biologicalStatusClicked: function (status) {
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'biologicalStatusName',
          type: String
        },
        comparator: 'contains',
        operator: 'and',
        values: [status + '%']
      }])
      this.$router.push({ name: 'germplasm' })
    },
    pdciClicked: function (bar) {
      const parts = bar.split('-')
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'pdci',
          type: Number
        },
        comparator: 'between',
        operator: 'and',
        values: parts
      }])
      this.$router.push({ name: 'germplasm' })
    },
    datasetClicked: function (dataset) {
      this.$router.push({ name: 'export', params: { experimentType: dataset } })
    }
  },
  mounted: function () {
    EventBus.$emit('show-loading', true)
    const p1 = this.apiGetStatsFile('biologicalstatus', result => {
      this.biologicalstatusFile = result
    })
    const p2 = this.apiGetStatsFile('pdci', result => {
      this.pdciFile = result
    })
    const p3 = this.apiGetStatsFile('dataset', result => {
      this.datasetsFile = result
    })

    // When they're all done (either successful or not), hide the loading indicator
    Promise.all([p1, p2, p3])
      .finally(() => EventBus.$emit('show-loading', false))
  }
}
</script>

<style>

</style>