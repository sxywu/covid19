<template>
  <div id="decideArea" class="z1">
    <div class="flex mw500 ma">
      <image :href="virusImage" class="virus" />
      <div>
        <h1>You've been fighting the virus for 32 days.</h1>
        <p>
          There are 15,321 infected cases in your community, with 6,212 beds out
          of 3,212 total currently in use.
        </p>
      </div>
    </div>
    <div>
      <h2>What are you going to do?</h2>
      <div class="flex justify-around ma mw500">
        <button @click="onUpdate">Decide</button>
        <button @click="onUpdate">Decide</button>
        <button @click="onUpdate">Decide</button>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
const virusImage = require('../assets/virus.png')

export default {
  name: 'DecideArea',
  props: ['onUpdate'],
  data() {
    return {
      virusImage,
    }
  },
}
</script>

<style lang="scss" scoped>
#decideArea {
  width: 100%;
  height: 100%;
}

.virus {
  width: 100px;
  height: 100px;
}

.flex {
  display: flex;
  flex-direction: row;
}

.justify-around {
  justify-content: space-between;
}

.ma {
  margin: auto;
}

.mw500 {
  max-width: 500px;
}

.z1 {
  z-index: 1;
}
</style>
