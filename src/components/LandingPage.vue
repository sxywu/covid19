<template>
  <div id="landing">
    <div class="bg" />
    <div class="container">
      <header>
        <h1>{{ $t('title') }}</h1>
        <!-- <h2>{{ $t('subtitle') }}</h2> -->
        <!-- <hr /> -->
      </header>
      <div class="content">
        <p>{{ $t('landing.explanation1') }}</p>
        <p>{{ $t('landing.explanation2') }}</p>
        <p>{{ $t('landing.explanation3') }}</p>
        <div class="people">
          <!-- randomly choose a person image -->
          <img
            v-for="i in 20"
            :src="peopleImages[Math.round(Math.random())]"
            :key="i"
          />
        </div>
        <p>{{ $t('landing.explanation4') }}</p>
        <hr />
        <h2 class="instructions" v-html="$t('landing.instruction1')"></h2>
        <form @submit="startPlay">
          <div class="inputs">
            <div class="zipCode">
              <input
                type="number"
                :class="{'zip-error': errors['zipCode']}"
                id="zip"
                v-model="zipCode"
                :placeholder="$t('landing.zipCodePlaceholder')"
                pattern="/(^\d{5}$)|(^\d{5}-\d{4}$)/"
              />
            </div>
            <span>{{ $t('or') }}</span>
            <fieldset>
              <div class="communitySize">
                <div v-for="{id, value} in communitySizes" class="radioWrapper">
                  <input
                    type="radio"
                    :id="id"
                    name="communitySize"
                    :value="value"
                    v-model="communitySize"
                    :disabled="!!zipCode"
                  />
                  <label :for="id">{{ $t(id) }}</label>
                </div>
              </div>
            </fieldset>
          </div>
          <p style="text-align: center; max-width: 380px;">
            {{ $t('landing.instruction2') }}
          </p>
          <button type="submit" class="playNowBtn">
            {{ $t('landing.buttonCta') }}
          </button>
          <div v-if="errors['zipCode']" class="zipCodeError">
            {{ errors['zipCode'] }}
          </div>
        </form>
      </div>
    </div>
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
      communitySize: '',
      communitySizes: [
        {id: 'urban', value: 'Urban'},
        {id: 'suburban', value: 'Suburban'},
        {id: 'rural', value: 'Rural'},
      ],
      peopleImages: [
        require('../assets/person-1.svg'),
        require('../assets/person-2.svg'),
      ],
    }
  },
  computed: {
    zips() {
      return this.$store.getters.allZips
    },
    zipsByCommunitySize() {
      return this.$store.getters.zipsByCommunitySize
    },
  },
  methods: {
    startPlay(e) {
      if (!this.zipCode && this.communitySize) {
        this.zipCode = _.sample(
          this.zipsByCommunitySize[this.communitySize.toLowerCase()],
        ).zip
        this.$store.commit('setCommunitySizeSelection', this.communitySize)
      }
      if (this.checkFormValid(e)) {
        this.$store.commit('setGameId')
        this.$store.dispatch('getPastGames', {zipCode: this.zipCode})
        this.$store.commit('setZipCode', this.zipCode)
        this.$store.commit('setCurrentPage', 'game')
      }
    },
    createFormError({condition, event, fieldName, errorMessage}) {
      if (condition) {
        this.errors[fieldName] = errorMessage
        event.preventDefault()
        return true
      }
    },
    checkFormValid(e) {
      this.errors = {}
      let validZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/
      this.createFormError({
        event: e,
        condition: !validZip.test(this.zipCode),
        fieldName: 'zipCode',
        errorMessage: this.$t('landing.errors.invalidZip'),
      })

      if (_.isEmpty(this.errors.zipCode)) {
        this.createFormError({
          event: e,
          condition: !_.includes(this.zips, this.zipCode),
          fieldName: 'zipCode',
          errorMessage: this.$t('landing.errors.zipNotFound'),
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  background: linear-gradient(#fff 50%, $gray);
  @include respond-to('small') {
    padding: 2rem;
  }
}

.instructions {
  text-align: center;
  font-weight: normal;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .inputs {
    padding: 1.5rem 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 0.15fr 1fr;
    grid-gap: 1rem;
    align-items: center;
    @include respond-to('small') {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 0.5fr 1fr;
    }
  }
  .zipCode {
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type='number'] {
      -moz-appearance: textfield;
    }
    display: flex;
    flex-direction: column;
    align-items: center;
    label {
      padding: 0;
      margin: 0;
      margin-bottom: 0.5rem;
      font-weight: bold;
      text-align: center;
    }
    input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.3);
      border-radius: 5px;
    }
    .zip-error {
      border: 1px solid $red;
    }
  }
  fieldset {
    padding: 0;
    border: none;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  legend {
    margin: 0 auto;
    padding: 0;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .communitySize {
    width: 100%;
    display: grid;
    font-size: 1rem;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    text-align: center;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  label {
    width: 100%;
    height: 100%;
    padding: 0.75rem 0;
  }
  .radioWrapper {
    width: 100%;
    display: flex;
    &:not(:last-of-type) {
      border-right: 1px solid rgba(0, 0, 0, 0.3);
    }
  }
  input[type='radio'] {
    opacity: 0;
    position: absolute;
  }
  input[type='radio'] + label {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }
  input[type='radio']:focus + label {
    outline: 1px dotted $aqua;
    outline: 5px auto -webkit-focus-ring-color;
  }
  input[type='radio']:checked + label {
    background: $text;
    color: white;
  }
  input[type='radio']:disabled + label {
    background: $gray;
    color: rgba(0, 0, 0, 0.3);
    cursor: not-allowed;
  }
}
header {
  padding: 4rem 4rem 0 4rem;
  text-align: center;
  h1 {
    font-size: 3.75rem;
    margin-bottom: 0;
  }
  h2 {
    margin-top: 0.5rem;
    font-size: 1.75rem;
    font-weight: normal;
    opacity: 0.7;
  }
  hr {
    border: none;
    height: 3px;
    width: 32px;
    background: $primary;
    margin-top: 3rem;
    opacity: 0.7;
  }
  @include respond-to('small') {
    padding: 2rem 2rem 0 2rem;
    h1 {
      font-size: 2.75rem;
    }
    h2 {
      font-size: 1.5rem;
    }
    hr {
      margin-top: 2rem;
    }
  }
}
.container {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  position: relative;
  padding-bottom: 4rem;
  z-index: 10;
  @include shadow;

  hr {
    border: none;
    height: 3px;
    width: 32px;
    background: $primary;
    margin-top: 3rem;
    opacity: 0.7;
  }
}
.content {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 2rem 6rem;
  p {
    width: 100%;
    font-size: 1.15rem;
    line-height: 1.55;
    opacity: 0.85;
    // max-width: 640px;
  }
  @include respond-to('medium') {
    padding: 1rem 2rem 2rem 2rem;
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
  padding-top: 0.5rem;
  color: $red;
  text-align: justify;
}
.playNowBtn {
  background-color: $red;
  color: #fff;
  padding: 1rem 2rem;
  margin: 1rem 0;
  border: none;
  border-radius: 5px;
  box-shadow: 0 5px #d23658;
  &:hover {
    filter: brightness(0.9) contrast(1.2) saturate(0.9);
  }
}
.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 640px;
  overflow: hidden;
  z-index: 0;
  background-image: url('../assets/bg.png');
  background-repeat: repeat-x;
  background-position: 0 -60px;
  background-size: 1040px;
}
.people {
  margin-top: 1.5rem;
  width: 100%;
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  grid-template-rows: 1fr 1fr;
  img {
    width: 100%;
  }
  @include respond-to('small') {
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
  }
}
</style>
