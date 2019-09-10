<template>
  <div>
    <l-map
      class="location-map"
      :center="center"
      v-if="locations && locations.length > 0"
      ref="map"
      :maxZoom="maxZoom"
      :zoom="zoom">
    </l-map>
    <div v-if="location" ref="popupContent">
      <dl class="row">
        <dt class="col-3 text-right">Location</dt>
        <dd class="col-9">
          <router-link to="/data/datasets" v-if="location.locationType === 'datasets'" @click.native="navigateToDatasets(location)" event="">{{ location.locationName }}</router-link>
          <router-link to="/data/germplasm" v-else-if="location.locationType === 'collectingsites'" @click.native="navigateToGermplasm(location)" event="">{{ location.locationName }}</router-link>
          <span v-else>{{ location.locationName }}</span>
        </dd>
        <dt class="col-3 text-right">Type</dt><dd class="col-9"><i :class="`mdi mdi-18px ${locationTypes[location.locationType].icon} fix-alignment`" :style="`color: ${locationTypes[location.locationType].color()};`" /> {{ this.locationTypes[location.locationType].text() }}</dd>
        <dt class="col-3 text-right">Country</dt><dd class="col-9"><i :class="'flag-icon flag-icon-' + getFlag(location)" /> {{ getCountry(location) }}</dd>
        <dt class="col-3 text-right">Latitude</dt><dd class="col-9">{{ location.locationLatitude.toFixed(2) }}</dd>
        <dt class="col-3 text-right">Longitude</dt><dd class="col-9">{{ location.locationLongitude.toFixed(2) }}</dd>
        <template v-if="location.locationElevation"><dt class="col-3 text-right">Elevation</dt><dd class="col-9">{{ location.locationElevation.toFixed(2) }}</dd></template>
      </dl>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
require('leaflet.heat')
require('leaflet.sync')
require('leaflet.markercluster')
var countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export default {
  data: function () {
    return {
      zoom: 3,
      maxZoom: 12,
      center: [22.5937, 2.1094],
      heat: null,
      location: null,
      markerClusterer: null
    }
  },
  props: {
    locations: {
      type: Array,
      default: null
    },
    mapType: {
      type: String,
      default: 'cluster'
    }
  },
  watch: {
    locations: function (newValue, oldValue) {
      this.updateCenter()
    }
  },
  methods: {
    navigateToGermplasm: function (location) {
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'location',
          type: String
        },
        comparator: 'equals',
        operator: 'and',
        values: [location.locationName]
      }])
      this.$router.push({ path: '/data/germplasm' })
    },
    navigateToDatasets: function (location) {
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'location',
          type: String
        },
        comparator: 'equals',
        operator: 'and',
        values: [location.locationName]
      }])
      this.$router.push({ path: '/data/datasets' })
    },
    getFlag: function (country) {
      if (country.countryCode2) {
        return country.countryCode2.toLowerCase()
      } else if (country.countryCode3) {
        return countries.alpha3ToAlpha2(country.countryCode3).toLowerCase()
      } else {
        return ''
      }
    },
    getCountry: function (country) {
      if (country.countryCode2) {
        return countries.getName(country.countryCode2.toUpperCase(), 'en')
      } else if (country.countryCode3) {
        return countries.getName(country.countryCode3.toUpperCase(), 'en')
      } else {
        return ''
      }
    },
    updateCenter: function () {
      var map = this.$refs.map.mapObject
      if (this.locations.length === 1) {
        // If there's just one location, center it and open the popup
        this.location = this.locations[0]
        this.center = [this.location.locationLatitude, this.location.locationLongitude]

        var marker = L.marker([this.location.locationLatitude, this.location.locationLongitude]).bindPopup('')
        marker.on('click', e => {
          var popup = e.target.getPopup()
          this.location = this.location
          this.$nextTick(() => popup.setContent(this.$refs.popupContent))
        })
        marker.addTo(map)
        marker.fire('click')
      } else {
        // If there are multiple locations, fit them into view
        var latLngBounds = L.latLngBounds()

        this.locations.forEach(l => latLngBounds.extend([l.locationLatitude, l.locationLongitude]))

        this.$refs.map.fitBounds(latLngBounds.pad(0.1))
      }

      if (this.mapType === 'cluster') {
        if (this.markerClusterer) {
          // If it exists, clear all layers
          this.markerClusterer.clearLayers()
        } else {
          // If it doesn't create it
          this.markerClusterer = L.markerClusterGroup()
          map.addLayer(this.markerClusterer)
        }
        this.locations.forEach(l => {
          var marker = L.marker([l.locationLatitude, l.locationLongitude]).bindPopup('')
          marker.on('click', e => {
            var popup = e.target.getPopup()
            this.location = l
            this.$nextTick(() => popup.setContent(this.$refs.popupContent))
          })
          this.markerClusterer.addLayer(marker)
        })
      } else if (this.mapType === 'heatmap') {
        var ls = this.locations.map(l => [l.locationLatitude, l.locationLongitude, 1])
        if (this.heat) {
          // If it exists, just set it
          this.heat.setLatLngs(ls)
        } else {
          // Otherwise, create it
          this.heat = L.heatLayer(ls, {
            minOpacity: 0.4,
            max: 1,
            radius: 10,
            blur: 10,
            gradient: {
              0.3: '#000000',
              0.44: '#570000',
              0.58: '#ff0000',
              0.72: '#ffc800',
              0.86: '#ffff00',
              1.0: '#ffffff'
            }
          }).addTo(this.$refs.map.mapObject)
        }
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      var openstreetmap = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        id: 'OpenStreetMap',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c']
      })

      var map = this.$refs.map.mapObject

      map.addLayer(openstreetmap)

      var satellite = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        id: 'Esri WorldImagery',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })

      var baseMaps = {
        'OpenStreetMap': openstreetmap,
        'Esri WorldImagery': satellite
      }

      L.control.layers(baseMaps).addTo(map)

      this.updateCenter()

      // Disable zoom until focus gained, disable when blur
      map.scrollWheelZoom.disable()
      map.on('focus', function () {
        map.scrollWheelZoom.enable()
      })
      map.on('blur', function () {
        map.scrollWheelZoom.disable()
      })

      this.$emit('map-loaded', map)
    })
  }
}
</script>

<style>
.location-map {
  height: 500px !important;
}
.leaflet-popup-content-wrapper {
    border-radius: 0;
    border-radius: 4px;
  }
.leaflet-popup-content {
  width: 300px !important;
}
</style>