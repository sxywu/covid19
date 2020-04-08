<template>
  <div id="landing">
    <form class="content" @submit="startPlay">
      <label class="zipInput">
        <strong>
          Enter Your ZIP Code
        </strong>
        <input
          type="number"
          v-model="zipCode"
          placeholder="For example: 94203"
          pattern="/(^\d{5}$)|(^\d{5}-\d{4}$)/"
        />
        <div v-if="displayZipCodeError" class="zipCodeError">
          {{ zipCodeError }}
        </div>
      </label>
      <button type="submit" class="playNowBtn">Start Playing →</button>
    </form>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'LandingPage',
  data() {
    return {
      errors: {},
      zipCode: '',
    }
  },
  computed: {
    zipCodeError() {
      return _.get(this.errors, 'zipCode')
    },
    displayZipCodeError() {
      return !_.isEmpty(this.zipCodeError)
    },
    zips() {
      return this.$store.getters.allZips
    },
  },
  methods: {
    startPlay(e) {
      if (this.checkFormValid(e)) {
        this.$store.commit('setZipCode', this.zipCode)
        this.$store.commit('setCurrentPage', 'game')
      }
    },
    checkFormValid(e) {
      let createError = ({ condition, event, fieldName, errorMessage }) => {
        if (condition) {
          this.errors[fieldName] = errorMessage
          event.preventDefault()
          return true
        }
      }

      this.errors = {}
      let validZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/
      createError({
        event: e,
        condition: !validZip.test(this.zipCode),
        fieldName: 'zipCode',
        errorMessage: 'zipcode is invalid',
      })

      if (_.isEmpty(this.errors.zipCode)) {
        createError({
          event: e,
          condition: !_.includes(this.zips, this.zipCode),
          fieldName: 'zipCode',
          errorMessage: 'zipcode not found, please try another',
        })
      }

      e.preventDefault()
      return _.isEmpty(this.errors)
    },
  },
}
</script>

<style lang="scss" scoped>
#landing {
  width: 100%;
}

header {
  @include respond-to('medium') {
    padding: 4rem;
  }
  padding: 2rem;
  h1 {
    font-size: 3rem;
    margin-bottom: 0;
  }
  h2 {
    margin-top: 0.5rem;
    font-size: 1.75rem;
    font-weight: normal;
  }
  text-align: center;
}

.container {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  position: relative;
  z-index: 10;
  box-shadow: 0 2.8px 2.2px rgba(0, 0, 0, 0.008),
    0 6.7px 5.3px rgba(0, 0, 0, 0.012), 0 12.5px 10px rgba(0, 0, 0, 0.015),
    0 22.3px 17.9px rgba(0, 0, 0, 0.018), 0 41.8px 33.4px rgba(0, 0, 0, 0.022),
    0 100px 80px rgba(0, 0, 0, 0.03);
}

.content {
  padding: 2rem;
  @include respond-to('medium') {
    padding: 4rem;
  }
}

.zipInput {
  display: flex;
  flex-direction: column;

  strong {
    margin-bottom: 5px;
  }
  input {
    padding: 15px;
    border: 1px solid lightgray;
    border-radius: 5px;
  }
}

.zipCodeError {
  color: red;
  text-align: justify;
}

.playNowBtn {
  background-color: #393939;
  color: #fff;
  padding: 10px 30px;
  border: none;
  border-radius: 5px;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 840px;
  overflow: hidden;
  z-index: 0;
  background: red;
}
</style>
