<template>
  <div id="credits">
    <h3>Credits</h3>
    <ul>
      <p>
        <strong><a href="https://sxywu.com/" target="_new">Shirley Wu</a></strong>
        Story, Data Visualization Design & Development, Software Architecture
      </p>
      <p>
        <strong>Stephen Osserman</strong>
        Simulation Design & Development<br />
        Master in Spatial Analysis for Public
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
      <br />
      <p>
        Thank you so much to <strong><a href="https://egghead.io" target="_new">egghead.io</a></strong> for sponsoring this project.
      </p>
      <p>
        Thank you to Amanda Makulec, Tony Chu, Michael Freeman for all the feedback,
        and thank you Jeremy Ashkenas and Anjana Vakil for <a href="https://observablehq.com/" target="_new">Observable</a> help.
      </p>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Credits',
}
</script>

<style lang="scss" scoped>
#credits {
  padding: 0;
  width: 100%;
  max-width: 620px;
  text-align: center;
  line-height: 1.5;
  margin: auto;
}
ul {
  list-style-type: none;
  padding: 0;
}
h3 {
  margin: 0 auto;
  text-transform: uppercase;
  font-weight: normal;
  letter-spacing: 1px;
  font-size: 15px;
}
</style>
