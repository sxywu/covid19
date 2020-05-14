<template>
  <div id="landing">
    <div class="bg" />
    <div class="container">
      <header>
        <img
          alt="people of the pandemic"
          class="title"
          src="../assets/pandemic-title.png"
        />
        <h2>{{ $t('subtitle') }}</h2>
        <hr />
      </header>
      <div class="content">
        <p>{{ $t('landing.explanation1') }}</p>
        <p>{{ $t('landing.explanation2') }}</p>
        <h2>{{ $t('landing.explanation3') }}</h2>
        <p>{{ $t('landing.explanation4') }}</p>
        <!-- TEAM INPUT -->
        <form>
          <div class="inputs">
            <div>
              <div class="joinTeam">
                <input
                  type="checkbox"
                  name="joinTeam"
                  :disabled="!!newTeamName"
                  checked
                />
                <label v-html="teamName ?
                    $t('landing.joinTeamName', {name: teamName}) :
                    $t('landing.joinRandomTeam')" />
              </div>
            </div>
            <span>{{ $t('or') }}</span>
            <div class="teamName">
              <input
                type="text"
                :class="{ 'error': errors['teamName'] }"
                v-model="newTeamName"
                :placeholder="$t('landing.teamPlaceholder')"
              />
            </div>
            <!-- JOIN TEAM SUBTEXT -->
            <div v-if="!isPhone && !newTeamName" style="grid-column: 1/1">
              <sup v-if="teamName">
                {{ $tc(
                    'landing.joinTeamSubtext',
                    pastPlayers.length === totalPlayers ? 1 : pastPlayers.length,
                    {count: pastPlayers.length, total: totalPlayers}
                  ) }}
              </sup>
              <sup v-else>
                {{ $t('landing.joinRandomSubtext', {count: pastPlayers.length}) }}
              </sup>
            </div>
            <!-- TEAM NAME SUBTEXT -->
            <div :style="{'grid-column': isPhone ? '' : '3/3'}">
              <sup v-if="!errors['teamName']">
                {{ $t('landing.errors.invalidName') }}
              </sup>
              <sup v-if="errors['teamName']" class="teamNameError">
                {{ errors['teamName'] }}
              </sup>
            </div>
          </div>
        </form>
        <Beeswarm
          v-bind="{
            type: 'all',
            width: isPhone ? 300 : 700,
            newTeam: true,
          }"
        />
        <p style="text-align: center" v-html="$t('landing.explanation5')" />
        <hr />
        <!-- ZIP CODE OR COMMUNITY SIZE -->
        <h2 class="instructions" v-html="$t('landing.instruction1')"></h2>
        <div v-if="country === 'us'" v-html="$t('landing.zipCodeDisclaimer')"></div>
        <form @submit="startPlay">
          <div class="inputs">
            <div class="zipCode">
              <input
                type="number"
                :class="{ 'error': errors['zipCode'] }"
                id="zip"
                v-model="zipCode"
                :placeholder="$t('landing.zipCodePlaceholder')"
              />
            </div>
            <span>{{ $t('or') }}</span>
            <fieldset>
              <div class="communitySize">
                <div
                  v-for="{ id, value } in communitySizes"
                  class="radioWrapper"
                >
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
            <!-- ERROR -->
            <sup v-if="errors['zipCode']" class="zipCodeError">
              {{ errors['zipCode'] }}
            </sup>
          </div>
          <p
            style="text-align: center; max-width: 380px;"
            v-html="$t('landing.instruction2')"
          ></p>
          <button type="submit" class="playNowBtn" :disabled="!enableSubmit">
            {{ $t('landing.buttonCta') }}
          </button>
          <!-- ERROR MESSAGES -->
          <div style="max-width: 320px">
            <sup v-if="errors['teamName']" class="teamNameError">
              {{ errors['teamName'] }}
            </sup>
            <br />
            <sup v-if="errors['zipCode']" class="zipCodeError">
              {{ errors['zipCode'] }}
            </sup>
          </div>
        </form>
      </div>
    </div>

    <footer id="disclaimer">
      <h3 class="label">{{ $t('footnotes.disclaimer') }}</h3>
      <p v-html="$t('footnotes.fullDisclaimer')"></p>
    </footer>
  </div>
</template>

<script>
import _ from 'lodash'
import Beeswarm from './Beeswarm'

const validZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/
const validName = /^[a-z\d\-_]+$/i
export default {
  name: 'LandingPage',
  components: { Beeswarm },
  props: ['isPhone'],
  data() {
    return {
      errors: {},
      newTeamName: '',
      zipCode: '',
      communitySize: '',
      communitySizes: [
        { id: 'urban', value: 'Urban' },
        { id: 'suburban', value: 'Suburban' },
        { id: 'rural', value: 'Rural' },
      ],
    }
  },
  computed: {
    existingZipCode() {
      return this.$store.state.zipCode
    },
    existingCommunitySize() {
      return this.$store.state.communitySize
    },
    zips() {
      return this.$store.getters.allZips
    },
    zipsByCommunitySize() {
      return this.$store.getters.zipsByCommunitySize
    },
    country() {
      return this.$store.state.country
    },
    totalPlayers() {
      return this.$store.getters.totalPlayers
    },
    pastPlayers() {
      return this.$store.getters.pastPlayerIDs
    },
    teamName() {
      return this.$store.state.teamName
    },
    teamNames() {
      return _.map(this.$store.state.allTeams, d => d.teamName.toLowerCase())
    },
    enableSubmit() {
      if (!this.zipCode && !this.communitySize) return false
      if (this.zipCode && this.errors.zipCode) return false
      if (this.newTeamName && this.errors.teamName) return false
      return true
    },
  },
  mounted() {
    this.updateZipAndCommunity()
  },
  watch: {
    existingZipCode() {
      this.updateZipAndCommunity()
    },
    existingCommunitySize() {
      this.updateZipAndCommunity()
    },
    zipCode() {
      this.validateZip()
    },
    newTeamName() {
      this.validateName()
      this.updateName()
    },
  },
  methods: {
    updateZipAndCommunity() {
      this.communitySize = this.existingCommunitySize
      if (!this.communitySize) {
        this.zipCode = this.existingZipCode
      }
    },
    validateZip() {
      // check zip codes
      this.createFormError({
        condition: this.zipCode && !validZip.test(this.zipCode),
        fieldName: 'zipCode',
        errorMessage: this.$t('landing.errors.invalidZip'),
      })
      if (_.isEmpty(this.errors.zipCode)) {
        this.createFormError({
          condition: this.zipCode && !_.includes(this.zips, this.zipCode),
          fieldName: 'zipCode',
          errorMessage: this.$t('landing.errors.zipNotFound'),
        })
      }
    },
    validateName() {
      this.createFormError({
        condition: this.newTeamName &&
          (this.newTeamName.length < 5 || this.newTeamName.length > 32 ||
            !validName.test(this.newTeamName)),
        fieldName: 'teamName',
        errorMessage: this.$t('landing.errors.invalidName'),
      })

      // and if it is valid, check if the name already exists
      if (_.isEmpty(this.errors.teamName)) {
        this.createFormError({
          condition: this.newTeamName && _.includes(this.teamNames, this.newTeamName.toLowerCase()),
          fieldName: 'teamName',
          errorMessage: this.$t('landing.errors.teamExists'),
        })
      }
    },
    updateName() {
      if (!this.newTeamName || !this.errors.teamName) {
        this.$store.commit('setNewTeamName', this.newTeamName)
        this.$store.dispatch('updateURL')
      }
    },
    startPlay(e) {
      if (!this.zipCode && this.communitySize) {
        this.zipCode = _.sample(
          this.zipsByCommunitySize[this.communitySize.toLowerCase()]
        ).zip
        this.$store.commit('setCommunitySize', this.communitySize)
      }
      if (this.newTeamName) {
        this.$store.commit('setTeamName', this.newTeamName)
      }
      this.$store.commit('setGameIdAndCreatedAt')
      this.$store.commit('setZipCode', this.zipCode)
      this.$store.commit('setCurrentPage', 'game')
      
      event.preventDefault()
    },
    createFormError({ condition, event, fieldName, errorMessage }) {
      this.errors[fieldName] = condition ? errorMessage : null
      // event.preventDefault()
      return true
    },
  },
}
</script>

<style lang="scss" scoped>
#landing {
  @include respond-to('small') {
    padding: 1rem;
  }
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  background: linear-gradient(#fff 50%, $gray);

  .title {
    max-width: 80%;
    margin-top: 2em;
  }
}

.instructions {
  text-align: center;
  font-weight: normal;
  margin-bottom: 0.5rem;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .inputs {
    padding: 1.5rem 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 0.2fr 1fr;
    grid-template-rows: repeat(2, min-content);
    grid-gap: 0.5rem;
    @include respond-to('small') {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 0.5fr 1fr;
    }
  }
  .zipCode, .teamName {
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
    }
    input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.3);
      border-radius: 5px;
      &:disabled {
        background-color: $gray;
      }
    }
    .error {
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
  .communitySize, .joinTeam {
    width: 100%;
    display: grid;
    font-size: 1rem;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  .communitySize {
    grid-template-columns: 1fr 1fr 1fr;
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
  input[type='radio'],
  input[type='checkbox'] {
    opacity: 0;
    position: absolute;
  }
  input[type='radio'] + label,
  input[type='checkbox'] + label {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }
  input[type='radio']:focus + label,
  input[type='checkbox']:focus + label {
    outline: 1px dotted $aqua;
    outline: 5px auto -webkit-focus-ring-color;
  }
  input[type='radio']:checked + label,
  input[type='checkbox']:checked + label {
    background: $text;
    color: white;
  }
  input[type='radio']:disabled + label,
  input[type='checkbox']:disabled + label {
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
.zipCodeError,
.teamNameError,
.mobileError {
  color: $red;
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
  &:disabled {
    background-color: $gray;
    box-shadow: 0 5px #e0e0e0;
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
  background-image: url('../assets/background.png');
  background-repeat: repeat-x;
  background-position: center -60px;
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

#disclaimer {
  width: 100%;
  max-width: 500px;
  text-align: center;
  line-height: 1.5;
  margin: 40px auto;

  h3 {
    margin: 0 auto;
    text-transform: uppercase;
    font-weight: normal;
    letter-spacing: 1px;
    font-size: 15px;
  }
}
</style>
