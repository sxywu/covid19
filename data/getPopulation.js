const fs = require('fs')
const wiki = require('wikijs').default
const request = require('request')
const csv = require('csvtojson')
const _ = require('lodash')

let population = []
let finalData = 'province,country,url,population,density'

csv()
  .fromStream(request.get('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv'))
  .subscribe(d => {
    population.push({
      province: d['Province/State'],
      country: d['Country/Region'],
    })
  }, null, () => {
    // on complete
    getWiki(0)
  })

function getWiki(index) {
  if (!population[index]) return

  const {province, country} = population[index]
  console.log('\n', province, country)
  // then go get that page
  wiki().page(province || country)
    .then(page => {
      // and from that page get the full info
      Promise.all([page.url(), page.info()])
        .then(([url, info]) => {
          let population = "" + info.populationTotal
          population = population && +(population.replace(/\,/g, ''))
          let area = "" + info.areaTotalKm2
          area = area && +(area.replace(/\,/g, ''))
          let density = _.round(population / area, 1)
          console.log(population, area, density)

          // province, country, page name, url, population, density
          finalData += `\n"${province}","${country}","${url}",${population},${density}`
          fs.writeFileSync(`./data/population.csv`, finalData, {encoding: 'utf8'})

          // after writing, go to next
          getWiki(index + 1)
        }).catch(err => {
          console.log(province || country, 'cannot get page info')

          // province, country, page name, url, population, density
          finalData += `\n"${province}","${country}",,,`
          fs.writeFileSync(`./data/population.csv`, finalData, {encoding: 'utf8'})

          // after writing, go to next
          getWiki(index + 1)
        })
    }).catch(err => {
      console.log(province || country, 'cannot get page')

      // province, country, page name, url, population, density
      finalData += `\n"${province}","${country}",,,`
      fs.writeFileSync(`./data/population.csv`, finalData, {encoding: 'utf8'})

      // after writing, go to next
      getWiki(index + 1)
    })
}
