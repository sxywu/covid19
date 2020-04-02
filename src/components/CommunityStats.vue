<template>
  <div id="communityStats">
    <header>
      <div>
        <h3 class="label">total cases</h3>
        <h4>{{casesTotal}}</h4>
      </div>
      <div>
        <h3 class="label">avoided cases</h3>
        <h4>{{casesAvoided}}</h4>
      </div>
    </header>
  </div>
</template>

<script>
import ProgressBar from './ProgressBar'

export default {
  name: 'CommunityStats',
  components: {
    ProgressBar,
  },
  props: {
    casesTotal: { default: 100 },
    casesAvoided: { default: 2 },
  },
}
</script>

<style lang="scss" scoped>
#communityStats {
  padding: 1rem;
}

header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  h4 {
    margin: 0;
    font-size: 1.75rem;
  }
  h3 {
    margin-top: 0.25rem;
  }
}
ul,
li {
  list-style-type: none;
  padding: 0;
}
</style>
