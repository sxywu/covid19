<template>
  <div id="footnotes">
    <h3>Methodology</h3>
    <p>We've put a lot of thought and research into our simulation, read the full methodology here (COMING SOON).</p>

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
    <p>
      Thank you so much to <strong><a href="https://egghead.io" target="_new">egghead.io</a></strong> for sponsoring this project.
    </p>
    <p>
      Thank you to Amanda Makulec, Tony Chu, Michael Freeman for all the feedback,
      and thank you Jeremy Ashkenas and Anjana Vakil for <a href="https://observablehq.com/" target="_new">Observable</a> help.
    </p>
  </div>
</template>

<script>
export default {
  name: 'Footnotes',
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
