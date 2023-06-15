import type {Config} from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: [
		"assets/scripts"
	]
};

export default config;
