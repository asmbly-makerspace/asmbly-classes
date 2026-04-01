import { DateTime } from 'luxon';

let allClasses = new Set();
let allImages = null;
let classToImage = new Map();

// Print out mismatched images and classes, for debugging
export function printClasses() {
  const cleanImage = img => img.split('/').at('-1');
  const matchedImages = new Set();
  let s = '\nClass\tImage\n';
  for (const c of allClasses) {
    const img = classToImage.get(c);
    s += `${c}\t${cleanImage(img ?? 'missing')}\n`;
    matchedImages.add(img);
  }
  for (const img of allImages) {
    if (
      !matchedImages.has(img) &&
      !img.includes('Default') &&
      !img.includes('Neon')
    ) {
      s += `missing\t${cleanImage(img)}\n`;
    }
  }
  console.log(s);
}

export default class NeonEventInstance {
	constructor (instance, eventType) {
		this.eventId = instance.eventId
		this.attendees = instance.attendeeCount || instance.attendees || 0
		this.teacher = instance.teacher.name || instance.teacher
		this.startDateTime = DateTime.fromJSDate(instance.startDateTime).setZone("America/Chicago")
		this.endDateTime = DateTime.fromJSDate(instance.endDateTime).setZone("America/Chicago")
		this.price = instance.price
		this.summary = instance.summary
		this.capacity = instance.capacity
		this.category =  eventType.category
		this.name = eventType.name
		this.typeId = eventType.typeId
		this.isPast = instance.startDateTime < DateTime.now()
		this.isFull = this.attendees >= this.capacity
	}

	get classUrl() {
		return `?eventId=${this.eventId}`
	}

	toJson() {
		return {
			...this,
			startDateTime: this.startDateTime.toJSDate(),
			endDateTime: this.endDateTime.toJSDate()
		}
	}

	isAvailable() {
		return !this.isPast
	}

	compare(o, type, sortAscending) {
		let sort = 0;
		switch(type){
		case 'Date':
			sort = this.isPast * 1 + o.isPast * -1
			if (!sort) {
				sort = this.startDateTime - o.startDateTime
				if (Math.abs(sort) < 1000) sort = 0;
			}
			break;
		case 'Price':
			sort = this.price - o.price;
			break
		}

		if (!sort) {
			sort = this.name.toLowerCase().localeCompare(o.name.toLowerCase())
		}

		if (!sortAscending) {
			sort *= -1
		}

		return sort
	}

	getClassImage(classImages) {
		if (allImages == null) {
		  allImages = new Set(Object.keys(classImages));
		}
		allClasses.add(this.name);

		const simplifyName = s => 
      s.toLowerCase()
        .replace(/(\s|:|-|_)+/g, '')
        .replace('&', 'and')
        .split('/').at(-1)
        .split('.')[0];

		const simpleName = simplifyName(this.name);
		let result = null;
		for (const [key, value] of Object.entries(classImages)) {
		  if (simplifyName(key) === simpleName) {
		    classToImage.set(this.name, key);
		    return value.default;
		  }
		}

		let imagePath;
		switch (this.category) {
		  case 'Laser Cutting':
		    imagePath = '/src/lib/images/lasersDefault.jpg';
		    break;
		  default:
		    const imgPath = this.category.replace(' ', '').toLowerCase()
		    imagePath = `/src/lib/images/${imgPath}Default.jpg`;
		    break;
		}
		if (!(imagePath in classImages)) {
		  imagePath = '/src/lib/images/classDefault.jpg';
		}

		return classImages[imagePath].default;
	}
}
