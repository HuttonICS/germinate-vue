<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="pedigreeDefinitionTable"
               v-on="$listeners">
      <!-- Pedigree notation URL -->
      <template v-slot:cell(pedigreeNotationUrl)="data">
        <span v-if="data.item.pedigreeNotationUrl">
          <a :href="toUrl(data.item.pedigreeNotationUrl)" rel="nofollow" v-if="toUrl(data.item.pedigreeNotationUrl)">{{ data.item.pedigreeNotationUrl }}</a>
          <span v-else>{{ data.item.pedigreeNotationUrl }}</span>
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'PedigreeDefinitionTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
      options: {
        idColumn: 'germplasmId',
        tableName: 'pedigreedefinitions'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'germplasmId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'germplasmId')}`,
          label: this.$t('tableColumnGermplasmId')
        }, {
          key: 'germplasmName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'germplasmName')}`,
          label: this.$t('tableColumnGermplasmName')
        }, {
          key: 'pedigreeNotationName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'pedigreeNotationName')}`,
          label: this.$t('tableColumnPedigreeNotationName')
        }, {
          key: 'pedigreeNotationDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'pedigreeNotationDescription')}`,
          label: this.$t('tableColumnPedigreeNotationDescription')
        }, {
          key: 'pedigreeNotationUrl',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'pedigreeNotationUrl')}`,
          label: this.$t('tableColumnPedigreeNotationUrl')
        }, {
          key: 'definition',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'definition')}`,
          label: this.$t('tableColumnPedigreeDefinition')
        }, {
          key: 'pedigreeDescriptionName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'pedigreeDescriptionName')}`,
          label: this.$t('tableColumnPedigreeDescriptionName')
        }, {
          key: 'pedigreeDescriptionDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'pedigreeDescriptionDescription')}`,
          label: this.$t('tableColumnPedigreeDescriptionDescription')
        }, {
          key: 'pedigreeDescriptionAuthor',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'pedigreeDescriptionAuthor')}`,
          label: this.$t('tableColumnPedigreeDescriptionAuthor')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'createdOn')}`,
          label: this.$t('tableColumnPedigreeDefinitionCreatedOn'),
          formatter: this.$options.filters.toDate
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  methods: {
    toUrl: function (input) {
      let url;
  
      try {
        url = new URL(input)
      } catch (_) {
        return false; 
      }

      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return input
      } else {
        return undefined
      }
    },
    refresh: function () {
      this.$refs.pedigreeDefinitionTable.refresh()
    }
  }
}
</script>

<style>
</style>