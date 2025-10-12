import { apiCall } from './apiCall.js';

const N_BASE_URL = 'https://api.neoncrm.com';

function getNHeaders(config) {
	const N_AUTH = `${config.NEON_API_USER}:${config.NEON_API_KEY}`;
	const N_SIGNATURE = Buffer.from(N_AUTH).toString('base64');
	return {
		'Content-Type': 'application/json',
		Authorization: `Basic ${N_SIGNATURE}`
	}
}

async function getIndividualAccount(neonId, config) {
	const resourcePath = `/v2/accounts/${neonId}`;
	const httpVerb = 'GET';
	const url = N_BASE_URL + resourcePath;

	return await apiCall(httpVerb, url, null, getNHeaders(config));
}

async function* postEventSearch(searchFields, outputFields, config) {
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

		yield await apiCall(httpVerb, url, data, getNHeaders(config));
		page++;
	}
}

async function getEvent(eventId, config) {
	const resourcePath = `/v2/events/${eventId}`;
	const httpVerb = 'GET';
	const url = N_BASE_URL + resourcePath;

	return await apiCall(httpVerb, url, null, getNHeaders(config));
}

async function getActualAttendees(eventId, config) {
	const resourcePath = `/v2/events/${eventId}/eventRegistrations`;
	const httpVerb = 'GET';
	const url = N_BASE_URL + resourcePath;

	let count = 0;

	let response = await apiCall(httpVerb, url, null, getNHeaders(config));
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

async function getCurrentEvents(config) {
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

	for await (const response of postEventSearch(searchFields, outputFields, config)) {
		if (response.pagination.currentPage < response.pagination.totalPages) {
			responseEvents = response.searchResults;
		} else {
			break;
		}

		for (const event of responseEvents) {
			let attendees = event['Registrants'];
			if (attendees !== event['Event Registration Attendee Count']) {
				let eventId = event['Event ID'];
				let actualAttendees = await getActualAttendees(eventId, config);
				event['Actual Registrants'] = actualAttendees;
			} else {
				event['Actual Registrants'] = attendees;
			}

			finalEvents.push(event);
		}
	}

	return finalEvents;
}

async function getInactiveEvents(config) {
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
			value: 'Yes'
		}
	];

	const outputFields = [
		'Event ID'
	];

	let finalEvents = [];
	let responseEvents;

	for await (const response of postEventSearch(searchFields, outputFields, config)) {
		if (response.pagination.currentPage < response.pagination.totalPages) {
			responseEvents = response.searchResults;
		} else {
			break;
		}

		for (const event of responseEvents) {
			let eventId = parseInt(event['Event ID']);

			finalEvents.push(eventId);
		}
	}

	return finalEvents;
}

async function getInfreqEvents(config) {
	const eventIds = [44732, 52117, 27206, 34411, 51547, 46262, 54842];

	const eventInfo = [];

	for (const eventId of eventIds) {
		const event = await getEvent(eventId);

		eventInfo.push(event);
	}

	return eventInfo;
}

export { getCurrentEvents, getIndividualAccount, getInfreqEvents, getInactiveEvents };
