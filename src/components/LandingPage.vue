<template>
  <div id="landing">
    <div class="bg" />
    <div class="container">
      <header>
        <h1>The Game Title</h1>
        <h2>Lorem Ipsum Dolor Sit</h2>
        <hr />
      </header>
      <div class="content">
        <p>The first few cases of a new infectious disease that has caused a global pandemic has also arrived in your backyard. You have twelve weeks to save as many lives as you can in your community.</p>
        <p>First, enter your ZIP code. We’ll find out how densely populated your community is, and how many avaliable hospital beds are in your area. Or choose a community size that resembles area you live in:</p>
        <form @submit="startPlay">
          <div class="inputs">
            <div class="zipCode">
              <label for="zip">Enter Your ZIP Code</label>
              <input
                type="number"
                class="zip"
                id="zip"
                v-model="zipCode"
                placeholder="For example: 00603"
                pattern="/(^\d{5}$)|(^\d{5}-\d{4}$)/"
              />
            </div>
            <span>or</span>
            <fieldset>
              <legend>Choose Community Size</legend>
              <div class="communitySize">
                <div class="radioWrapper">
                  <input type="radio" id="urban" name="communitySize" value="Urban" />
                  <label for="urban">Urban</label>
                </div>
                <div class="radioWrapper">
                  <input type="radio" id="suburban" name="communitySize" value="Suburban" />
                  <label for="suburban">Suburban</label>
                </div>
                <div class="radioWrapper">
                  <input type="radio" id="rural" name="communitySize" value="Rural" />
                  <label for="rural">Rural</label>
                </div>
              </div>
            </fieldset>
          </div>
          <div v-if="errors['zipCode']" class="zipCodeError">{{ errors['zipCode'] }}</div>
          <p>Each week you’ll have to decide how many times to go out.</p>
          <p>
            Because this virus spreads before people show symptoms, physical distancing is crucial to slowing down its spread. But you can’t do it alone, your whole community needs to be involved.
            Thankfully, you have the help of all the people that have visited the site before you. These 20 players each represent 5% of your local population.
          </p>
          <div class="people">
            <img src="../assets/person-2.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-2.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-2.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-2.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-2.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-2.svg" />
            <img src="../assets/person-2.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-2.svg" />
            <img src="../assets/person-1.svg" />
            <img src="../assets/person-2.svg" />
          </div>
          <p
            style="margin: 2.5rem auto; text-align: center; max-width: 380px;"
          >Their decisions and yours will determine how many lives are lost or saved in your community.</p>
          <button type="submit" class="playNowBtn">Start Playing →</button>
          <div v-if="errors['zipCode']" class="zipCodeError">{{ errors['zipCode'] }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
const personImage = require('../assets/person-1.svg')

export default {
  name: 'LandingPage',
  data() {
    return {
      errors: {},
      zipCode: '',
    }
  },
  computed: {
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
    createFormError({ condition, event, fieldName, errorMessage }) {
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
        errorMessage: 'Invalid ZIP code',
      })

      if (_.isEmpty(this.errors.zipCode)) {
        this.createFormError({
          event: e,
          condition: !_.includes(this.zips, this.zipCode),
          fieldName: 'zipCode',
          errorMessage: 'ZIP code not found, please try a different one',
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
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 1.25rem;
  }
  .inputs {
    padding: 1.5rem 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 0.15fr 1fr;
    grid-gap: 1rem;
    align-items: center;
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
  box-shadow: 0 2.8px 2.2px rgba(0, 0, 0, 0.008),
    0 6.7px 5.3px rgba(0, 0, 0, 0.012), 0 12.5px 10px rgba(0, 0, 0, 0.015),
    0 22.3px 17.9px rgba(0, 0, 0, 0.018), 0 41.8px 33.4px rgba(0, 0, 0, 0.022),
    0 100px 80px rgba(0, 0, 0, 0.03);
}
.content {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 2rem 4rem 4rem 4rem;
  p {
    width: 100%;
    font-size: 1.15rem;
    line-height: 1.55;
    opacity: 0.85;
    max-width: 640px;
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
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  grid-template-rows: 1fr 1fr;
  img {
    width: 100%;
  }
  @include respond-to('small') {
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
  }
}
</style>
