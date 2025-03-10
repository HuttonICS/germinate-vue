<template>
  <div>
    <h1>{{ $t('pageLocationsTitle') }}</h1>
    <p>{{ $t('pageLocationsText') }}</p>
    <!-- All locations in a table -->
    <LocationTable :getData="getData"
                   :getIds="getIds"
                   :downloadTable="downloadData"
                   v-on:data-changed="onDataChanged" />

    <h2>{{ $t('pageLocationsMapsTitle') }}</h2>
    <p class="text-info">{{ $t('pageLocationsMapsText') }}</p>

    <b-row v-if="locationsWithLatLng && locationsWithLatLng.length > 0">
      <b-col cols=12 xl=6 order-xl="0">
        <h3>{{ $t('pageLocationsMapsClusteredTitle') }}</h3>
        <p>{{ $t('pageLocationsMapsClusteredText') }}</p>
      </b-col>
      <b-col cols=12 xl=6 order-xl="2">
        <!-- Clustered location map -->
        <LocationMap :locations="locationsWithLatLng" mapType="cluster" class="mb-3" v-on:map-loaded="map => { clusteredMap = map }" />
      </b-col>
      <b-col cols=12 xl=6  order-xl="1">
        <h3>{{ $t('pageLocationsMapsHeatmappedTitle') }}</h3>
        <p>{{ $t('pageLocationsMapsHeatmappedText') }}</p>
      </b-col>
      <b-col cols=12 xl=6  order-xl="3">
        <!-- Heatmapped location map -->
        <LocationMap :locations="locationsWithLatLng" mapType="heatmap" class="mb-3" v-on:map-loaded="map => { heatmappedMap = map }" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import LocationMap from '@/components/map/LocationMap'
import LocationTable from '@/components/tables/LocationTable'
import { apiPostLocationTable, apiPostLocationTableIds } from '@/mixins/api/location.js'
import { apiPostTableExport } from '@/mixins/api/misc.js'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

export default {
  data: function () {
    return {
      locations: null,
      clusteredMap: null,
      heatmappedMap: null,
      synced: false
    }
  },
  computed: {
    locationsWithLatLng: function () {
      if (this.locations) {
        return this.locations.filter(l => l.locationLatitude !== undefined && l.locationLatitude !== null && l.locationLongitude !== undefined && l.locationLongitude !== null)
      } else {
        return []
      }
    }
  },
  watch: {
    clusteredMap: function () {
      // Synchronize the maps
      if (this.synced === false && this.clusteredMap && this.heatmappedMap) {
        this.synced = true
        this.clusteredMap.sync(this.heatmappedMap)
        this.heatmappedMap.sync(this.clusteredMap)
      }
    },
    heatmappedMap: function () {
      // Synchronize the maps
      if (this.synced === false && this.clusteredMap && this.heatmappedMap) {
        this.synced = true
        this.heatmappedMap.sync(this.clusteredMap)
        this.clusteredMap.sync(this.heatmappedMap)
      }
    }
  },
  components: {
    LocationMap,
    LocationTable
  },
  methods: {
    getData: function (data, callback) {
      return apiPostLocationTable(data, callback)
    },
    downloadData: function (data, callback) {
      return apiPostTableExport({ filter: data.filter }, 'location', callback)
    },
    getIds: function (data, callback) {
      return apiPostLocationTableIds(data, callback)
    },
    onDataChanged: function (request) {
      // If something changed, we're going to only show the locations in the table on the map
      if (!this.locations) {
        // Create a custom request based on the one from the table, but change limit and page to get all the locations
        const customRequest = Object.assign({}, request)
        customRequest.limit = MAX_JAVA_INTEGER
        customRequest.page = 1
        apiPostLocationTable(customRequest, result => {
          this.locations = result.data
        })
      }
    }
  }
}
</script>

<style>

</style>
