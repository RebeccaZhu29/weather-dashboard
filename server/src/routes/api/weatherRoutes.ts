import { Router, type Request, type Response } from 'express';
import weatherService from '../../service/weatherService';
import historyService from '../../service/historyService';
const router = Router();

// import HistoryService from '../../service/historyService.js';
// import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  try {
    const cityName = JSON.parse(req.body).cityName
    const weatherData = await weatherService.getWeatherForCity(cityName)
    res.json(weatherData)
    // TODO: save city to search history
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const savedCities = await historyService.getCities();
    res.json(savedCities);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  try {
    if (!id) {
      res.status(400).json({ msg: 'city id is required' });
    }
    await historyService.removeCity(id)
    res.json({ success: 'City successfully removed from search history' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;
