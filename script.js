(() => {
    const endpoint = 'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';

    const searchEl = document.getElementById('search')
    const suggestionsEl = document.getElementById('suggestions')
    const cities = []

    const currCityName = 'San Diego'
    let currCity = []

    const prom = fetch(endpoint)
                    .then(blob => {
                        return blob.json()
                    }).then(data => {
                        cities.push(...data)
                        getCurrentCityInfo()
                    })
    
    searchEl.addEventListener('change', displayMatches)
    searchEl.addEventListener('keyup', displayMatches)

    document.querySelector('form').addEventListener('submit', e => e.preventDefault())

    function getCurrentCityInfo() {
        const info = cities.find(city => city.city === currCityName)
        if (info ){
            currCity = info
        }
    }

    function findMatches(wordToMatch) {
        const regex = new RegExp(wordToMatch, 'gi')
        const places = cities.filter( city => 
            city.city.match(regex) || city.state.match(regex)
        )
        return places
    }

    function displayMatches(e) {
        if (e.keyCode === 27 || e.key === 'Escape') {
            suggestionsEl.innerHTML = ``
            return
        }
        const numFormat = new Intl.NumberFormat()
        const userVal = this.value
        const matchedPlaces = findMatches(userVal)
        const regex = new RegExp(userVal, 'gi')
        let nearestCity = undefined
        let dist = Number.POSITIVE_INFINITY
        let num = 0
        suggestionsEl.innerHTML = matchedPlaces.map(place => {
            const tmp = distance(currCity.latitude, currCity.longitude, place.latitude, place.longitude)
            let nearest = false
            if(tmp <= dist && currCityName !== place.city) {
                dist = tmp
                nearestCity = place
                nearest = true
                num++
            }
            return `<div class="row"><span class="name ${nearest ? 'nearest-'+num : ''}">${place.city.replace(regex, getReplacement)}, 
                ${place.state.replace(regex, getReplacement)}</span>
                <span class="name">${numFormat.format(place.population)}</span></div>`
        }).join('')
        const nearestEl = document.querySelector(`.row .nearest-${num}`).parentElement
        nearestEl.classList.add('nearest')
        suggestionsEl.insertBefore(nearestEl, suggestionsEl.childNodes[0])
        
    }

    function getReplacement(match) {
        return `<span class="hl">${match}</span>`
    }

    function distance(lat1, lon1, lat2, lon2) {
        var p = 0.017453292519943295;    // Math.PI / 180
        var c = Math.cos;
        var a = 0.5 - c((lat2 - lat1) * p)/2 + 
                c(lat1 * p) * c(lat2 * p) * 
                (1 - c((lon2 - lon1) * p))/2;
      
        return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
      }
})()