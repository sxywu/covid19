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
      let createError = ({condition, event, fieldName, errorMessage}) => {
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

<style lang="scss">
#landing {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
}

.content {
  margin-left: 50%;
  margin-top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: space-around;
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
</style>
