const fs = require('fs')
const request = require('request')
const csv = require('csvtojson')
const _ = require('lodash')

let population = []
let finalData = 'province,country,page name,population,density'

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
  // first, search for the right wiki page
  request(`https://en.wikipedia.org/w/api.php?format=json&action=query&redirects=&list=search&srsearch=${encodeURI(province || country)}&srlimit=1&origin=*`, (err, resp, body) => {
    if (err) {
      console.log(province || country, 'cannot get search results')

      // province, country, page name, url, population, density
      finalData += `\n"${province}","${country}",,,`
      fs.writeFileSync(`./data/population.csv`, finalData, {encoding: 'utf8'})

      // after writing, go to next
      getWiki(index + 1)

      return
    }

    let pageName = body.match(/"title":"([\w\d]*)"/i)
    pageName = pageName && pageName[1]
    console.log(pageName)

    request(`https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${pageName}&rvsection=0`, (err, resp, body) => {
      if (err) {
        console.log(pageName, 'cannot get page')

        // province, country, page name, url, population, density
        finalData += `\n"${province}","${country}",${pageName || ''},,`
        fs.writeFileSync(`./data/population.csv`, finalData, {encoding: 'utf8'})

        // after writing, go to next
        getWiki(index + 1)

        return
      }

      let population = body.match(/(population_estimate|population_total)\s*=\s*([\d\,]*)/i)
      population = population ? +(population[2].replace(/\,/g, '')) : ''
      let area = body.match(/(area_km2|area_total_km2)\s*=\s*([\d\,]*)/i)
      area = area ? +(area[2].replace(/\,/g, '')) : ''
      let density = body.match(/population_density_km2\s*=\s*([\d\,]*)/i)
      density = density && density[1] ? +(density[1]) : (population && area ? _.round(population / area, 2) : '')
      console.log(population, area, density)

      // province, country, page name, url, population, density
      finalData += `\n"${province}","${country}","${pageName || ''}",${population},${density}`
      fs.writeFileSync(`./data/population.csv`, finalData, {encoding: 'utf8'})

      // after writing, go to next
      getWiki(index + 1)
    })
  })

}
