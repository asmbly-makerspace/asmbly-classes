/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/app.html',
		'./src/routes/**/*.{svelte,js,ts}',
		'./src/lib/components/**/*.{svelte,js,ts}'
	],
	theme: {
		colors: {
			asmbly: {
				DEFAULT: '#2b2c6b',
				hover: '#7f80cb'
			},
			woodwork: {
				DEFAULT: '#f3b61b',
				hover: '#f9da8d'
			},
			metalwork: {
				DEFAULT: '#578bc9',
				hover: '#abc5e4'
			},
			textiles: {
				DEFAULT: '#79ccc4',
				hover: '#bce5e1'
			},
			electronics: {
				DEFAULT: '#00916e',
				hover: '#48ffd3'
			},
			lasers: {
				DEFAULT: '#d33e43',
				hover: '#e99ea1'
			},
			'3dprinting': {
				DEFAULT: '#ee6e23',
				hover: '#f6b691'
			}
		},
		extend: {
			fontFamily: {
				asmbly: ['asmbly', 'sans-serif'],
				sans: ['Roboto', 'sans-serif']
			},
			animation: {
				'gradient-x': 'gradient-x 60s ease-in-out infinite',
				'gradient-y': 'gradient-y 60s ease-in-out infinite',
				'gradient-xy': 'gradient-xy 60s ease-in-out infinite'
			},
			keyframes: {
				'gradient-y': {
					'0%, 100%': {
						'background-size': '400% 400%',
						'background-position': 'center top'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'center center'
					}
				},
				'gradient-x': {
					'0%, 100%': {
						'background-size': '400% 400%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '400% 400%',
						'background-position': 'right center'
					}
				},
				'gradient-xy': {
					'0%, 100%': {
						'background-size': '400% 400%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center'
					}
				}
			}
		}
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
	daisyui: {
		themes: [
			{
				asmbly: {
					primary: '#2b2c6b',
					secondary: '#f2f4ef',
					accent: '#37cdbe',
					neutral: '#3d4451',
					'base-100': '#f2f4ef'
				}
			},
			{
				asmblyDark: {
					primary: '#2b2c6b',
					secondary: '#f2f4ef',
					accent: '#37cdbe',
					neutral: '#7c879c',
					'base-100': '#3d4451'
				}
			}
		]
	},
	mode: 'jit'
};
