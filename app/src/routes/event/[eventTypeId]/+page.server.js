import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms/server';
import { schema, privateRequestSchema } from '$lib/zodSchemas/schema.js';

/** @type {import('./$types').PageServerLoad} */
export async function load ({params}) {
  // Server API:
  const privateRequestForm = await superValidate(privateRequestSchema, {
    id: 'privateRequestForm',
  });
  const notificationForm = await superValidate(schema, {
    id: 'notificationForm',
  });
  const standardRequestForm = await superValidate(schema, {
    id: 'standardRequestForm',
  });

  const slug = params.eventTypeId;

  // Unless you throw, always return { form } in load and form actions.
  return { privateRequestForm, notificationForm, standardRequestForm, slug };
};

/** @type {import('./$types').Actions} */
export const actions = {
  privateRequest: async ({ request }) => {
    const privateRequestForm = await superValidate(request, privateRequestSchema);

    if (!privateRequestForm.valid) {
      return fail(400, { privateRequestForm });
    }

    // TODO: Do something with the validated form.data

    return message(privateRequestForm, { text: 'You have successfully submitted a private/checkout class request. Check your email for confirmation.' });
  },

  notificationRequest: async ({ request }) => {
    const notificationForm = await superValidate(request, schema, {
      id: 'notificationForm',
    });

    if (!notificationForm.valid) {
      return fail(400, { notificationForm });
    }

    // TODO: Do something with the validated form.data

    return message(notificationForm, { text: 'You have successfully submitted a notification request. Check your email for confirmation.' });
  },

  standardRequest: async ({ request }) => {
    const standardRequestForm = await superValidate(request, schema, {
      id: 'standardRequestForm',
    });

    if (!standardRequestForm.valid) {
      return fail(400, { standardRequestForm });
    }

    // TODO: Do something with the validated form.data

    return message(standardRequestForm, { text: 'You have successfully submitted a class request. Check your email for confirmation.' });
  }
};