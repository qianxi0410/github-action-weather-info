import { Octokit } from 'octokit';
import axios from 'axios';
import { Base64 } from 'js-base64';

import dotenv from 'dotenv';

dotenv.config();

const { GAODE_KEY, GH_TOKEN, CITY_ATCODE } = process.env;

const getWeatherEmoji = weather => {
	const weatherMap = {
		风: [
			'有风',
			'平静',
			'微风',
			'和风',
			'清风',
			'强风/劲风',
			'疾风',
			'大风',
			'烈风',
			'风暴',
			'狂爆风',
			'飓风',
			'热带风暴',
			'龙卷风',
		],
		云: ['少云', '晴间多云', '多云'],
		雪: [
			'雪',
			'阵雪',
			'小雪',
			'中雪',
			'大雪',
			'暴雪',
			'小雪-中雪',
			'中雪-大雪',
			'大雪-暴雪',
			'冷',
		],
		雾: [
			'浮尘',
			'扬沙',
			'沙尘暴',
			'强沙尘暴',
			'雾',
			'浓雾',
			'强浓雾',
			'轻雾',
			'大雾',
			'特强浓雾',
		],
		晴: ['晴', '热'],
		雨夹雪: ['雨雪天气', '雨夹雪', '阵雨夹雪'],
		雨: [
			'阵雨',
			'雷阵雨',
			'雷阵雨并伴有冰雹',
			'小雨',
			'中雨',
			'大雨',
			'暴雨',
			'大暴雨',
			'特大暴雨',
			'强阵雨',
			'强雷阵雨',
			'极端降雨',
			'毛毛雨/细雨',
			'雨',
			'小雨-中雨',
			'中雨-大雨',
			'大雨-暴雨',
			'暴雨-大暴雨',
			'大暴雨-特大暴雨',
			'冻雨',
		],
		阴: ['阴', '霾', '中度霾', '重度霾', '严重霾', '未知'],
	};

	let weatherTag = '';

	for (const key of Object.keys(weatherMap)) {
		if (weatherMap[key].includes(weather)) {
			weatherTag = key;
			break;
		}
	}

	switch (weatherTag) {
		case '风':
			return '🌪️';
		case '云':
			return '☁️';
		case '雪':
			return '❄️';
		case '雾':
			return '🌫️';
		case '晴':
			return '☀️';
		case '雨夹雪':
			return '🌨️';
		case '雨':
			return '🌧️';
		case '阴':
			return '☁️';
		default:
			return '';
	}
};

const getTemperatureEmoji = temperature => {
	if (temperature <= 10) {
		return '🥶';
	} else if (temperature <= 20) {
		return '😬';
	} else if (temperature <= 30) {
		return '🥰';
	} else {
		return '🥵';
	}
};

const getWeatherInfo = async () => {
	const { data } = await axios.get(
		`https://restapi.amap.com/v3/weather/weatherInfo?key=${GAODE_KEY}&city=${CITY_ATCODE}`
	);

	if (data.status !== '1') {
		return null;
	}
	const info = data.lives[0];
	return `${info.city}&nbsp;&nbsp;${info.weather}${getWeatherEmoji(
		info.weather
	)}&nbsp;&nbsp;${info.temperature}℃ ${getTemperatureEmoji(info.temperature)}`;
};

const changeFileContent = async content => {
	const idx = content.indexOf('id="weather"');

	// not found 
	if (idx === -1) {
		return
	}

	// < position
	const idxOfRight = content.indexOf('>', idx);
	// < position
	const idxOfLeft = content.indexOf('<', idxOfRight);
	const leftStr = content.substring(0, idxOfRight + 1);
	const rightStr = content.substring(idxOfLeft);
	const innerStr = await getWeatherInfo();
	return `${leftStr}${innerStr}${rightStr}`;
};

const updateProfile = async () => {
	const octokit = new Octokit({ auth: GH_TOKEN });
	const {
		data: { login },
	} = await octokit.rest.users.getAuthenticated();

	const { data } = await octokit.rest.repos.getContent({
		mediaType: {
			format: 'raw',
		},
		owner: `${login}`,
		repo: `${login}`,
	});

	const metadata = data
		.filter(item => item.name.toLowerCase() === 'readme.md')
		.map(item => ({
			filename: item.name,
			sha: item.sha,
		}))[0];

	const { data: fileContent } = await octokit.rest.repos.getContent({
		mediaType: {
			format: 'raw',
		},
		owner: `${login}`,
		repo: `${login}`,
		path: metadata.filename,
	});

	const content = await changeFileContent(fileContent);

	if (!content) {
		return;
	}

	await octokit.rest.repos.createOrUpdateFileContents({
		mediaType: {
			format: 'raw',
		},
		owner: `${login}`,
		repo: `${login}`,
		path: `${metadata.filename}`,
		message: '[weather action]: update weather info',
		sha: metadata.sha,
		content: Base64.encode(content),
		committer: {
			name: 'Weather Action',
			email: 'action@github.com',
		},
	});
};

updateProfile();
