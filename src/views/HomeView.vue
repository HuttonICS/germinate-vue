<template>
  <div>
    <b-row class="dashboard-stats" v-if="stats">
      <!-- Banner buttons -->
      <b-col cols=12 sm=6 xl=3 v-for="(category, index) in dashboardCategories" :key="'dashboard-stats-' + category.value" class="my-2">
        <BannerCard :templateColorIndex="index" :title="category.textI18n" :numericValue="stats[category.value]" :link="category.link" :linkParams="category.params" :iconPath="category.path" />
      </b-col>
    </b-row>

    <!-- Images -->
    <ImageCarousel class="my-3" />

    <!-- Heading and welcome text -->
    <h1>{{ $t('pageDashboardTitle') }}</h1>

    <HtmlTemplateEditor i18nKey="pageDashboardText" />

    <!-- Publications -->
    <div v-if="showPublicationSection && (showPublications || (storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_DATA_CURATOR)))" class="mb-4">
      <h2>{{ $t('pageDashboardPublicationsTitle') }}</h2>
      <p>{{ $t('pageDashboardPublicationsText') }}</p>

      <PublicationsWidget referenceType="database" @publication-count-changed="count => showPublications = count > 0"/>
    </div>

    <template v-if="showDataStorySection && (showStories || (storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_DATA_CURATOR)))">
      <h1>{{ $t('pageStoriesTitle') }}</h1>
      <DataStoryWidget :filterOn="storyFilterOn" @story-count-changed="updateStories" />
    </template>

    <!-- Introduction tour -->
    <b-button variant="primary" @click="startIntroduction">
      <MdiIcon :path="mdiPresentationPlay" /> {{ $t('widgetIntroTourButtonText') }}
    </b-button>

    <hr />
    <!-- News -->
    <NewsSection :projectCount="4" :newsCount="4" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import BannerCard from '@/components/util/BannerCard'
import DataStoryWidget from '@/components/util/DataStoryWidget'
import ImageCarousel from '@/components/images/ImageCarousel'
import MdiIcon from '@/components/icons/MdiIcon'
import NewsSection from '@/components/news/NewsSection'
import PublicationsWidget from '@/components/util/PublicationsWidget'
import HtmlTemplateEditor from '@/components/util/HtmlTemplateEditor'

import { apiGetOverviewStats } from '@/mixins/api/stats'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { statCategories } from '@/mixins/types'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR, USER_TYPE_ADMINISTRATOR } from '@/mixins/api/auth'

import { mdiPresentationPlay } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BannerCard,
    DataStoryWidget,
    ImageCarousel,
    MdiIcon,
    NewsSection,
    PublicationsWidget,
    HtmlTemplateEditor
  },
  data: function () {
    return {
      mdiPresentationPlay,
      stats: null,
      showPublications: true,
      showStories: true,
      storyFilterOn: [{
        column: 'storyFeatured',
        comparator: 'equals',
        operator: 'and',
        values: [1]
      }],
      USER_TYPE_DATA_CURATOR,
      USER_TYPE_ADMINISTRATOR
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeToken'
    ]),
    dashboardCategories: function () {
      if (this.storeServerSettings && this.storeServerSettings.dashboardCategories) {
        return statCategories.filter(d => this.storeServerSettings.dashboardCategories.indexOf(d.value) !== -1)
      } else {
        return statCategories
      }
    },
    showPublicationSection: function () {
      if (this.storeServerSettings && this.storeServerSettings.dashboardSections) {
        return this.storeServerSettings.dashboardSections.includes('publications')
      } else {
        return true
      }
    },
    showDataStorySection: function () {
      if (this.storeServerSettings && this.storeServerSettings.dashboardSections) {
        return this.storeServerSettings.dashboardSections.includes('datastories')
      } else {
        return true
      }
    }
  },
  methods: {
    userIsAtLeast,
    getNumberWithSuffix,
    startIntroduction: function () {
      emitter.emit('show-introduction')
    },
    isDisabled: function (routerPage) {
      return this.storeServerSettings && this.storeServerSettings.hiddenPages.indexOf(routerPage) !== -1
    },
    updateStories: function (count) {
      this.showStories = count > 0
    }
  },
  mounted: function () {
    apiGetOverviewStats(result => {
      this.stats = result
    })
  }
}
</script>

<style>
</style>
