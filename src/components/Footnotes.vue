<template>
  <div id="footnotes">
    <h3>{{ $t('footnotes.methodology') }}</h3>
    <p v-html="$t('footnotes.methodologyHere')"></p>

    <h3>CREDITS</h3>
    <p>
      <strong><a href="https://sxywu.com/" target="_new">Shirley Wu</a></strong>
      Story, Data Visualization Design & Development, Software Architecture
    </p>
    <p>
      <strong>Stephen Osserman</strong>
      Simulation Design & Development<br />
      Master in Spatial Analysis for Public Health
    </p>
    <p>
      <strong><a href="https://twitter.com/sidneymbell" target="_new">Sidney Bell</a></strong>
      Expert Consultant<br />
      PhD in Virus Evolution and Immunity
    </p>
    <p>
      <strong><a href="https://maggieappleton.com/" target="_new">Maggie Appleton</a></strong>
      Illustration & Visual Design
    </p>
    <p>
      <strong><a href="https://www.ianjones.us/" target="_new">Ian Jones</a></strong>
      Front & Backend Development
    </p>
    <p>
      <strong><a href="https://vojta.io/" target="_new">Vojta Holik</a></strong>
      UI Design & Development
    </p>
    <p>
      <strong>Topher Lin & Amy Langer</strong>
      Copywriting
    </p>
    <hr />
    <p v-html="$t('footnotes.egghead')"></p>
    <p v-html="$t('footnotes.observable')"></p>
    <p>
      <span v-html="$t('footnotes.feedback')"></span>
      <!-- <div v-for='name in feedback'>{{ name }}</div> -->
      {{ feedback.join(', ') }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'Footnotes',
  data() {
    return {
      feedback: [
        'Amanda Makulec',
        'Tony Chu',
        'Michael Freeman',
        'Alice Lee',
        'Jeffrey Lin',
        'Philippe Rivière',
        'Duncan Geere',
        'Alex Wein',
        'Joshua Smith',
        'Biren Vanherck',
        'Nicolas Belmonte',
        'Alastair Dant',
      ]
    }
  },
}
</script>

<style lang="scss" scoped>
#footnotes {
  width: 100%;
  max-width: 620px;
  text-align: center;
  line-height: 1.5;
  margin: 40px auto;
}

hr {
  border: none;
  height: 1px;
  width: 32px;
  background: $primary;
  opacity: 0.7;
}

h3 {
  margin: 0 auto;
  text-transform: uppercase;
  font-weight: normal;
  letter-spacing: 1px;
  font-size: 15px;
}
</style>
