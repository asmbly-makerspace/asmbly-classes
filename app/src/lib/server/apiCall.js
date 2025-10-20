async function backoffTime(retryCount) {
	/**
	 * Calculates the backoff time for retrying an operation. The backoff time increases exponentially.
	 *
	 * @param {number} retryCount - The number of times the operation has been retried.
	 * @returns {Promise<number>} The calculated backoff time in seconds.
	 */
	const initialDelay = 200 / 1000;
	const waitTime = Math.pow(2, retryCount) * initialDelay;
	return await new Promise((resolve) => setTimeout(resolve, waitTime));
}

async function apiCall(httpVerb, url, data, funcHeaders) {
	const maxRetries = 10;
	// Make request
	const requestHeaders = new Headers(funcHeaders);

	let options = {
		method: httpVerb,
		headers: requestHeaders
	};

	const finalUrl = new URL(url);

	if (data !== null) {
		if (httpVerb === 'GET') {
			for (const [key, value] of Object.entries(data)) {
				finalUrl.searchParams.set(key, value);
			}
		} else {
			options.body = JSON.stringify(data);
		}
	}

	for (let i = 0; i < maxRetries; i++) {
		let result = await fetch(url, options);
		if (result.ok) {
			return await result.json();
		} else if (result.status === 429) {
			await backoffTime(i);
			if (i === maxRetries - 1) {
				console.log('Max retries reached');
				return {
					status: result.status,
					statusText: result.statusText
				}
			}
		} else {
			console.log(`Request failed with status ${result.status}: ${await result.text()}`);
			return {
				status: result.status,
				statusText: result.statusText
			};
		}
	}
}

export { apiCall };
