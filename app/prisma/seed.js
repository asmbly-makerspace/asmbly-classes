import { prisma } from '$lib/db.server';
import { getCurrentEvents } from '$lib/server/neonHelpers.server';

async function getOrCreate(model, where, data) {
  const record = await model.upsert({ 
    where: where,
    update: {},
    create: data
  });
  return record;
}

const currentEvents = await getCurrentEvents();


const BASE_URL = "https://asmbly.app.neoncrm.com/event.jsp?event=";

const deleteCategories = prisma.NeonEventCategory.deleteMany({});
const deleteTeachers = prisma.NeonEventTeacher.deleteMany({});
const deleteLink = prisma.NeonBaseRegLink.deleteMany({});
const deleteEvents = prisma.NeonEventInstance.deleteMany({});
const deleteTypes = prisma.NeonEventType.deleteMany({});

await prisma.$transaction([
  deleteEvents,
  deleteCategories,
  deleteTeachers,
  deleteLink,
  deleteTypes
])

const addBaseRegLink = await prisma.NeonBaseRegLink.create({
  data: {
    url: BASE_URL,
  }
})

let addEvent;

for (const event of currentEvents) {

  let category = event["Event Category Name"];
  let search = { name: category };
  let addCategory = await getOrCreate(prisma.NeonEventCategory, search, search);

  let teacher = event["Event Topic"];
  search = { name: teacher };
  let addTeacher = await getOrCreate(prisma.NeonEventTeacher, search, search);

  const eventCapacity = parseInt(event["Event Capacity"]);
  const eventPrice = parseFloat(event["Event Admission Fee"]);
  const summary = event["Event Summary"];
  const eventName = event["Event Name"].split(" w/ ")[0];
  const startDateTime = event["Event Start Date"] + "T" + event["Event Start Time"] + "Z";
  const endDateTime = event["Event End Date"] + "T" + event["Event End Time"] + "Z";

  let data = {
    capacity: eventCapacity,
    price: eventPrice,
    summary: summary,
    name: eventName
  };

  search = { 
    uniqueEvent: data
  };

  let addEventType = await getOrCreate(prisma.NeonEventType, search, data);

  const updateEventType = await prisma.NeonEventType.update({
    where: {
      id: addEventType.id
    },
    data: {
      teacher: {
        connect: {
          id: addTeacher.id
        }
      },
      category: {
        connect: {
          id: addCategory.id
        }
      }
    }
  });

  addEvent = await prisma.NeonEventInstance.create({
    data: {
      eventId: parseInt(event["Event ID"]),
      attendeeCount: parseInt(event["Actual Registrants"]),
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      eventType: {
        connect: {
          id: addEventType.id
        }
      },
      teacher: {
        connect: {
          id: addTeacher.id
        }
      },
      category: {
        connect: {
          id: addCategory.id
        }
      }
    }
  });

  console.log("Successfully added " + eventName);
}