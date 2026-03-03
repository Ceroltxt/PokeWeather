const bg = document.querySelector('#background');
const card = document.querySelector('#main-card');
const timestamp = new Date().getHours();
const OPENWEATHER_KEY = '0eebef0baab363472a084878ddb2cb19';

//Bloco de if´s que definem o background e a cor do main_card de acordo com o horário.
if (timestamp >= 5 && timestamp < 7) {
  bg.classList.add('bg-[url(./morning.png)]');
  card.classList.add('bg-orange-200');
} else if (timestamp >= 7 && timestamp < 17) {
  bg.classList.add('bg-[url(./default.png)]');
  card.classList.add('bg-cyan-200');
} else if (timestamp >= 17 && timestamp < 19) {
  bg.classList.add('bg-[url(./afternoon.png)]');
  card.classList.add('bg-orange-200');
} else {
  bg.classList.add('bg-[url(./night.png)]');
  card.classList.add('bg-violet-300');
}

//Bloco de código disparado pelo submit
document.querySelector('#search').addEventListener('submit', async function (event) {
  event.preventDefault();

  const cityName = document.querySelector('#city_name').value.trim();

  if (!cityName) {
    return alert('Digite uma cidade...');
  }

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${OPENWEATHER_KEY}&units=metric&lang=pt_br`
    );

    const weatherJson = await weatherRes.json();

    if (!weatherRes.ok) {
      throw new Error('Cidade não encontrada');
    }

    const temp = weatherJson.main.temp;
    const pokemons = await getPokemonByTemp(temp);

    const info = {
      city: weatherJson.name,
      country: weatherJson.sys.country,
      temp: temp.toFixed(0),
      tempMax: weatherJson.main.temp_max.toFixed(0),
      tempMin: weatherJson.main.temp_min.toFixed(0),
      windSpeed: weatherJson.wind.speed.toFixed(1),
      humidity: weatherJson.main.humidity,
      desc: weatherJson.weather[0].description,
      icon: weatherJson.weather[0].icon,
      pokemons,
    };

    card.classList.remove('hidden');
    card.classList.add('flex');

    showInfo(info);
    renderPokemons(info.pokemons || []);
  } catch (error) {
    alert(error.message || 'Opsie, não foi possível localizar');
  }
});

//pega os sprites animados...
function getAnimatedSprite(pokemon) {
  return (
    pokemon?.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
    pokemon?.sprites?.front_default ||
    ''
  );
}

function getPokemonByTempo(temp) {
  if (temp >= 30) return ['charmander', 'vulpix'];
  if (temp >= 25) return ['bulbasaur', 'chikorita'];
  if (temp >= 18) return ['eevee', 'pidgey'];
  if (temp >= 10) return ['sneasel', 'zigzagoon'];
  return ['froslass', 'glaceon'];
}

//Usa os nomes pokémons definidos pela função acima pra buscar-los na PokeAPI
async function getPokemonByTemp(temp) {
  const names = getPokemonByTempo(temp);

  return Promise.all(
    names.map(async (name) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      return res.json();
    })
  );
}

//Renderiza as informações recuperadas da OpenWeatherAPI
function showInfo(json) {
  document.querySelector('#celsius').textContent = `${json.temp }ºC`;
  document.querySelector('#weather_desc').textContent = json.desc ;
  document.querySelector('#wind_speed').textContent = `${json.windSpeed } km/h`;
  document.querySelector('#humidity_level').textContent = `${json.humidity }%`;
  document.querySelector('#max_temp').textContent = `${json.tempMax  }ºC`;
  document.querySelector('#min_temp').textContent = `${json.tempMin }ºC`;
  document.querySelector('#location').textContent = `${json.city }, ${json.country}`;

  const icon = document.querySelector('#icon');
  if (json.icon) {
    icon.src = `https://openweathermap.org/img/wn/${json.icon}@2x.png`;
    icon.alt = json.desc ?? 'Ícone do clima';
  }
}

//Renderiza os Pokemons na Tela
function renderPokemons(pokemonsData) {
  const container = document.querySelector('#pokemons');
  container.innerHTML = '';

  pokemonsData.forEach((pokemon) => {
    const img = document.createElement('img');
    img.src = getAnimatedSprite(pokemon);
    img.classList.add('w-40', 'h-60', 'sm:w-54', 'sm:h-74', 'lg:w-70', 'lg:h-80');
    container.appendChild(img);
  });
}

