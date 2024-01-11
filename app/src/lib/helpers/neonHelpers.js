import { apiCall } from '../server/apiCall.js';
import { readFileSync } from 'node:fs';
//import { NEON_API_KEY, NEON_API_USER } from '$lib/server/secrets';
import { NEON_API_KEY, NEON_API_USER } from '$lib/server/secrets';

const dev = process.env.DEVELOPMENT === 'true';

//const NEON_API_KEY = readFileSync(process.env.NEON_APIKEY_FILE, 'utf8');
//const NEON_API_USER = readFileSync(process.env.NEON_USER_FILE, 'utf8');

const N_AUTH = `${NEON_API_USER}:${NEON_API_KEY}`;
const N_BASE_URL = 'https://api.neoncrm.com';
const N_SIGNATURE = Buffer.from(N_AUTH).toString('base64');
const N_HEADERS = {
	'Content-Type': 'application/json',
	Authorization: `Basic ${N_SIGNATURE}`
};

async function getIndividualAccount(neonId) {
	const resourcePath = `/v2/accounts/${neonId}`;
	const httpVerb = 'GET';
	const url = N_BASE_URL + resourcePath;

	return await apiCall(httpVerb, url, null, N_HEADERS);
}

async function* postEventSearch(searchFields, outputFields) {
	const resourcePath = '/v2/events/search';
	const httpVerb = 'POST';
	const url = N_BASE_URL + resourcePath;

	let page = 0;

	while (true) {
		let data = {
			searchFields: searchFields,
			outputFields: outputFields,
			pagination: {
				currentPage: page,
				pageSize: 200
			}
		};

		yield await apiCall(httpVerb, url, data, N_HEADERS);
		page++;
	}
}

async function getActualAttendees(eventId) {
	const resourcePath = `/v2/events/${eventId}/eventRegistrations`;
	const httpVerb = 'GET';
	const url = N_BASE_URL + resourcePath;

	let count = 0;

	let response = await apiCall(httpVerb, url, null, N_HEADERS);
	let registrationList = response.eventRegistrations;
	if (registrationList !== null && registrationList !== undefined) {
		for (const registration of registrationList) {
			const tickets = registration.tickets[0].attendees;
			if (tickets[0].registrationStatus === 'SUCCEEDED') {
				count += tickets.length;
			}
		}
	}

	return count.toString();
}

async function getCurrentEvents() {
	const today = new Date().toISOString().split('T')[0];

	const searchFields = [
		{
			field: 'Event End Date',
			operator: 'GREATER_AND_EQUAL',
			value: `${today}`
		},
		{
			field: 'Event Archived',
			operator: 'EQUAL',
			value: 'No'
		}
	];

	const outputFields = [
		'Event Name',
		'Event Summary',
		'Fee Type',
		'Event Topic',
		'Event Admission Fee',
		'Event Category Name',
		'Event Capacity',
		'Event Start Date',
		'Event End Date',
		'Event Start Time',
		'Event End Time',
		'Registrants',
		'Event Registration Attendee Count',
		'Event ID'
	];

	let finalEvents = [];
	let responseEvents;

	for await (const response of postEventSearch(searchFields, outputFields)) {
		if (response.pagination.currentPage < response.pagination.totalPages) {
			responseEvents = response.searchResults;
		} else {
			break;
		}

		for (const event of responseEvents) {
			let attendees = event.registrants;
			if (attendees !== event['Event Registration Attendee Count']) {
				let eventId = event['Event ID'];
				let actualAttendees = await getActualAttendees(eventId);
				event['Actual Registrants'] = actualAttendees;
			} else {
				event['Actual Registrants'] = attendees;
			}

			finalEvents.push(event);
		}
	}

	return finalEvents;
}

export { getCurrentEvents, getIndividualAccount };
